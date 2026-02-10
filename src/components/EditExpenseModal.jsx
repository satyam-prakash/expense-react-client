import { useState, useEffect } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";

function EditExpenseModal({ show, onClose, expense, groupMembers, onExpenseUpdated }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        amount: "",
        category: "Other",
        splitType: "equal",
        date: ""
    });

    const [selectedMembers, setSelectedMembers] = useState([]);
    const [customSplits, setCustomSplits] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (show && expense) {
            setFormData({
                title: expense.title || "",
                description: expense.description || "",
                amount: expense.amount || "",
                category: expense.category || "Other",
                splitType: expense.splitType || "equal",
                date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : ""
            });

            // Set selected members from splitDetails
            const members = expense.splitDetails?.map(s => s.email) || [];
            setSelectedMembers(members);

            // Initialize custom splits from existing data
            const splits = {};
            expense.splitDetails?.forEach(split => {
                splits[split.email] = {
                    amount: split.amount || 0,
                    percentage: split.percentage || 0
                };
            });
            setCustomSplits(splits);
        }
    }, [show, expense]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMemberToggle = (email) => {
        setSelectedMembers(prev => {
            if (prev.includes(email)) {
                return prev.filter(m => m !== email);
            } else {
                return [...prev, email];
            }
        });
    };

    const handleCustomSplitChange = (email, field, value) => {
        setCustomSplits(prev => ({
            ...prev,
            [email]: { ...prev[email], [field]: parseFloat(value) || 0 }
        }));
    };

    const calculateSplitDetails = () => {
        const amount = parseFloat(formData.amount);
        const splitDetails = [];

        if (formData.splitType === "equal") {
            const perPerson = amount / selectedMembers.length;
            selectedMembers.forEach(email => {
                splitDetails.push({
                    email,
                    amount: perPerson,
                    isPaid: false
                });
            });
        } else if (formData.splitType === "exact") {
            selectedMembers.forEach(email => {
                splitDetails.push({
                    email,
                    amount: customSplits[email]?.amount || 0,
                    isPaid: false
                });
            });
        } else if (formData.splitType === "percentage") {
            selectedMembers.forEach(email => {
                const percentage = customSplits[email]?.percentage || 0;
                splitDetails.push({
                    email,
                    amount: (amount * percentage) / 100,
                    percentage,
                    isPaid: false
                });
            });
        }

        return splitDetails;
    };

    const validateSplit = () => {
        const amount = parseFloat(formData.amount);
        const splitDetails = calculateSplitDetails();
        const total = splitDetails.reduce((sum, split) => sum + split.amount, 0);

        if (formData.splitType === "exact" || formData.splitType === "percentage") {
            if (Math.abs(total - amount) > 0.01) {
                return `Split total (₹${total.toFixed(2)}) doesn't match expense amount (₹${amount.toFixed(2)})`;
            }
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (selectedMembers.length === 0) {
            setError("Please select at least one member");
            return;
        }

        const validationError = validateSplit();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const splitDetails = calculateSplitDetails();

            const expenseData = {
                title: formData.title,
                description: formData.description,
                amount: parseFloat(formData.amount),
                category: formData.category,
                splitType: formData.splitType,
                splitDetails,
                date: formData.date
            };

            await axios.put(`${serverEndpoint}/expenses/${expense._id}`, expenseData, {
                withCredentials: true
            });

            onExpenseUpdated();
            onClose();
        } catch (error) {
            console.error("Error updating expense:", error);
            setError(error.response?.data?.message || "Failed to update expense");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const totalCustomAmount = selectedMembers.reduce((sum, email) =>
        sum + (customSplits[email]?.amount || 0), 0);
    const totalPercentage = selectedMembers.reduce((sum, email) =>
        sum + (customSplits[email]?.percentage || 0), 0);

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-pencil me-2"></i>
                            Edit Expense
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger">{error}</div>
                            )}

                            <div className="row g-3">
                                <div className="col-md-8">
                                    <label className="form-label">Title *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Amount *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Food">Food</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Shopping">Shopping</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Bills">Bills</option>
                                        <option value="Health">Health</option>
                                        <option value="Travel">Travel</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="2"
                                    ></textarea>
                                </div>

                                <div className="col-12">
                                    <hr />
                                    <h6>Split Type</h6>
                                    <div className="btn-group w-100" role="group">
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="splitType"
                                            id="editSplitEqual"
                                            value="equal"
                                            checked={formData.splitType === "equal"}
                                            onChange={handleInputChange}
                                        />
                                        <label className="btn btn-outline-primary" htmlFor="editSplitEqual">
                                            <i className="bi bi-pie-chart me-2"></i>
                                            Equal
                                        </label>

                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="splitType"
                                            id="editSplitExact"
                                            value="exact"
                                            checked={formData.splitType === "exact"}
                                            onChange={handleInputChange}
                                        />
                                        <label className="btn btn-outline-primary" htmlFor="editSplitExact">
                                            <i className="bi bi-currency-rupee me-2"></i>
                                            Custom Amount
                                        </label>

                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="splitType"
                                            id="editSplitPercentage"
                                            value="percentage"
                                            checked={formData.splitType === "percentage"}
                                            onChange={handleInputChange}
                                        />
                                        <label className="btn btn-outline-primary" htmlFor="editSplitPercentage">
                                            <i className="bi bi-percent me-2"></i>
                                            Percentage
                                        </label>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <h6>Select Members</h6>
                                    <div className="list-group">
                                        {groupMembers?.map(email => (
                                            <div key={email} className="list-group-item">
                                                <div className="row align-items-center">
                                                    <div className="col-auto">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={selectedMembers.includes(email)}
                                                            onChange={() => handleMemberToggle(email)}
                                                        />
                                                    </div>
                                                    <div className="col">
                                                        {email}
                                                    </div>
                                                    {selectedMembers.includes(email) && formData.splitType === "exact" && (
                                                        <div className="col-auto">
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                placeholder="Amount"
                                                                value={customSplits[email]?.amount || ""}
                                                                onChange={(e) => handleCustomSplitChange(email, "amount", e.target.value)}
                                                                step="0.01"
                                                                min="0"
                                                                style={{ width: "120px" }}
                                                            />
                                                        </div>
                                                    )}
                                                    {selectedMembers.includes(email) && formData.splitType === "percentage" && (
                                                        <div className="col-auto">
                                                            <div className="input-group input-group-sm" style={{ width: "120px" }}>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="%"
                                                                    value={customSplits[email]?.percentage || ""}
                                                                    onChange={(e) => handleCustomSplitChange(email, "percentage", e.target.value)}
                                                                    step="0.01"
                                                                    min="0"
                                                                    max="100"
                                                                />
                                                                <span className="input-group-text">%</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {selectedMembers.includes(email) && formData.splitType === "equal" && formData.amount && (
                                                        <div className="col-auto text-muted">
                                                            ₹{(parseFloat(formData.amount) / selectedMembers.length).toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {formData.splitType === "exact" && formData.amount && (
                                        <div className="alert alert-info mt-2 mb-0">
                                            Total: ₹{totalCustomAmount.toFixed(2)} / ₹{formData.amount}
                                            {Math.abs(totalCustomAmount - parseFloat(formData.amount)) > 0.01 && (
                                                <span className="text-danger ms-2">
                                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                                    Mismatch!
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {formData.splitType === "percentage" && (
                                        <div className="alert alert-info mt-2 mb-0">
                                            Total: {totalPercentage.toFixed(2)}%
                                            {Math.abs(totalPercentage - 100) > 0.01 && (
                                                <span className="text-danger ms-2">
                                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                                    Should be 100%!
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Update Expense
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditExpenseModal;
