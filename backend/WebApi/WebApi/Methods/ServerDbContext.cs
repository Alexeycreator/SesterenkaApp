using Microsoft.EntityFrameworkCore;
using WebApi.Models.DataBase;

namespace WebApi.Methods;

public sealed class ServerDbContext(DbContextOptions<ServerDbContext> options) : DbContext(options)
{
    public DbSet<UsersModel> Users { get; set; }
    public DbSet<AddressesModel> Addresses { get; set; }
    public DbSet<CarModelsModel> CarModels { get; set; }
    public DbSet<CarBrandsModel> CarBrands { get; set; }
    public DbSet<CarModificationsModel> CarModifications { get; set; }
    public DbSet<CategoriesModel> Categories { get; set; }
    public DbSet<ManufacturersModel> Manufacturers { get; set; }
    public DbSet<OrdersModel> Orders { get; set; }
    public DbSet<OrderItemsModel> OrderItems { get; set; }
    public DbSet<ProductCarApplicabilityModel> ProductCarApplicability { get; set; }
    public DbSet<ProductsModel> Products { get; set; }
    public DbSet<StocksModel> Stocks { get; set; }
    public DbSet<WarehousesModel> Warehouses { get; set; }
    public DbSet<WarehousesAddressesModel> WarehousesAddresses { get; set; }
    public DbSet<InformationsModel> Informations { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        #region IX_Users

        builder.Entity<UsersModel>().HasIndex(c => new { c.SecondName, c.FirstName, c.SurName })
            .HasDatabaseName("IX_Users_FullName");
        builder.Entity<UsersModel>().HasIndex(c => c.SecondName)
            .HasDatabaseName("IX_Users_SecondName");
        builder.Entity<UsersModel>().HasIndex(c => c.FirstName)
            .HasDatabaseName("IX_Users_FirstName");
        builder.Entity<UsersModel>().HasIndex(c => c.SurName)
            .HasDatabaseName("IX_Users_SurName");
        builder.Entity<UsersModel>().HasIndex(c => c.PhoneNumber)
            .HasDatabaseName("IX_Users_PhoneNumber")
            .IsUnique();
        builder.Entity<UsersModel>().HasIndex(c => c.Email)
            .HasDatabaseName("IX_Users_Email")
            .IsUnique();
        builder.Entity<UsersModel>().HasIndex(c => c.Login)
            .HasDatabaseName("IX_Users_Login")
            .IsUnique();
        builder.Entity<UsersModel>().HasIndex(c => c.Gender)
            .HasDatabaseName("IX_Users_Gender");
        builder.Entity<UsersModel>().HasIndex(c => c.Birthday)
            .HasDatabaseName("IX_Users_Birthday");
        builder.Entity<UsersModel>().HasIndex(c => c.Age)
            .HasDatabaseName("IX_Users_Age");
        builder.Entity<UsersModel>().HasIndex(c => c.Position)
            .HasDatabaseName("IX_Users_Position");
        builder.Entity<UsersModel>().HasIndex(c => c.Role)
            .HasDatabaseName("IX_Users_Role");

        #endregion

        #region IX_Addresses

        builder.Entity<AddressesModel>().HasIndex(a => new { a.Region, a.City, a.Street, a.House })
            .HasDatabaseName("IX_Addresses_FullAddress")
            .IsUnique();
        builder.Entity<AddressesModel>().HasIndex(a => a.Region)
            .HasDatabaseName("IX_Addresses_Region");
        builder.Entity<AddressesModel>().HasIndex(a => a.City)
            .HasDatabaseName("IX_Addresses_City");
        builder.Entity<AddressesModel>().HasIndex(a => a.Street)
            .HasDatabaseName("IX_Addresses_Street");
        builder.Entity<AddressesModel>().HasIndex(a => a.House)
            .HasDatabaseName("IX_Addresses_House");
        builder.Entity<AddressesModel>().HasIndex(a => a.IsShop)
            .HasDatabaseName("IX_Addresses_IsShop");

        #endregion

        #region IX_CarModels

        builder.Entity<CarModelsModel>().HasIndex(cm => cm.Name)
            .HasDatabaseName("IX_CarModels_Name");

        #endregion

        #region IX_CarBrands

        builder.Entity<CarBrandsModel>().HasIndex(cb => cb.Name)
            .HasDatabaseName("IX_CarBrands_Name")
            .IsUnique();

        #endregion

        #region IX_CarModifications

        builder.Entity<CarModificationsModel>().HasIndex(cmod => new
            {
                cmod.Engine, cmod.EngineSize, cmod.Transmission, cmod.Drive, cmod.Body, cmod.YearStart, cmod.YearEnd
            })
            .HasDatabaseName("IX_CarModifications_FullModification");

        #endregion

        #region IX_Categories

        builder.Entity<CategoriesModel>().HasIndex(cat => cat.Name)
            .HasDatabaseName("IX_Categories_Name")
            .IsUnique();
        builder.Entity<CategoriesModel>().HasIndex(cat => cat.Icon)
            .HasDatabaseName("IX_Categories_Icon");
        builder.Entity<CategoriesModel>().HasIndex(cat => cat.Description)
            .HasDatabaseName("IX_Categories_Description");

        #endregion

        #region IX_Manufacturers

        builder.Entity<ManufacturersModel>().HasIndex(m => m.Name)
            .HasDatabaseName("IX_Manufacturers_Name")
            .IsUnique();

        #endregion

        #region IX_Orders

        builder.Entity<OrdersModel>().HasIndex(o => o.OrderDate)
            .HasDatabaseName("IX_Orders_OrderDate");
        builder.Entity<OrdersModel>().HasIndex(o => o.Status)
            .HasDatabaseName("IX_Orders_Status");
        builder.Entity<OrdersModel>().HasIndex(o => o.NameOrder)
            .HasDatabaseName("IX_Orders_NameOrder");
        builder.Entity<OrdersModel>().HasIndex(o => o.Addresses_Id)
            .HasDatabaseName("IX_Orders_Addresses_Id");
        builder.Entity<OrdersModel>().HasIndex(o => o.Users_Id)
            .HasDatabaseName("IX_Orders_Users_Id");

        #endregion

        #region IX_OrderItems

        builder.Entity<OrderItemsModel>().HasIndex(oi => oi.PriceAtMoment)
            .HasDatabaseName("IX_OrderItems_PriceAtMoment");
        builder.Entity<OrderItemsModel>().HasIndex(oi => oi.Quantity)
            .HasDatabaseName("IX_OrderItems_Quantity");
        builder.Entity<OrderItemsModel>().HasIndex(oi => oi.Orders_Id)
            .HasDatabaseName("IX_OrderItems_Orders_Id");
        builder.Entity<OrderItemsModel>().HasIndex(oi => oi.Products_Id)
            .HasDatabaseName("IX_OrderItems_Products_Id");

        #endregion

        #region IX_Products

        builder.Entity<ProductsModel>().HasIndex(p => p.PartNumber)
            .HasDatabaseName("IX_Products_PartNumber")
            .IsUnique();
        builder.Entity<ProductsModel>().HasIndex(p => p.Name)
            .HasDatabaseName("IX_Products_Name");
        builder.Entity<ProductsModel>().HasIndex(p => p.Price)
            .HasDatabaseName("IX_Products_Price");
        builder.Entity<ProductsModel>().HasIndex(p => p.Details)
            .HasDatabaseName("IX_Products_Details");
        builder.Entity<ProductsModel>().HasIndex(p => p.Image)
            .HasDatabaseName("IX_Products_Image");
        builder.Entity<ProductsModel>().HasIndex(p => p.Categories_Id)
            .HasDatabaseName("IX_Products_Categories_Id)");
        builder.Entity<ProductsModel>().HasIndex(p => p.Manufacturers_Id)
            .HasDatabaseName("IX_Products_Manufacturers_Id");

        #endregion

        #region IX_Stocks

        builder.Entity<StocksModel>().HasIndex(s => s.Quantity)
            .HasDatabaseName("IX_Stocks_Quantity");
        builder.Entity<StocksModel>().HasIndex(s => s.Products_Id)
            .HasDatabaseName("IX_Stocks_Products_Id");
        builder.Entity<StocksModel>().HasIndex(s => s.Warehouses_Id)
            .HasDatabaseName("IX_Stocks_Warehouses_Id");

        #endregion

        #region IX_Warehouses

        builder.Entity<WarehousesModel>().HasIndex(w => w.Type)
            .HasDatabaseName("IX_Warehouses_Type");
        builder.Entity<WarehousesModel>().HasIndex(w => w.IsActive)
            .HasDatabaseName("IX_Warehouses_IsActive");
        builder.Entity<WarehousesModel>().HasIndex(w => new { w.Code, w.Name })
            .HasDatabaseName("IX_Warehouses_CodeName")
            .IsUnique();
        builder.Entity<WarehousesModel>().HasIndex(w => w.Code)
            .HasDatabaseName("IX_Warehouses_Code")
            .IsUnique();
        builder.Entity<WarehousesModel>().HasIndex(w => w.Name)
            .HasDatabaseName("IX_Warehouses_Name");

        #endregion
    }
}