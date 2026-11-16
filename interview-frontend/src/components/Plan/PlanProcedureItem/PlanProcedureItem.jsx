import React, { useState } from "react";
import ReactSelect from "react-select";
import { savePlanProcedureAssignments } from "../../../api/api";

const PlanProcedureItem = ({ planId, procedure, users, assignedUserIds }) => {
    const [selectedUserIds, setSelectedUserIds] = useState(assignedUserIds);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleAssignUserToProcedure = async (selectedUsers) => {
        const userIds = selectedUsers.map((user) => user.value);
        setSaving(true);
        setError("");
        try {
            await savePlanProcedureAssignments(planId, procedure.procedureId, userIds);
            setSelectedUserIds(userIds);
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="py-2">
            <div>
                {procedure.procedureTitle}
            </div>

            <ReactSelect
                className="mt-2"
                placeholder="Select User to Assign"
                isMulti={true}
                isClearable={false}
                isDisabled={saving}
                isLoading={saving}
                aria-label={`Assign users to ${procedure.procedureTitle}`}
                options={users}
                value={users.filter((user) => selectedUserIds.includes(user.value))}
                onChange={handleAssignUserToProcedure}
            />
            {selectedUserIds.length > 0 && (
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary mt-2"
                    disabled={saving}
                    onClick={() => handleAssignUserToProcedure([])}
                >
                    Remove all users
                </button>
            )}
            {error && <p className="text-danger mb-0" role="alert">{error}</p>}
        </div>
    );
};

export default PlanProcedureItem;
