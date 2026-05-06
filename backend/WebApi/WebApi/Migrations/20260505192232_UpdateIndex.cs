using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Addresses_FullAddress",
                table: "Addresses");

            migrationBuilder.RenameIndex(
                name: "IX_Clients_PhoneNumber",
                table: "Users",
                newName: "IX_Users_PhoneNumber");

            migrationBuilder.RenameIndex(
                name: "IX_Clients_Login",
                table: "Users",
                newName: "IX_Users_Login");

            migrationBuilder.RenameIndex(
                name: "IX_Clients_FullName",
                table: "Users",
                newName: "IX_Users_FullName");

            migrationBuilder.RenameIndex(
                name: "IX_Clients_Email",
                table: "Users",
                newName: "IX_Users_Email");

            migrationBuilder.RenameIndex(
                name: "IX_Stocks_Qantity",
                table: "Stocks",
                newName: "IX_Stocks_Quantity");

            migrationBuilder.RenameIndex(
                name: "IX_Products_Categories_Id",
                table: "Products",
                newName: "IX_Products_Categories_Id)");

            migrationBuilder.CreateIndex(
                name: "IX_Warehouses_Code",
                table: "Warehouses",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Warehouses_Name",
                table: "Warehouses",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Age",
                table: "Users",
                column: "Age");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Birthday",
                table: "Users",
                column: "Birthday");

            migrationBuilder.CreateIndex(
                name: "IX_Users_FirstName",
                table: "Users",
                column: "FirstName");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Gender",
                table: "Users",
                column: "Gender");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Position",
                table: "Users",
                column: "Position");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Role",
                table: "Users",
                column: "Role");

            migrationBuilder.CreateIndex(
                name: "IX_Users_SecondName",
                table: "Users",
                column: "SecondName");

            migrationBuilder.CreateIndex(
                name: "IX_Users_SurName",
                table: "Users",
                column: "SurName");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Details",
                table: "Products",
                column: "Details");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Image",
                table: "Products",
                column: "Image");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_NameOrder",
                table: "Orders",
                column: "NameOrder");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Description",
                table: "Categories",
                column: "Description");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Icon",
                table: "Categories",
                column: "Icon");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_City",
                table: "Addresses",
                column: "City");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_FullAddress",
                table: "Addresses",
                columns: new[] { "Region", "City", "Street", "House" },
                unique: true,
                filter: "[House] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_House",
                table: "Addresses",
                column: "House");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_IsShop",
                table: "Addresses",
                column: "IsShop");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_Region",
                table: "Addresses",
                column: "Region");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_Street",
                table: "Addresses",
                column: "Street");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Warehouses_Code",
                table: "Warehouses");

            migrationBuilder.DropIndex(
                name: "IX_Warehouses_Name",
                table: "Warehouses");

            migrationBuilder.DropIndex(
                name: "IX_Users_Age",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Birthday",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_FirstName",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Gender",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Position",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Role",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_SecondName",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_SurName",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Products_Details",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_Image",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Orders_NameOrder",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Description",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Icon",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_City",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_FullAddress",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_House",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_IsShop",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_Region",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_Street",
                table: "Addresses");

            migrationBuilder.RenameIndex(
                name: "IX_Users_PhoneNumber",
                table: "Users",
                newName: "IX_Clients_PhoneNumber");

            migrationBuilder.RenameIndex(
                name: "IX_Users_Login",
                table: "Users",
                newName: "IX_Clients_Login");

            migrationBuilder.RenameIndex(
                name: "IX_Users_FullName",
                table: "Users",
                newName: "IX_Clients_FullName");

            migrationBuilder.RenameIndex(
                name: "IX_Users_Email",
                table: "Users",
                newName: "IX_Clients_Email");

            migrationBuilder.RenameIndex(
                name: "IX_Stocks_Quantity",
                table: "Stocks",
                newName: "IX_Stocks_Qantity");

            migrationBuilder.RenameIndex(
                name: "IX_Products_Categories_Id)",
                table: "Products",
                newName: "IX_Products_Categories_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_FullAddress",
                table: "Addresses",
                columns: new[] { "City", "Region", "Street", "House" },
                unique: true,
                filter: "[House] IS NOT NULL");
        }
    }
}
