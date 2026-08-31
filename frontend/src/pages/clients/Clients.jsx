import React, { useEffect, useRef, useState } from 'react';
import { graphqlRequest, DELETE_CLIENT } from '../../api/portfolioGraphql';
import { ConfirmModal } from '../../components/ConfirmModal';
import { assetUrl } from '../../config';
import { GET_CLIENTS } from '../../api/portfolioGraphql';
import { ClientForm } from './ClientForm';

export const Clients = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const confirmModalRef = useRef(null);

    const loadPortfolios = async () => {
        try {
            setLoading(true);
            const data = await graphqlRequest(GET_CLIENTS);
            setItems(data.clients.items || []);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPortfolios();
    }, []);

    const handleDelete = async (id) => {
        const confirmed = await confirmModalRef.current.confirm({
            message: 'Are you sure you want to delete this client image? This action cannot be undone.',
        });
        if (!confirmed) return;

        try {
            setDeleting(true);
            await graphqlRequest(DELETE_CLIENT, { id });
            confirmModalRef.current.hide();
            loadPortfolios();
        } catch (err) {
            setError(err.message);
            confirmModalRef.current.hide();
        } finally {
            setDeleting(false);
        }
    };

    const handleSaved = () => {
        setEditing(null);
        setShowForm(false);
        loadPortfolios();
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="py-3 mb-0"><span className="text-muted fw-light">Portfolio /</span> Clients</h4>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                        setEditing(null);
                        setShowForm(true);
                    }}
                >
                    Add Client
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {showForm && (
                <>
                    <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }} aria-modal="true" role="dialog">
                        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editing ? 'Edit Client' : 'Add Client'}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={() => {
                                            setEditing(null);
                                            setShowForm(false);
                                        }}
                                    ></button>
                                </div>
                                <div className="modal-body p-4">
                                    <ClientForm
                                        client={editing}
                                        onSaved={handleSaved}
                                        onCancel={() => {
                                            setEditing(null);
                                            setShowForm(false);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" />
                </>
            )}

            <div className="card">
                <h5 className="card-header">Client List</h5>
                <div className="table-responsive text-nowrap">
                    {loading ? (
                        <div className="p-4">Loading...</div>
                    ) : (
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-border-bottom-0">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center p-4">No portfolios found.</td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item._id}>
                                            <td>
                                                {item.imageUrl ? (
                                                    <img
                                                        src={assetUrl(item.imageUrl)}
                                                        alt={item.category?.name || 'Portfolio'}
                                                        style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }}
                                                    />
                                                ) : (
                                                    <span className="text-muted">No image</span>
                                                )}
                                            </td>
                                            <td>{item.name || 'Unnamed Client'}</td>
                                            <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => {
                                                            setEditing(item);
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(item._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            <ConfirmModal
                ref={confirmModalRef}
                title="Delete Portfolio"
                confirmLabel="Yes, Delete"
                processingLabel="Deleting..."
                processing={deleting}
            />
        </>
    )
}
