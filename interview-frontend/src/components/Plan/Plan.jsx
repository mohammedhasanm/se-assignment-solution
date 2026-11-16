import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  addProcedureToPlan,
  getPlanAssignments,
  getPlanProcedures,
  getProcedures,
  getUsers,
} from "../../api/api";
import Layout from '../Layout/Layout';
import ProcedureItem from "./ProcedureItem/ProcedureItem";
import PlanProcedureItem from "./PlanProcedureItem/PlanProcedureItem";

const Plan = () => {
  let { id } = useParams();
  const [procedures, setProcedures] = useState([]);
  const [planProcedures, setPlanProcedures] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setError("");
    setPlanProcedures([]);
    (async () => {
      try {
        const [procedures, planProcedures, users, assignments] = await Promise.all([
          getProcedures(), getPlanProcedures(id), getUsers(), getPlanAssignments(id),
        ]);
        if (!active) return;

        setUsers(users.map((user) => ({ label: user.name, value: user.userId })));
        setProcedures(procedures);
        setPlanProcedures(planProcedures.map((procedure) => ({
          ...procedure,
          assignedUserIds: assignments
            .filter((assignment) => assignment.procedureId === procedure.procedureId)
            .map((assignment) => assignment.userId),
        })));
      } catch (error) {
        if (active) setError(error.message);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const handleAddProcedureToPlan = async (procedure) => {
    const hasProcedureInPlan = planProcedures.some((p) => p.procedureId === procedure.procedureId);
    if (hasProcedureInPlan) return;

    await addProcedureToPlan(id, procedure.procedureId);
    setPlanProcedures((prevState) => {
      return [
        ...prevState,
        {
          planId: id,
          procedureId: procedure.procedureId,
          assignedUserIds: [],
          procedure: {
            procedureId: procedure.procedureId,
            procedureTitle: procedure.procedureTitle,
          },
        },
      ];
    });
  };

  return (
    <Layout>
      <div className="container pt-4">
        <div className="d-flex justify-content-center">
          <h2>OEC Interview Frontend</h2>
        </div>
        <div className="row mt-4">
          <div className="col">
            <div className="card shadow">
              <h5 className="card-header">Repair Plan</h5>
              <div className="card-body">
                {error && <p className="text-danger" role="alert">{error}</p>}
                <div className="row">
                  <div className="col">
                    <h4>Procedures</h4>
                    <div>
                      {procedures.map((p) => (
                        <ProcedureItem
                          key={p.procedureId}
                          procedure={p}
                          handleAddProcedureToPlan={handleAddProcedureToPlan}
                          planProcedures={planProcedures}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="col">
                    <h4>Added to Plan</h4>
                    <div>
                      {planProcedures.map((p) => (
                        <PlanProcedureItem
                          key={`${p.planId}-${p.procedureId}`}
                          planId={p.planId}
                          procedure={p.procedure}
                          users={users}
                          assignedUserIds={p.assignedUserIds}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Plan;
