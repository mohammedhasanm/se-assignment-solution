using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RL.Data.Migrations;

[DbContext(typeof(RLContext))]
[Migration("20261116000000_AddPlanProcedureUsers")]
public partial class AddPlanProcedureUsers : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "PlanProcedureUsers",
            columns: table => new
            {
                PlanId = table.Column<int>(type: "INTEGER", nullable: false),
                ProcedureId = table.Column<int>(type: "INTEGER", nullable: false),
                UserId = table.Column<int>(type: "INTEGER", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PlanProcedureUsers", a => new { a.PlanId, a.ProcedureId, a.UserId });
                table.ForeignKey(
                    name: "FK_PlanProcedureUsers_PlanProcedures_PlanId_ProcedureId",
                    columns: a => new { a.PlanId, a.ProcedureId },
                    principalTable: "PlanProcedures",
                    principalColumns: new[] { "PlanId", "ProcedureId" },
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_PlanProcedureUsers_Users_UserId",
                    column: a => a.UserId,
                    principalTable: "Users",
                    principalColumn: "UserId",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_PlanProcedureUsers_UserId",
            table: "PlanProcedureUsers",
            column: "UserId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "PlanProcedureUsers");
    }
}
