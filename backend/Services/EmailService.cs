using backend.Config;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace backend.Services;

public class EmailService
{
    private readonly EmailSettings _settings;

    public EmailService(IOptions<EmailSettings> settings)
    {
        _settings = settings.Value;
    }

    public async Task SendVerificationEmailAsync(string toEmail, string verifyLink)
    {
        var subject = "Verifica tu cuenta en OrbiStay";
        var html = $"""
        <div style='font-family:Segoe UI,Arial,sans-serif;padding:18px;color:#0b1d14'>
            <h2 style='margin:0 0 8px;color:#2ea66d'>Activa tu cuenta</h2>
            <p>Gracias por registrarte en OrbiStay. Haz clic en el boton para verificar tu correo:</p>
            <p style='margin:20px 0'>
                <a href='{verifyLink}' style='background:#2ea66d;color:#fff;padding:12px 16px;border-radius:8px;text-decoration:none;font-weight:600'>Verificar cuenta</a>
            </p>
            <p style='color:#4b6357'>Si no solicitaste este registro, puedes ignorar este mensaje.</p>
        </div>
        """;

        await SendAsync(toEmail, subject, html);
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
    {
        var subject = "Recuperacion de contrasena - OrbiStay";
        var html = $"""
        <div style='font-family:Segoe UI,Arial,sans-serif;padding:18px;color:#0b1d14'>
            <h2 style='margin:0 0 8px;color:#2ea66d'>Restablece tu contrasena</h2>
            <p>Recibimos una solicitud para recuperar acceso a tu cuenta.</p>
            <p style='margin:20px 0'>
                <a href='{resetLink}' style='background:#2ea66d;color:#fff;padding:12px 16px;border-radius:8px;text-decoration:none;font-weight:600'>Cambiar contrasena</a>
            </p>
            <p style='color:#4b6357'>Este enlace expira en 30 minutos.</p>
        </div>
        """;

        await SendAsync(toEmail, subject, html);
    }

    public async Task SendBookingConfirmationEmailAsync(
        string toEmail,
        string bookingId,
        string propertyTitle,
        string propertyLocation,
        DateTime checkIn,
        DateTime checkOut,
        int nights,
        decimal total,
        string currency)
    {
        var subject = "Confirmacion de reserva - OrbiStay";
        var html = $"""
        <div style='font-family:Segoe UI,Arial,sans-serif;padding:18px;color:#0b1d14'>
            <h2 style='margin:0 0 8px;color:#2ea66d'>Tu reserva esta confirmada</h2>
            <p>Gracias por reservar con OrbiStay. Aqui tienes el detalle:</p>
            <table style='width:100%;border-collapse:collapse;margin:16px 0;background:#f4fbf7'>
                <tr><td style='padding:8px;border:1px solid #d8ebe1'><strong>Codigo</strong></td><td style='padding:8px;border:1px solid #d8ebe1'>{bookingId}</td></tr>
                <tr><td style='padding:8px;border:1px solid #d8ebe1'><strong>Hotel</strong></td><td style='padding:8px;border:1px solid #d8ebe1'>{propertyTitle}</td></tr>
                <tr><td style='padding:8px;border:1px solid #d8ebe1'><strong>Ubicacion</strong></td><td style='padding:8px;border:1px solid #d8ebe1'>{propertyLocation}</td></tr>
                <tr><td style='padding:8px;border:1px solid #d8ebe1'><strong>Entrada</strong></td><td style='padding:8px;border:1px solid #d8ebe1'>{checkIn:dd/MM/yyyy}</td></tr>
                <tr><td style='padding:8px;border:1px solid #d8ebe1'><strong>Salida</strong></td><td style='padding:8px;border:1px solid #d8ebe1'>{checkOut:dd/MM/yyyy}</td></tr>
                <tr><td style='padding:8px;border:1px solid #d8ebe1'><strong>Noches</strong></td><td style='padding:8px;border:1px solid #d8ebe1'>{nights}</td></tr>
                <tr><td style='padding:8px;border:1px solid #d8ebe1'><strong>Total</strong></td><td style='padding:8px;border:1px solid #d8ebe1'>{total} {currency}</td></tr>
            </table>
            <p style='color:#4b6357'>Te esperamos. Si tienes dudas, responde a este correo.</p>
        </div>
        """;

        await SendAsync(toEmail, subject, html);
    }

    private async Task SendAsync(string toEmail, string subject, string htmlBody)
    {
        ValidateSettings();

        using var message = new MailMessage();
        message.From = new MailAddress(_settings.SenderEmail, _settings.SenderName);
        message.To.Add(toEmail);
        message.Subject = subject;
        message.Body = htmlBody;
        message.IsBodyHtml = true;

        using var smtp = new SmtpClient(_settings.Host, _settings.Port)
        {
            Credentials = new NetworkCredential(_settings.Username, _settings.Password),
            EnableSsl = _settings.UseSsl
        };

        await smtp.SendMailAsync(message);
    }

    private void ValidateSettings()
    {
        var hasPlaceholders = _settings.SenderEmail.Contains("tu-correo", StringComparison.OrdinalIgnoreCase)
            || _settings.Username.Contains("tu-correo", StringComparison.OrdinalIgnoreCase)
            || string.Equals(_settings.Password, "TU_APP_PASSWORD", StringComparison.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(_settings.Host)
            || string.IsNullOrWhiteSpace(_settings.SenderEmail)
            || string.IsNullOrWhiteSpace(_settings.Username)
            || string.IsNullOrWhiteSpace(_settings.Password)
            || hasPlaceholders)
        {
            throw new InvalidOperationException("Configura EmailSettings con credenciales SMTP reales para enviar correos.");
        }
    }
}
