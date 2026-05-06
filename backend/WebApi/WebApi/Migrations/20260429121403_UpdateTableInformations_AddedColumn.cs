using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTableInformations_AddedColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WarehousesAddresses_Addresses_Addresses_Id",
                table: "WarehousesAddresses");

            migrationBuilder.AddColumn<string>(
                name: "OurMission",
                table: "Informations",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OurValues",
                table: "Informations",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_WarehousesAddresses_Addresses_Addresses_Id",
                table: "WarehousesAddresses",
                column: "Addresses_Id",
                principalTable: "Addresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WarehousesAddresses_Addresses_Addresses_Id",
                table: "WarehousesAddresses");

            migrationBuilder.DropColumn(
                name: "OurMission",
                table: "Informations");

            migrationBuilder.DropColumn(
                name: "OurValues",
                table: "Informations");

            migrationBuilder.AddForeignKey(
                name: "FK_WarehousesAddresses_Addresses_Addresses_Id",
                table: "WarehousesAddresses",
                column: "Addresses_Id",
                principalTable: "Addresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
