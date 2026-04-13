using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserService _service;

        public UserController(UserService service)
        {
            _service = service;
        }

        [HttpGet("public/{id}")]
        public async Task<IActionResult> GetPublicHostProfile(string id)
        {
            var user = await _service.GetPublicHostByIdAsync(id);
            if (user == null)
                return NotFound("Host no encontrado.");

            return Ok(new
            {
                userId = user.Id,
                fullName = user.FullName,
                bio = user.Bio,
                phone = user.Phone,
                city = user.City,
                avatarUrl = user.AvatarUrl,
                email = user.Email
            });
        }

        [Authorize(Roles = "owner")]
        [HttpPut("owner/profile")]
        public async Task<IActionResult> UpdateOwnerProfile([FromBody] HostProfileUpdateRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("Sesion invalida.");

            var user = await _service.GetByIdAsync(userId);
            if (user == null)
                return NotFound("Usuario no encontrado.");

            user.FullName = request.FullName?.Trim() ?? string.Empty;
            user.Phone = request.Phone?.Trim() ?? string.Empty;
            user.Bio = request.Bio?.Trim() ?? string.Empty;
            user.City = request.City?.Trim() ?? string.Empty;
            user.AvatarUrl = request.AvatarUrl?.Trim() ?? string.Empty;

            await _service.UpdateAsync(user);

            return Ok(new
            {
                userId = user.Id,
                fullName = user.FullName,
                bio = user.Bio,
                phone = user.Phone,
                city = user.City,
                avatarUrl = user.AvatarUrl,
                email = user.Email
            });
        }
    }
}