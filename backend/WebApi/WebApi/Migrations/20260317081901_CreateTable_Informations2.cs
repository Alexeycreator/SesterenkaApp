using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class CreateTable_Informations2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Informations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AboutUs = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Questions = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Users_Id = table.Column<int>(type: "int", nullable: true),
                    Addresses_Id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Informations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Informations_Addresses_Addresses_Id",
                        column: x => x.Addresses_Id,
                        principalTable: "Addresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Informations_Users_Users_Id",
                        column: x => x.Users_Id,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Informations_Addresses_Id",
                table: "Informations",
                column: "Addresses_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Informations_Users_Id",
                table: "Informations",
                column: "Users_Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Informations");
        }
    }
}
