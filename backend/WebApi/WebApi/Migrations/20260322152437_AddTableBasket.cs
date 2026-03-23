using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTableBasket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Basket",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Goods = table.Column<int>(type: "int", nullable: false),
                    Delivery = table.Column<int>(type: "int", nullable: false),
                    TotalPrice = table.Column<int>(type: "int", nullable: false),
                    PromotionalCode = table.Column<int>(type: "int", nullable: false),
                    Stocks_Id = table.Column<int>(type: "int", nullable: true),
                    Products_Id = table.Column<int>(type: "int", nullable: true),
                    Addresses_Id = table.Column<int>(type: "int", nullable: true)
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Basket");
        }
    }
}
