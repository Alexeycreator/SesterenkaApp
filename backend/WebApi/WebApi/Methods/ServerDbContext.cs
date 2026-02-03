using Microsoft.EntityFrameworkCore;
using WebApi.Models.DataBase;

namespace WebApi.Methods;

public sealed class ServerDbContext : DbContext
{
    public DbSet<ClientModel> Clients { get; set; }
    public DbSet<AddressModel> Addresses { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(
            $@"Server=(local)\SQLEXPRESS;Database=ShesterenkaApp;Trusted_Connection=True;TrustServerCertificate=True;");
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<ClientModel>().HasIndex(c => c.Login).IsUnique();
        builder.Entity<ClientModel>().HasIndex(c => c.NumberPhone).IsUnique();
    }
}