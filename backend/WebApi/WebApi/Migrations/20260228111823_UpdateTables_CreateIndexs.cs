using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTables_CreateIndexs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Warehouses_CodeName",
                table: "Warehouses",
                columns: new[] { "Code", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Warehouses_IsActive",
                table: "Warehouses",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Warehouses_Type",
                table: "Warehouses",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_Stocks_Qantity",
                table: "Stocks",
                column: "Quantity");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Name",
                table: "Products",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Products_PartNumber",
                table: "Products",
                column: "PartNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_Price",
                table: "Products",
                column: "Price");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_OrderDate",
                table: "Orders",
                column: "OrderDate");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Status",
                table: "Orders",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_PriceAtMoment",
                table: "OrderItems",
                column: "PriceAtMoment");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_Quantity",
                table: "OrderItems",
                column: "Quantity");

            migrationBuilder.CreateIndex(
                name: "IX_Manufacturers_Name",
                table: "Manufacturers",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_Email",
                table: "Employees",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_FullName",
                table: "Employees",
                columns: new[] { "SecondName", "FirstName", "SurName" });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_Login",
                table: "Employees",
                column: "LoginEmployee",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_PhoneNumber",
                table: "Employees",
                column: "PhoneNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_Position",
                table: "Employees",
                column: "Position");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Email",
                table: "Clients",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clients_FullName",
                table: "Clients",
                columns: new[] { "SecondName", "FirstName", "SurName" });

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Login",
                table: "Clients",
                column: "LoginClient",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clients_PhoneNumber",
                table: "Clients",
                column: "PhoneNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name",
                table: "Categories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CarModifications_FullModification",
                table: "CarModifications",
                columns: new[] { "Engine", "EngineSize", "Transmission", "Drive", "Body", "YearStart", "YearEnd" });

            migrationBuilder.CreateIndex(
                name: "IX_CarModels_Name",
                table: "CarModels",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CarBrands_Name",
                table: "CarBrands",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_FullAddress",
                table: "Addresses",
                columns: new[] { "City", "Region", "Street", "House" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Warehouses_CodeName",
                table: "Warehouses");

            migrationBuilder.DropIndex(
                name: "IX_Warehouses_IsActive",
                table: "Warehouses");

            migrationBuilder.DropIndex(
                name: "IX_Warehouses_Type",
                table: "Warehouses");

            migrationBuilder.DropIndex(
                name: "IX_Stocks_Qantity",
                table: "Stocks");

            migrationBuilder.DropIndex(
                name: "IX_Products_Name",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_PartNumber",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_Price",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Orders_OrderDate",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Status",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_PriceAtMoment",
                table: "OrderItems");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_Quantity",
                table: "OrderItems");

            migrationBuilder.DropIndex(
                name: "IX_Manufacturers_Name",
                table: "Manufacturers");

            migrationBuilder.DropIndex(
                name: "IX_Employees_Email",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_FullName",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_Login",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_PhoneNumber",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_Position",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Clients_Email",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_FullName",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_Login",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_PhoneNumber",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Name",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_CarModifications_FullModification",
                table: "CarModifications");

            migrationBuilder.DropIndex(
                name: "IX_CarModels_Name",
                table: "CarModels");

            migrationBuilder.DropIndex(
                name: "IX_CarBrands_Name",
                table: "CarBrands");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_FullAddress",
                table: "Addresses");
        }
    }
}
