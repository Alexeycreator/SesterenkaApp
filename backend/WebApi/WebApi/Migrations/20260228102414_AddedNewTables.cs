using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddedNewTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clients_Addresses_Address_Id",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_Address_Id",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_Login",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_NumberPhone",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Address_Id",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Apartment",
                table: "Addresses");

            migrationBuilder.RenameColumn(
                name: "Password",
                table: "Clients",
                newName: "PhoneNumber");

            migrationBuilder.RenameColumn(
                name: "NumberPhone",
                table: "Clients",
                newName: "PasswordClient");

            migrationBuilder.RenameColumn(
                name: "Login",
                table: "Clients",
                newName: "LoginClient");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Clients",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "House",
                table: "Addresses",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.CreateTable(
                name: "CarBrands",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarBrands", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CarModifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Body = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Transmission = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Engine = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Drive = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    EngineSize = table.Column<double>(type: "float", nullable: false),
                    YearStart = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    YearEnd = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarModifications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SecondName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SurName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LoginEmployee = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordEmployee = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Position = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Manufacturers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Manufacturers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Warehouses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warehouses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CarModels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CarBrands_Id = table.Column<int>(type: "int", nullable: true),
                    CarModifications_Id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarModels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CarModels_CarBrands_CarBrands_Id",
                        column: x => x.CarBrands_Id,
                        principalTable: "CarBrands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CarModels_CarModifications_CarModifications_Id",
                        column: x => x.CarModifications_Id,
                        principalTable: "CarModifications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    Clients_Id = table.Column<int>(type: "int", nullable: true),
                    Employees_Id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Orders_Clients_Clients_Id",
                        column: x => x.Clients_Id,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Orders_Employees_Employees_Id",
                        column: x => x.Employees_Id,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PartNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Details = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Categories_Id = table.Column<int>(type: "int", nullable: true),
                    Manufacturers_Id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Categories_Categories_Id",
                        column: x => x.Categories_Id,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Products_Manufacturers_Manufacturers_Id",
                        column: x => x.Manufacturers_Id,
                        principalTable: "Manufacturers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WarehousesAddresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Addresses_Id = table.Column<int>(type: "int", nullable: true),
                    Warehouses_Id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarehousesAddresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WarehousesAddresses_Addresses_Addresses_Id",
                        column: x => x.Addresses_Id,
                        principalTable: "Addresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WarehousesAddresses_Warehouses_Warehouses_Id",
                        column: x => x.Warehouses_Id,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    PriceAtMoment = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Orders_Id = table.Column<int>(type: "int", nullable: true),
                    Products_Id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_Orders_Id",
                        column: x => x.Orders_Id,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderItems_Products_Products_Id",
                        column: x => x.Products_Id,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ProductCarApplicability",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Products_Id = table.Column<int>(type: "int", nullable: true),
                    CarModifications_Id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductCarApplicability", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductCarApplicability_CarModifications_CarModifications_Id",
                        column: x => x.CarModifications_Id,
                        principalTable: "CarModifications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ProductCarApplicability_Products_Products_Id",
                        column: x => x.Products_Id,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Stocks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Products_Id = table.Column<int>(type: "int", nullable: true),
                    Warehouses_Id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Stocks_Products_Products_Id",
                        column: x => x.Products_Id,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Stocks_Warehouses_Warehouses_Id",
                        column: x => x.Warehouses_Id,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CarModels_CarBrands_Id",
                table: "CarModels",
                column: "CarBrands_Id");

            migrationBuilder.CreateIndex(
                name: "IX_CarModels_CarModifications_Id",
                table: "CarModels",
                column: "CarModifications_Id");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_Orders_Id",
                table: "OrderItems",
                column: "Orders_Id");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_Products_Id",
                table: "OrderItems",
                column: "Products_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Clients_Id",
                table: "Orders",
                column: "Clients_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Employees_Id",
                table: "Orders",
                column: "Employees_Id");

            migrationBuilder.CreateIndex(
                name: "IX_ProductCarApplicability_CarModifications_Id",
                table: "ProductCarApplicability",
                column: "CarModifications_Id");

            migrationBuilder.CreateIndex(
                name: "IX_ProductCarApplicability_Products_Id",
                table: "ProductCarApplicability",
                column: "Products_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Categories_Id",
                table: "Products",
                column: "Categories_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Manufacturers_Id",
                table: "Products",
                column: "Manufacturers_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_Products_Id",
                table: "Stocks",
                column: "Products_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_Warehouses_Id",
                table: "Stocks",
                column: "Warehouses_Id");

            migrationBuilder.CreateIndex(
                name: "IX_WarehousesAddresses_Addresses_Id",
                table: "WarehousesAddresses",
                column: "Addresses_Id");

            migrationBuilder.CreateIndex(
                name: "IX_WarehousesAddresses_Warehouses_Id",
                table: "WarehousesAddresses",
                column: "Warehouses_Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CarModels");

            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "ProductCarApplicability");

            migrationBuilder.DropTable(
                name: "Stocks");

            migrationBuilder.DropTable(
                name: "WarehousesAddresses");

            migrationBuilder.DropTable(
                name: "CarBrands");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "CarModifications");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Warehouses");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Manufacturers");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Clients");

            migrationBuilder.RenameColumn(
                name: "PhoneNumber",
                table: "Clients",
                newName: "Password");

            migrationBuilder.RenameColumn(
                name: "PasswordClient",
                table: "Clients",
                newName: "NumberPhone");

            migrationBuilder.RenameColumn(
                name: "LoginClient",
                table: "Clients",
                newName: "Login");

            migrationBuilder.AddColumn<int>(
                name: "Address_Id",
                table: "Clients",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "House",
                table: "Addresses",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AddColumn<int>(
                name: "Apartment",
                table: "Addresses",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Address_Id",
                table: "Clients",
                column: "Address_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Login",
                table: "Clients",
                column: "Login",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clients_NumberPhone",
                table: "Clients",
                column: "NumberPhone",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Clients_Addresses_Address_Id",
                table: "Clients",
                column: "Address_Id",
                principalTable: "Addresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
