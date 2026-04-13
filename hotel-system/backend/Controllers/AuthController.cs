using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserService _users;
    private readonly EmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public AuthController(UserService users, EmailService emailService, IConfiguration configuration, IWebHostEnvironment environment)
    {
        _users = users;
        _emailService = emailService;
        _configuration = configuration;
        _environment = environment;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (!IsStrongPassword(request.Password))
        {
            return BadRequest("La contrasena debe tener al menos 8 caracteres, incluyendo letras y numeros.");
        }

        var existing = await _users.GetByEmailAsync(email);
        if (existing != null)
        {
            return BadRequest("Ya existe una cuenta con ese correo.");
        }

        var user = new User
        {
            Email = email,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role?.Trim().ToLowerInvariant() == "owner" ? "owner" : "user",
            IsVerified = false,
            VerificationToken = Guid.NewGuid().ToString("N")
        };

        await _users.CreateAsync(user);

        var frontendBaseUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
        var verifyLink = $"{frontendBaseUrl}/verify/{user.VerificationToken}";
        Console.WriteLine($"VERIFY LINK: {verifyLink}");

        try
        {
            await _emailService.SendVerificationEmailAsync(user.Email, verifyLink);
        }
        catch (Exception ex)
        {
            if (_environment.IsDevelopment())
            {
                return Ok(new
                {
                    message = "Cuenta creada. No se pudo enviar correo automatico, usa el enlace de verificacion en desarrollo.",
                    verificationLink = verifyLink,
                    emailWarning = ex.Message
                });
            }

            return StatusCode(500, "No se pudo enviar el correo de verificacion. Revisa la configuracion SMTP.");
        }

        return Ok(new
        {
            message = "Usuario registrado. Verifica tu correo para poder iniciar sesion.",
            verificationLink = _environment.IsDevelopment() ? verifyLink : null
        });
    }

    [AllowAnonymous]
    [HttpGet("verify/{token}")]
    public async Task<IActionResult> Verify(string token)
    {
        var user = await _users.GetByVerificationTokenAsync(token);

        if (user == null)
        {
            return BadRequest("Token invalido o expirado.");
        }

        user.IsVerified = true;
        user.VerificationToken = null;

        await _users.UpdateAsync(user);

        return Ok("Cuenta verificada correctamente.");
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _users.GetByEmailAsync(email);

        if (user == null)
        {
            return BadRequest("Credenciales invalidas.");
        }

        var isValidHash = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);

        // Migracion transparente: si algun usuario antiguo tenia contrasena plana, se re-hashea.
        if (!isValidHash && user.Password == request.Password)
        {
            user.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
            await _users.UpdateAsync(user);
            isValidHash = true;
        }

        if (!isValidHash)
        {
            return BadRequest("Credenciales invalidas.");
        }

        if (!user.IsVerified)
        {
            return BadRequest("Debes verificar tu correo antes de iniciar sesion.");
        }

        var token = GenerateJwtToken(user);
        return Ok(new AuthResponse
        {
            Token = token,
            UserId = user.Id ?? string.Empty,
            Email = user.Email,
            Role = user.Role
        });
    }

    [AllowAnonymous]
    [HttpPost("forgot")]
    public async Task<IActionResult> Forgot([FromBody] ForgotPasswordRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _users.GetByEmailAsync(email);

        // Siempre responder OK para no filtrar si existe o no el correo.
        if (user == null)
        {
            return Ok(new { message = "Si el correo existe, recibira instrucciones para recuperar su contrasena." });
        }

        user.ResetToken = Guid.NewGuid().ToString("N");
        user.ResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(30);

        await _users.UpdateAsync(user);

        var frontendBaseUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
        var resetLink = $"{frontendBaseUrl}/reset/{user.ResetToken}";
        Console.WriteLine($"RESET LINK: {resetLink}");

        try
        {
            await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink);
        }
        catch (Exception ex)
        {
            if (_environment.IsDevelopment())
            {
                return Ok(new
                {
                    message = "No se pudo enviar correo automatico. Usa el enlace de recuperacion en desarrollo.",
                    resetLink,
                    emailWarning = ex.Message
                });
            }

            return StatusCode(500, "No se pudo enviar el correo de recuperacion. Revisa la configuracion SMTP.");
        }

        return Ok(new
        {
            message = "Si el correo existe, recibira instrucciones para recuperar su contrasena.",
            resetLink = _environment.IsDevelopment() ? resetLink : null
        });
    }

    [AllowAnonymous]
    [HttpPost("reset")]
    public async Task<IActionResult> Reset([FromBody] ResetPasswordRequest request)
    {
        if (!IsStrongPassword(request.Password))
        {
            return BadRequest("La contrasena debe tener al menos 8 caracteres, incluyendo letras y numeros.");
        }

        var user = await _users.GetByResetTokenAsync(request.Token);

        if (user == null || user.ResetTokenExpiresAt == null || user.ResetTokenExpiresAt < DateTime.UtcNow)
        {
            return BadRequest("Token invalido o expirado.");
        }

        user.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
        user.ResetToken = null;
        user.ResetTokenExpiresAt = null;

        await _users.UpdateAsync(user);

        return Ok("Contrasena actualizada correctamente.");
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "user";

        return Ok(new { userId, email, role });
    }

    private string GenerateJwtToken(User user)
    {
        var key = _configuration["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new InvalidOperationException("Falta configurar Jwt:Key en appsettings.json");
        }

        var issuer = _configuration["Jwt:Issuer"] ?? "hotel-system";
        var audience = _configuration["Jwt:Audience"] ?? "hotel-system-client";

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static bool IsStrongPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
        {
            return false;
        }

        var hasLetter = password.Any(char.IsLetter);
        var hasDigit = password.Any(char.IsDigit);
        return hasLetter && hasDigit;
    }
}
