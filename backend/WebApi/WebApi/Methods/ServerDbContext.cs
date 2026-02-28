using Microsoft.EntityFrameworkCore;
using WebApi.Models.DataBase;

namespace WebApi.Methods;

public sealed class ServerDbContext(DbContextOptions<ServerDbContext> options) : DbContext(options)
{
    public DbSet<ClientsModel> Clients { get; set; }
    public DbSet<AddressesModel> Addresses { get; set; }
    public DbSet<CarModelsModel> CarModels { get; set; }
    public DbSet<CarBrandsModel> CarBrands { get; set; }
    public DbSet<CarModificationsModel> CarModifications { get; set; }
    public DbSet<CategoriesModel> Categories { get; set; }
    public DbSet<EmployeesModel> Employees { get; set; }
    public DbSet<ManufacturersModel> Manufacturers { get; set; }
    public DbSet<OrdersModel> Orders { get; set; }
    public DbSet<OrderItemsModel> OrderItems { get; set; }
    public DbSet<ProductCarApplicabilityModel> ProductCarApplicability { get; set; }
    public DbSet<ProductsModel> Products { get; set; }
    public DbSet<StocksModel> Stocks { get; set; }
    public DbSet<WarehousesModel> Warehouses { get; set; }
    public DbSet<WarehousesAddressesModel> WarehousesAddresses { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<ClientsModel>().HasIndex(c => new { c.SecondName, c.FirstName, c.SurName })
            .HasDatabaseName("IX_Clients_FullName");
        builder.Entity<ClientsModel>().HasIndex(c => c.PhoneNumber)
            .HasDatabaseName("IX_Clients_PhoneNumber")
            .IsUnique();
        builder.Entity<ClientsModel>().HasIndex(c => c.Email)
            .HasDatabaseName("IX_Clients_Email")
            .IsUnique();
        builder.Entity<ClientsModel>().HasIndex(c => c.LoginClient)
            .HasDatabaseName("IX_Clients_Login")
            .IsUnique();

        builder.Entity<AddressesModel>().HasIndex(a => new { a.City, a.Region, a.Street, a.House })
            .HasDatabaseName("IX_Addresses_FullAddress")
            .IsUnique();

        builder.Entity<CarModelsModel>().HasIndex(cm => cm.Name)
            .HasDatabaseName("IX_CarModels_Name")
            .IsUnique();

        builder.Entity<CarBrandsModel>().HasIndex(cb => cb.Name)
            .HasDatabaseName("IX_CarBrands_Name")
            .IsUnique();

        builder.Entity<CarModificationsModel>().HasIndex(cmod => new
            {
                cmod.Engine, cmod.EngineSize, cmod.Transmission, cmod.Drive, cmod.Body, cmod.YearStart, cmod.YearEnd
            })
            .HasDatabaseName("IX_CarModifications_FullModification");

        builder.Entity<CategoriesModel>().HasIndex(cat => cat.Name)
            .HasDatabaseName("IX_Categories_Name")
            .IsUnique();

        builder.Entity<EmployeesModel>().HasIndex(e => new { e.SecondName, e.FirstName, e.SurName })
            .HasDatabaseName("IX_Employees_FullName");
        builder.Entity<EmployeesModel>().HasIndex(e => e.PhoneNumber)
            .HasDatabaseName("IX_Employees_PhoneNumber")
            .IsUnique();
        builder.Entity<EmployeesModel>().HasIndex(e => e.LoginEmployee)
            .HasDatabaseName("IX_Employees_Login")
            .IsUnique();
        builder.Entity<EmployeesModel>().HasIndex(e => e.Email)
            .HasDatabaseName("IX_Employees_Email")
            .IsUnique();
        builder.Entity<EmployeesModel>().HasIndex(e => e.Position)
            .HasDatabaseName("IX_Employees_Position");

        builder.Entity<ManufacturersModel>().HasIndex(m => m.Name)
            .HasDatabaseName("IX_Manufacturers_Name")
            .IsUnique();

        builder.Entity<OrdersModel>().HasIndex(o => o.OrderDate)
            .HasDatabaseName("IX_Orders_OrderDate");
        builder.Entity<OrdersModel>().HasIndex(o => o.Status)
            .HasDatabaseName("IX_Orders_Status");

        builder.Entity<OrderItemsModel>().HasIndex(oi => oi.PriceAtMoment)
            .HasDatabaseName("IX_OrderItems_PriceAtMoment");
        builder.Entity<OrderItemsModel>().HasIndex(oi => oi.Quantity)
            .HasDatabaseName("IX_OrderItems_Quantity");

        builder.Entity<ProductsModel>().HasIndex(p => p.PartNumber)
            .HasDatabaseName("IX_Products_PartNumber")
            .IsUnique();
        builder.Entity<ProductsModel>().HasIndex(p => p.Name)
            .HasDatabaseName("IX_Products_Name");
        builder.Entity<ProductsModel>().HasIndex(p => p.Price)
            .HasDatabaseName("IX_Products_Price");

        builder.Entity<StocksModel>().HasIndex(s => s.Quantity)
            .HasDatabaseName("IX_Stocks_Qantity");

        builder.Entity<WarehousesModel>().HasIndex(w => w.Type)
            .HasDatabaseName("IX_Warehouses_Type");
        builder.Entity<WarehousesModel>().HasIndex(w => w.IsActive)
            .HasDatabaseName("IX_Warehouses_IsActive");
        builder.Entity<WarehousesModel>().HasIndex(w => new { w.Code, w.Name })
            .HasDatabaseName("IX_Warehouses_CodeName")
            .IsUnique();
    }
}