using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;
using RL.Data;
using RL.Data.DataModels;

namespace RL.Backend.Controllers;

[ApiController]
[Route("[controller]")]
public class PlanProcedureController : ControllerBase
{
    private readonly ILogger<PlanProcedureController> _logger;
    private readonly RLContext _context;

    public PlanProcedureController(ILogger<PlanProcedureController> logger, RLContext context)
    {
        _logger = logger;
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    [HttpGet]
    [EnableQuery]
    public IEnumerable<PlanProcedure> Get()
    {
        return _context.PlanProcedures;
    }

    [HttpGet("{planId:int}/assignments")]
    public async Task<IActionResult> GetAssignments(int planId, CancellationToken token)
    {
        var assignments = await _context.PlanProcedureUsers
            .Where(a => a.PlanId == planId)
            .OrderBy(a => a.UserId)
            .Select(a => new { a.ProcedureId, a.UserId })
            .ToListAsync(token);

        return Ok(assignments);
    }

    [HttpPut("{planId:int}/{procedureId:int}/assignments")]
    public async Task<IActionResult> SaveAssignments(
        int planId, int procedureId, [FromBody] int[] userIds, CancellationToken token)
    {
        var requestedIds = userIds.Distinct().ToHashSet();
        await using var transaction = await _context.Database.BeginTransactionAsync(token);

        if (!await _context.PlanProcedures.AnyAsync(
            p => p.PlanId == planId && p.ProcedureId == procedureId, token))
        {
            return NotFound("Procedure is not in this plan.");
        }

        var knownUserCount = await _context.Users.CountAsync(u => requestedIds.Contains(u.UserId), token);
        if (knownUserCount != requestedIds.Count)
        {
            return BadRequest("One or more users do not exist.");
        }

        var assignments = await _context.PlanProcedureUsers
            .Where(a => a.PlanId == planId && a.ProcedureId == procedureId)
            .ToListAsync(token);
        _context.PlanProcedureUsers.RemoveRange(assignments.Where(a => !requestedIds.Contains(a.UserId)));

        var existingIds = assignments.Select(a => a.UserId);
        _context.PlanProcedureUsers.AddRange(requestedIds.Except(existingIds).Select(userId =>
            new PlanProcedureUser { PlanId = planId, ProcedureId = procedureId, UserId = userId }));

        await _context.SaveChangesAsync(token);
        await transaction.CommitAsync(token);
        return NoContent();
    }
}
