using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using WebApi.Methods;
using WebApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "My API",
        Version = "v1",
        Description = "API для приложения"
    });
});

string? connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ServerDbContext>(options => options.UseSqlServer(connectionString));

builder.Services.AddHostedService<DatabaseInitializerBackgroundService>(provaider =>
    new DatabaseInitializerBackgroundService(connectionString));
builder.Services.AddHostedService<DatabaseBackupBackgroundService>(provaider =>
    new DatabaseBackupBackgroundService(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
        c.RoutePrefix = string.Empty;
        c.DisplayRequestDuration();
    });
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
//app.UseStaticFiles();
app.UseRouting();
app.UseCors("ReactApp");
app.UseAuthorization();

app.MapControllers();

app.Run();