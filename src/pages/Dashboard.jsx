import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT;

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [financialData, setFinancialData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFinancialSummary();
    }, []);

    const fetchFinancialSummary = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${serverEndpoint}/api/users/financial-summary`, {
                withCredentials: true
            });
            setFinancialData(response.data);
        } catch (error) {
            console.error('Error fetching financial summary:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const navigateToGroup = (groupId) => {
        navigate(`/groups/${groupId}`);
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Dashboard</h2>

            {/* Financial Overview Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card text-white bg-danger">
                        <div className="card-body">
                            <h6 className="card-title">You Owe</h6>
                            <h3 className="mb-0">₹{financialData?.totalToPay.toFixed(2)}</h3>
                            <small>Total to pay</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-success">
                        <div className="card-body">
                            <h6 className="card-title">You Get Back</h6>
                            <h3 className="mb-0">₹{financialData?.totalToReceive.toFixed(2)}</h3>
                            <small>Total to receive</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-primary">
                        <div className="card-body">
                            <h6 className="card-title">Net Balance</h6>
                            <h3 className="mb-0">
                                {financialData?.netBalance >= 0 ? '+' : ''}₹{financialData?.netBalance.toFixed(2)}
                            </h3>
                            <small>Overall</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-info">
                        <div className="card-body">
                            <h6 className="card-title">Total Groups</h6>
                            <h3 className="mb-0">{financialData?.groupCount}</h3>
                            <small>Active groups</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Groups List */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Your Groups</h5>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate('/groups')}
                    >
                        View All Groups
                    </button>
                </div>
                <div className="card-body">
                    {financialData?.groups.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="text-muted">You're not part of any groups yet.</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/groups')}
                            >
                                Create Your First Group
                            </button>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {financialData?.groups.map((group) => (
                                <div key={group.groupId} className="col-md-6 col-lg-4">
                                    <div className="card h-100 shadow-sm">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h6 className="card-title mb-0">{group.groupName}</h6>
                                                {group.isAdmin && (
                                                    <span className="badge bg-warning text-dark">Admin</span>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <small className="text-muted">
                                                    {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                                                </small>
                                            </div>

                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="text-muted">Paid:</span>
                                                    <span className="fw-bold">₹{group.totalPaid.toFixed(2)}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="text-muted">Share:</span>
                                                    <span className="fw-bold">₹{group.totalShare.toFixed(2)}</span>
                                                </div>
                                                <hr />
                                                <div className="d-flex justify-content-between">
                                                    <span className="fw-bold">Balance:</span>
                                                    <span className={`fw-bold ${group.netBalance > 0 ? 'text-success' :
                                                            group.netBalance < 0 ? 'text-danger' :
                                                                'text-secondary'
                                                        }`}>
                                                        {group.netBalance > 0 && '+'}₹{group.netBalance.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="d-grid">
                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => navigateToGroup(group.groupId)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;