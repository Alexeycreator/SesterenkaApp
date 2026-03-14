using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTables_UpdateDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Clients_Clients_Id",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Employees_Employees_Id",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Orders_Clients_Id",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_FullAddress",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "Clients_Id",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "Employees_Id",
                table: "Orders",
                newName: "Users_Id");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_Employees_Id",
                table: "Orders",
                newName: "IX_Orders_Users_Id");

            migrationBuilder.AlterColumn<string>(
                name: "House",
                table: "Addresses",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SecondName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SurName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Gender = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    Birthday = table.Column<DateOnly>(type: "date", nullable: false),
                    Age = table.Column<int>(type: "int", nullable: false),
                    Position = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Role = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Login = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    RefreshToken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RefreshTokenExpiryTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LoginAttempts = table.Column<int>(type: "int", nullable: false),
                    LockoutEnd = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_FullAddress",
                table: "Addresses",
                columns: new[] { "City", "Region", "Street", "House" },
                unique: true,
                filter: "[House] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clients_FullName",
                table: "Users",
                columns: new[] { "SecondName", "FirstName", "SurName" });

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Login",
                table: "Users",
                column: "Login",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clients_PhoneNumber",
                table: "Users",
                column: "PhoneNumber",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_Users_Id",
                table: "Orders",
                column: "Users_Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_Users_Id",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_FullAddress",
                table: "Addresses");

            migrationBuilder.RenameColumn(
                name: "Users_Id",
                table: "Orders",
                newName: "Employees_Id");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_Users_Id",
                table: "Orders",
                newName: "IX_Orders_Employees_Id");

            migrationBuilder.AddColumn<int>(
                name: "Clients_Id",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "House",
                table: "Addresses",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LoginClient = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordClient = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SecondName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SurName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LoginEmployee = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordEmployee = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Position = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SecondName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SurName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Clients_Id",
                table: "Orders",
                column: "Clients_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_FullAddress",
                table: "Addresses",
                columns: new[] { "City", "Region", "Street", "House" },
                unique: true);

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

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Clients_Clients_Id",
                table: "Orders",
                column: "Clients_Id",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Employees_Employees_Id",
                table: "Orders",
                column: "Employees_Id",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
