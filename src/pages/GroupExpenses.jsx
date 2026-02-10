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

    const handleSettleExpense = async (expenseId) => {
        if (!window.confirm("Are you sure you want to settle this expense? All splits will be marked as paid.")) return;
        try {
            await axios.patch(`${serverEndpoint}/expenses/${expenseId}/settle`, {}, { withCredentials: true });
            await fetchGroupData();
            alert("Expense settled successfully!");
        } catch (error) {
            console.error("Error settling expense:", error);
            alert(error.response?.data?.message || "Failed to settle expense");
        }
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
                        <Link to="/groups">Groups</Link>
                    </li>
                    <li className="breadcrumb-item active">{group?.name || "Expense Details"}</li>
                </ol>
            </nav>

            {/* Group Header */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                        <div className="mb-3 mb-md-0">
                            <h2 className="fw-bold mb-2">{group?.name}</h2>
                            <p className="text-muted mb-0">{group?.description}</p>
                            {group?.isSettled && (
                                <span className="badge bg-success mt-2">
                                    <i className="bi bi-check-circle me-1"></i>
                                    Settled on {new Date(group.settledAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
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

            {/* Balance Summary - Modern Cards */}
            <div className="row mb-5">
                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                            <h4 className="fw-bold mb-0 text-dark mb-2 mb-md-0">
                                <i className="bi bi-pie-chart-fill me-2 text-primary"></i>
                                Balance Summary
                            </h4>
                            {group?.isSettled && (
                                <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                                    All Settled
                                </span>
                            )}
                        </div>
                        <div className="card-body p-3 p-md-4">
                            {balanceSummary.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <p className="mb-0">No expenses to summarize yet.</p>
                                </div>
                            ) : (
                                <div className="row g-3 g-md-4">
                                    {/* User's Net Balance Highlight */}
                                    {balanceSummary.map(member => {
                                        if (member.email === currentUserEmail) {
                                            return (
                                                <div key={member.email} className="col-12 mb-2">
                                                    <div className={`p-3 p-md-4 rounded-4 ${member.netBalance > 0 ? 'bg-success bg-opacity-10 border border-success' :
                                                        member.netBalance < 0 ? 'bg-danger bg-opacity-10 border border-danger' :
                                                            'bg-light border'
                                                        }`}>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h6 className="text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
                                                                    Your Position
                                                                </h6>
                                                                <h2 className={`display-6 fw-bold mb-0 fs-1 ${member.netBalance > 0 ? 'text-success' :
                                                                    member.netBalance < 0 ? 'text-danger' : 'text-secondary'
                                                                    }`}>
                                                                    {member.netBalance > 0 ? 'You are owed' : member.netBalance < 0 ? 'You owe' : 'All settled'}
                                                                    <span className="ms-0 ms-md-3 d-block d-md-inline mt-1 mt-md-0">
                                                                        {member.netBalance !== 0 && `₹${Math.abs(member.netBalance).toFixed(2)}`}
                                                                    </span>
                                                                </h2>
                                                            </div>
                                                            <div className={`rounded-circle p-2 p-md-3 d-flex align-items-center justify-content-center flex-shrink-0 ${member.netBalance > 0 ? 'bg-success text-white' :
                                                                member.netBalance < 0 ? 'bg-danger text-white' : 'bg-secondary text-white'
                                                                }`} style={{ width: '50px', height: '50px' }}>
                                                                <i className={`bi ${member.netBalance > 0 ? 'bi-graph-up-arrow' :
                                                                    member.netBalance < 0 ? 'bi-graph-down-arrow' : 'bi-check-lg'
                                                                    } fs-4`}></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* Other Members List */}
                                    <div className="col-12">
                                        <h6 className="text-muted fw-bold mb-3 text-uppercase small" style={{ letterSpacing: '1px' }}>Group Balances</h6>
                                        <div className="list-group list-group-flush rounded-3 border">
                                            {balanceSummary.map((member) => (
                                                <div key={member.email} className="list-group-item p-3 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between">
                                                    <div className="d-flex align-items-center mb-2 mb-sm-0">
                                                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3 border flex-shrink-0"
                                                            style={{ width: '40px', height: '40px', fontSize: '1rem', fontWeight: 'bold', color: '#555' }}>
                                                            {member.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0 fw-bold text-dark text-break">
                                                                {member.email === currentUserEmail ? 'You' : member.email.split('@')[0]}
                                                                {member.email === currentUserEmail && <span className="badge bg-primary ms-2" style={{ fontSize: '0.7em' }}>YOU</span>}
                                                            </h6>
                                                            <small className="text-muted d-block">
                                                                Paid: ₹{member.totalPaid.toFixed(2)} • Share: ₹{member.totalOwed.toFixed(2)}
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <div className="text-end align-self-end align-self-sm-center">
                                                        <h6 className={`fw-bold mb-0 ${member.netBalance > 0.01 ? 'text-success' :
                                                            member.netBalance < -0.01 ? 'text-danger' : 'text-secondary'
                                                            }`}>
                                                            {member.netBalance > 0 ? '+' : ''}₹{member.netBalance.toFixed(2)}
                                                        </h6>
                                                        <span className={`badge rounded-pill ${member.netBalance > 0.01 ? 'bg-success bg-opacity-10 text-success' :
                                                            member.netBalance < -0.01 ? 'bg-danger bg-opacity-10 text-danger' : 'bg-secondary bg-opacity-10 text-secondary'
                                                            }`}>
                                                            {member.netBalance > 0.01 ? 'Gets back' : member.netBalance < -0.01 ? 'Owes' : 'Settled'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expenses List */}
            <div className="mb-4">
                <h5 className="mb-3">
                    <i className="bi bi-receipt me-2"></i>
                    Expenses ({expenses.length})
                </h5>

                {expenses.length === 0 ? (
                    <div className="card shadow-sm">
                        <div className="card-body text-center py-5 text-muted">
                            <i className="bi bi-inbox display-4 d-block mb-3 opacity-25"></i>
                            <p className="mb-0">No expenses yet</p>
                        </div>
                    </div>
                ) : (
                    <div className="row g-3">
                        {expenses.map((expense) => {
                            const categoryColors = {
                                Food: '#e74c3c',
                                Transport: '#3498db',
                                Shopping: '#e67e22',
                                Entertainment: '#9b59b6',
                                Bills: '#1abc9c',
                                Health: '#2ecc71',
                                Travel: '#f39c12',
                                Other: '#95a5a6'
                            };
                            const borderColor = categoryColors[expense.category] || '#6c757d';
                            const isExpenseSettled = expense.splitDetails.every(split => split.isPaid);

                            return (
                                <div key={expense._id} className="col-12">
                                    <div className={`card shadow-sm border-0 mb-3 ${isExpenseSettled ? 'bg-light opacity-75' : ''}`}>
                                        <div className="card-body p-4">
                                            <div className="d-flex gx-0">
                                                {/* Date Box */}
                                                <div className="d-flex flex-column align-items-center justify-content-center bg-light rounded-3 border p-2 text-center" style={{ width: '70px', height: '70px' }}>
                                                    <span className="text-uppercase fw-bold text-muted small" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                                        {new Date(expense.date).toLocaleString('default', { month: 'short' })}
                                                    </span>
                                                    <span className="display-6 fw-bold text-dark lh-1">
                                                        {new Date(expense.date).getDate()}
                                                    </span>
                                                </div>

                                                {/* Expense Content */}
                                                <div className="flex-grow-1 ms-3 ms-md-4">
                                                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
                                                        <div>
                                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                                <h5 className="card-title fw-bold mb-0 text-dark" style={{ fontSize: '1.25rem' }}>{expense.title}</h5>
                                                                <span className="badge rounded-pill" style={{ backgroundColor: `${categoryColors[expense.category] || '#6c757d'}20`, color: categoryColors[expense.category] || '#6c757d', border: `1px solid ${categoryColors[expense.category] || '#6c757d'}40` }}>
                                                                    {expense.category}
                                                                </span>
                                                                {isExpenseSettled && (
                                                                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill">
                                                                        <i className="bi bi-check-circle-fill me-1"></i>Settled
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-muted small mb-2 text-truncate" style={{ maxWidth: '300px' }}>
                                                                {expense.description || "No description provided"}
                                                            </p>
                                                            <div className="d-flex align-items-center text-muted small">
                                                                <div className="rounded-circle bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px' }}>
                                                                    <i className="bi bi-person-fill" style={{ fontSize: '0.75rem' }}></i>
                                                                </div>
                                                                Paid by <span className="fw-bold text-dark ms-1">
                                                                    {expense.paidBy.email === currentUserEmail ? 'You' : (expense.paidBy.name || expense.paidBy.email.split('@')[0])}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Amount & Actions */}
                                                        <div className="text-md-end mt-3 mt-md-0">
                                                            <h3 className="text-primary fw-bold mb-2">₹{expense.amount.toFixed(2)}</h3>
                                                            <div className="d-flex gap-2 justify-content-md-end">
                                                                {!isExpenseSettled && !group?.isSettled && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-success rounded-pill px-3"
                                                                        onClick={() => handleSettleExpense(expense._id)}
                                                                        title="Mark entire expense as settled"
                                                                    >
                                                                        <i className="bi bi-check2-circle me-1"></i>Settle
                                                                    </button>
                                                                )}
                                                                {!group?.isSettled && expense.createdBy === currentUserEmail && (
                                                                    <>
                                                                        <button
                                                                            className="btn btn-sm btn-light text-primary border rounded-circle"
                                                                            onClick={() => handleEditClick(expense)}
                                                                            title="Edit Expense"
                                                                            style={{ width: '32px', height: '32px' }}
                                                                        >
                                                                            <i className="bi bi-pencil-fill" style={{ fontSize: '0.8rem' }}></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-light text-danger border rounded-circle"
                                                                            onClick={() => handleDeleteClick(expense)}
                                                                            title="Delete Expense"
                                                                            style={{ width: '32px', height: '32px' }}
                                                                        >
                                                                            <i className="bi bi-trash-fill" style={{ fontSize: '0.8rem' }}></i>
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Split Visuals */}
                                                    <div className="mt-4 pt-3 border-top">
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                                                                Split Details ({expense.splitType})
                                                            </small>
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            {expense.splitDetails.map((split, idx) => (
                                                                <div key={idx}
                                                                    className={`d-flex align-items-center rounded-pill pe-3 ps-1 py-1 border ${split.isPaid
                                                                        ? 'bg-success bg-opacity-10 border-success border-opacity-25'
                                                                        : split.email === currentUserEmail
                                                                            ? 'bg-primary bg-opacity-5 border-primary border-opacity-25'
                                                                            : 'bg-white'
                                                                        }`}
                                                                    title={`${split.email} - ₹${split.amount}`}
                                                                >
                                                                    <div
                                                                        className={`rounded-circle d-flex align-items-center justify-content-center me-2 text-white fw-bold small ${split.isPaid ? 'bg-success' : split.email === currentUserEmail ? 'bg-primary' : 'bg-secondary'
                                                                            }`}
                                                                        style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}
                                                                    >
                                                                        {split.email.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="d-flex flex-column lh-1">
                                                                        <span className="fw-bold text-dark small mb-0" style={{ fontSize: '0.8rem' }}>
                                                                            {split.email === currentUserEmail ? 'You' : split.email.split('@')[0]}
                                                                        </span>
                                                                        <span className={`small ${split.isPaid ? 'text-success' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>
                                                                            ₹{split.amount.toFixed(0)} {split.isPaid && <i className="bi bi-check-circle-fill ms-1"></i>}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
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
