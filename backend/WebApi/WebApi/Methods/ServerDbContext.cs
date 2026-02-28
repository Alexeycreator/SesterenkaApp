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
    }
}