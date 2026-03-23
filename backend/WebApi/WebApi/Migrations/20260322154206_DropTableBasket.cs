using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class DropTableBasket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Basket");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Basket",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Addresses_Id = table.Column<int>(type: "int", nullable: true),
                    Products_Id = table.Column<int>(type: "int", nullable: true),
                    Stocks_Id = table.Column<int>(type: "int", nullable: true),
                    Delivery = table.Column<int>(type: "int", nullable: false),
                    Goods = table.Column<int>(type: "int", nullable: false),
                    PromotionalCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TotalPrice = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Basket", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Basket_Addresses_Addresses_Id",
                        column: x => x.Addresses_Id,
                        principalTable: "Addresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Basket_Products_Products_Id",
                        column: x => x.Products_Id,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Basket_Stocks_Stocks_Id",
                        column: x => x.Stocks_Id,
                        principalTable: "Stocks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Basket_Addresses_Id",
                table: "Basket",
                column: "Addresses_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Basket_Products_Id",
                table: "Basket",
                column: "Products_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Basket_Stocks_Id",
                table: "Basket",
                column: "Stocks_Id");
        }
    }
}
