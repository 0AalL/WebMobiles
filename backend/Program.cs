using backend.Config;
using backend.Services;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

//  Cargar variables del .env
Env.Load();

// Sobrescribir configuración desde .env
builder.Configuration["DatabaseSettings:ConnectionString"] =
    Environment.GetEnvironmentVariable("MONGO_CONNECTION");

builder.Configuration["DatabaseSettings:DatabaseName"] =
    Environment.GetEnvironmentVariable("MONGO_DATABASE");

builder.Configuration["Jwt:Key"] =
    Environment.GetEnvironmentVariable("JWT_KEY");

builder.Configuration["Jwt:Issuer"] =
    Environment.GetEnvironmentVariable("JWT_ISSUER");

builder.Configuration["Jwt:Audience"] =
    Environment.GetEnvironmentVariable("JWT_AUDIENCE");

builder.Configuration["Frontend:BaseUrl"] =
    Environment.GetEnvironmentVariable("FRONTEND_URL");

builder.Configuration["EmailSettings:Host"] =
    Environment.GetEnvironmentVariable("EMAIL_HOST");

builder.Configuration["EmailSettings:Port"] =
    Environment.GetEnvironmentVariable("EMAIL_PORT");

builder.Configuration["EmailSettings:SenderName"] =
    Environment.GetEnvironmentVariable("EMAIL_SENDER_NAME");

builder.Configuration["EmailSettings:SenderEmail"] =
    Environment.GetEnvironmentVariable("EMAIL_SENDER_EMAIL");

builder.Configuration["EmailSettings:Username"] =
    Environment.GetEnvironmentVariable("EMAIL_USERNAME");

builder.Configuration["EmailSettings:Password"] =
    Environment.GetEnvironmentVariable("EMAIL_PASSWORD");

builder.Configuration["EmailSettings:UseSsl"] =
    Environment.GetEnvironmentVariable("EMAIL_USE_SSL");

//  Config Mongo
builder.Services.Configure<DatabaseSettings>(
    builder.Configuration.GetSection("DatabaseSettings"));

builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

// Servicios
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<EmailService>();
builder.Services.AddSingleton<RoomService>();
builder.Services.AddSingleton<PropertyService>();
builder.Services.AddSingleton<BookingService>();

//  Controllers
builder.Services.AddControllers();

var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("Falta configurar JWT_KEY en el archivo .env");
}

// JWT Auth
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey))
        };
    });

//  Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
var frontendUrl = builder.Configuration["Frontend:BaseUrl"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(frontendUrl!)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Swagger Dev
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();