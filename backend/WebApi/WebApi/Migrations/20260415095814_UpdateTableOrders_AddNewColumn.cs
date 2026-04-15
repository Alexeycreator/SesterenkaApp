using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTableOrders_AddNewColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Addresses_Id",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameOrder",
                table: "Orders",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Addresses_Id",
                table: "Orders",
                column: "Addresses_Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Addresses_Addresses_Id",
                table: "Orders",
                column: "Addresses_Id",
                principalTable: "Addresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Addresses_Addresses_Id",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Addresses_Id",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Addresses_Id",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "NameOrder",
                table: "Orders");
        }
    }
}
