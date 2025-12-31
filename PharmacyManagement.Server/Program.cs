using Microsoft.IdentityModel.Tokens;
using PharmacyManagement.Server.DataAccess;
using PharmacyManagement.Server;
using PharmacyManagement.Server.Jwt;
using PharmacyManagement.Server.Repositories.Authenticate;
using PharmacyManagement.Server.Repositories.Customer;
using PharmacyManagement.Server.Repositories.Manager;
using PharmacyManagement.Server.Repositories.Pharmacist;
using PharmacyManagement.Server.Repositories.Settings;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddTransient<ISqlDataAccess, SqlDataAccess>();
builder.Services.AddTransient<IPharmacistRepository, PharmacistRepository>();
builder.Services.AddTransient<IManagerRepository, ManagerRepository>();
builder.Services.AddTransient<ICustomerRepository, CustomerRepository>();
builder.Services.AddTransient<IAuthenticateUsers, AuthenticateUsers>();
builder.Services.AddTransient<ISettingsRepositories,SettingsRepositories>();
builder.Services.AddScoped<EmailService>();

builder.Services.AddScoped<IPharmacistRepository, PharmacistRepository>();

builder.Services.AddSingleton<JwtHelper>();

builder.Services.AddAuthentication("Bearer") //this tells asp that i use authentication beater and tokens will be sent 
    .AddJwtBearer("Bearer", options =>
    {
        //this are the rules used to validate a token sent by a user to ensure that its created her
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

// 🔽 Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendDev", policy =>
    {
        policy.WithOrigins("https://localhost:53581") // Frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
   
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 🔽 Use the CORS policy before authorization
app.UseCors("AllowFrontendDev");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();
