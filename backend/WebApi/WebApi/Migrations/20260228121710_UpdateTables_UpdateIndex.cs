using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTables_UpdateIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CarModels_Name",
                table: "CarModels");

            migrationBuilder.CreateIndex(
                name: "IX_CarModels_Name",
                table: "CarModels",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CarModels_Name",
                table: "CarModels");

            migrationBuilder.CreateIndex(
                name: "IX_CarModels_Name",
                table: "CarModels",
                column: "Name",
                unique: true);
        }
    }
}
