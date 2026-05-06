using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTableOrders_UpdateDeleteBehaivor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_Users_Id",
                table: "Orders");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_Users_Id",
                table: "Orders",
                column: "Users_Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_Users_Id",
                table: "Orders");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_Users_Id",
                table: "Orders",
                column: "Users_Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
