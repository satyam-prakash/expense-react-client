import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";
import AddExpenseModal from "../components/AddExpenseModal";
import EditExpenseModal from "../components/EditExpenseModal";

function GroupExpenses() {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [balanceSummary, setBalanceSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSettleModal, setShowSettleModal] = useState(false);
    const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
    const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [settling, setSettling] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState("");

    useEffect(() => {
        fetchGroupData();
        fetchCurrentUser();
    }, [groupId]);

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.post(`${serverEndpoint}/auth/is-user-logged-in`, {}, {
                withCredentials: true,
            });
            setCurrentUserEmail(response.data.user.email);
        } catch (error) {
            console.error("Error fetching current user:", error);
        }
    };

    const fetchGroupData = async () => {
        try {
            setLoading(true);

            // Fetch group details, expenses, and balance summary in parallel
            const [groupRes, expensesRes, balanceRes] = await Promise.all([
                axios.get(`${serverEndpoint}/groups/${groupId}`, { withCredentials: true }),
                axios.get(`${serverEndpoint}/expenses/group/${groupId}`, { withCredentials: true }),
                axios.get(`${serverEndpoint}/groups/${groupId}/balance-summary`, { withCredentials: true })
            ]);

            setGroup(groupRes.data);
            setExpenses(expensesRes.data);
            setBalanceSummary(balanceRes.data.balances);
        } catch (error) {
            console.error("Error fetching group data:", error);
            setError("Failed to load group data");
        } finally {
            setLoading(false);
        }
    };

    const handleSettleGroup = async () => {
        setSettling(true);
        try {
            await axios.post(
                `${serverEndpoint}/groups/${groupId}/settle`,
                {},
                { withCredentials: true }
            );

            setShowSettleModal(false);
            await fetchGroupData(); // Refresh data
            alert("Group settled successfully!");
        } catch (error) {
            console.error("Error settling group:", error);
            alert(error.response?.data?.message || "Failed to settle group");
        } finally {
            setSettling(false);
        }
    };

    const handleDeleteExpense = async () => {
        setDeleting(true);
        try {
            await axios.delete(
                `${serverEndpoint}/expenses/${selectedExpense._id}`,
                { withCredentials: true }
            );

            setShowDeleteModal(false);
            setSelectedExpense(null);
            await fetchGroupData();
            alert("Expense deleted successfully!");
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert(error.response?.data?.message || "Failed to delete expense");
        } finally {
            setDeleting(false);
        }
    };

    const handleEditClick = (expense) => {
        setSelectedExpense(expense);
        setShowEditExpenseModal(true);
    };

    const handleDeleteClick = (expense) => {
        setSelectedExpense(expense);
        setShowDeleteModal(true);
    };


    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    const isAdmin = group?.adminEmail === currentUserEmail;

    return (
        <div className="container py-5">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/dashboard">Groups</Link>
                    </li>
                    <li className="breadcrumb-item active">{group?.name || "Expense Details"}</li>
                </ol>
            </nav>

            {/* Group Header */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="fw-bold mb-2">{group?.name}</h2>
                            <p className="text-muted mb-0">{group?.description}</p>
                            {group?.isSettled && (
                                <span className="badge bg-success mt-2">
                                    <i className="bi bi-check-circle me-1"></i>
                                    Settled on {new Date(group.settledAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            {!group?.isSettled && (
                                <button
                                    className="btn btn-success"
                                    onClick={() => setShowAddExpenseModal(true)}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Add Expense
                                </button>
                            )}
                            {isAdmin && !group?.isSettled && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowSettleModal(true)}
                                >
                                    <i className="bi bi-check-circle me-2"></i>
                                    Settle Group
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Balance Summary */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                    <h5 className="mb-0">
                        <i className="bi bi-wallet2 me-2"></i>
                        Balance Summary
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        {balanceSummary.map((member) => (
                            <div key={member.email} className="col-md-6 col-lg-4">
                                <div className={`card h-100 ${member.netBalance > 0 ? 'border-success' : member.netBalance < 0 ? 'border-danger' : 'border-secondary'}`}>
                                    <div className="card-body">
                                        <h6 className="card-title">
                                            {member.email}
                                            {member.email === currentUserEmail && (
                                                <span className="badge bg-primary ms-2">You</span>
                                            )}
                                        </h6>
                                        <div className="mt-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted">Paid:</span>
                                                <span className="fw-bold">₹{member.totalPaid.toFixed(2)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted">Share:</span>
                                                <span className="fw-bold">₹{member.totalOwed.toFixed(2)}</span>
                                            </div>
                                            <hr />
                                            <div className="d-flex justify-content-between">
                                                <span className="fw-bold">Net Balance:</span>
                                                <span className={`fw-bold ${member.netBalance > 0 ? 'text-success' : member.netBalance < 0 ? 'text-danger' : 'text-secondary'}`}>
                                                    {member.netBalance > 0 && '+'}
                                                    ₹{member.netBalance.toFixed(2)}
                                                </span>
                                            </div>
                                            {member.netBalance > 0 && (
                                                <small className="text-success d-block mt-2">
                                                    <i className="bi bi-arrow-down-circle me-1"></i>
                                                    Gets back
                                                </small>
                                            )}
                                            {member.netBalance < 0 && (
                                                <small className="text-danger d-block mt-2">
                                                    <i className="bi bi-arrow-up-circle me-1"></i>
                                                    Needs to pay
                                                </small>
                                            )}
                                            {member.netBalance === 0 && (
                                                <small className="text-secondary d-block mt-2">
                                                    <i className="bi bi-check-circle me-1"></i>
                                                    All settled
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Expenses List */}
            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <h5 className="mb-0">
                        <i className="bi bi-receipt me-2"></i>
                        Expenses ({expenses.length})
                    </h5>
                </div>
                <div className="card-body">
                    {expenses.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="bi bi-inbox display-4 d-block mb-3 opacity-25"></i>
                            <p>No expenses yet</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Paid By</th>
                                        <th>Amount</th>
                                        <th>Split Type</th>
                                        {!group?.isSettled && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((expense) => (
                                        <tr key={expense._id}>
                                            <td>{new Date(expense.date).toLocaleDateString()}</td>
                                            <td>
                                                <strong>{expense.title}</strong>
                                                {expense.description && (
                                                    <small className="d-block text-muted">
                                                        {expense.description}
                                                    </small>
                                                )}
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td>{expense.paidBy.name || expense.paidBy.email}</td>
                                            <td className="fw-bold">₹{expense.amount.toFixed(2)}</td>
                                            <td>
                                                <span className="badge bg-info">
                                                    {expense.splitType}
                                                </span>
                                            </td>
                                            {!group?.isSettled && (
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        {expense.createdBy === currentUserEmail && (
                                                            <>
                                                                <button
                                                                    className="btn btn-outline-primary"
                                                                    onClick={() => handleEditClick(expense)}
                                                                    title="Edit"
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-outline-danger"
                                                                    onClick={() => handleDeleteClick(expense)}
                                                                    title="Delete"
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Settle Confirmation Modal */}
            {showSettleModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Settle Group</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowSettleModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to settle this group?</p>
                                <p className="text-muted small">
                                    This will mark all expenses as paid and the group as settled.
                                    This action cannot be undone.
                                </p>

                                <div className="alert alert-info">
                                    <strong>Current Balances:</strong>
                                    <ul className="mb-0 mt-2">
                                        {balanceSummary.filter(m => m.netBalance !== 0).map(member => (
                                            <li key={member.email}>
                                                {member.email}:
                                                <span className={member.netBalance > 0 ? 'text-success' : 'text-danger'}>
                                                    {' '}₹{Math.abs(member.netBalance).toFixed(2)}
                                                    {member.netBalance > 0 ? ' (gets back)' : ' (owes)'}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowSettleModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSettleGroup}
                                    disabled={settling}
                                >
                                    {settling ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Settling...
                                        </>
                                    ) : (
                                        'Settle Group'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedExpense && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Delete Expense</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this expense?</p>
                                <div className="alert alert-warning">
                                    <strong>{selectedExpense.title}</strong><br />
                                    Amount: ₹{selectedExpense.amount.toFixed(2)}<br />
                                    Date: {new Date(selectedExpense.date).toLocaleDateString()}
                                </div>
                                <p className="text-muted small">This action cannot be undone.</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDeleteExpense}
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-trash me-2"></i>
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Expense Modal */}
            <AddExpenseModal
                show={showAddExpenseModal}
                onClose={() => setShowAddExpenseModal(false)}
                groupId={groupId}
                groupMembers={group?.membersEmail}
                onExpenseAdded={fetchGroupData}
            />

            {/* Edit Expense Modal */}
            <EditExpenseModal
                show={showEditExpenseModal}
                onClose={() => {
                    setShowEditExpenseModal(false);
                    setSelectedExpense(null);
                }}
                expense={selectedExpense}
                groupMembers={group?.membersEmail}
                onExpenseUpdated={fetchGroupData}
            />
        </div>
    );
}

export default GroupExpenses;
