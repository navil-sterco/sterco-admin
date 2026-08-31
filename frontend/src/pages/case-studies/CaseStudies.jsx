import React, { useEffect, useRef, useState } from 'react';
import { ConfirmModal } from '../../components/ConfirmModal';
import { assetUrl } from '../../config';
import { CaseStudiesForm } from './CaseStudiesForm';
import {caseStudiesGraphqlRequest, GET_CASE_STUDIES} from '../../api/caseStudiesGraphql';

export const CaseStudies = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const confirmModalRef = useRef(null);

    const loadCaseStudies = async () => {
        try {
            setLoading(true);
            const data = await caseStudiesGraphqlRequest(GET_CASE_STUDIES);
            setItems(data.caseStudies.items || []);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCaseStudies();
    }, []);

    const handleDelete = async (id) => {
        const confirmed = await confirmModalRef.current.confirm({
            message: 'Are you sure you want to delete this case study? This action cannot be undone.',
        });
        if (!confirmed) return;

        try {
            setDeleting(true);
            await caseStudiesGraphqlRequest(DELETE_CASE_STUDY, { id });
            confirmModalRef.current.hide();
            loadCaseStudies();
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
        loadCaseStudies();
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="py-3 mb-0"><span className="text-muted fw-light">Portfolio /</span> Case Studies</h4>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                        setEditing(null);
                        setShowForm(true);
                    }}
                >
                    Add Case Study
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {showForm && (
                <>
                    <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }} aria-modal="true" role="dialog">
                        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editing ? 'Edit Case Study' : 'Add Case Study'}</h5>
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
                                    <CaseStudiesForm
                                        caseStudy={editing}
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
                <h5 className="card-header">Case Studies</h5>
                <div className="table-responsive text-nowrap">
                    {loading ? (
                        <div className="p-4">Loading...</div>
                    ) : (
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Thumbnail Image</th>
                                    <th>Logo</th>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-border-bottom-0">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center p-4">No news found.</td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item._id}>
                                            <td>
                                                {item.thumbnailImage ? (
                                                    <img
                                                        src={assetUrl(item.thumbnailImage)}
                                                        alt={item.title || '-'}
                                                        style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }}
                                                    />
                                                ) : (
                                                    <span className="text-muted">No image</span>
                                                )}
                                            </td>
                                            <td>
                                                {item.logoImage ? (
                                                    <img
                                                        src={assetUrl(item.logoImage)}
                                                        alt={item.title || '-'}
                                                        style={{ width: 80, height: 60, objectFit: 'contain', borderRadius: 8 }}
                                                    />
                                                ) : (
                                                    <span className="text-muted">No image</span>
                                                )}
                                            </td>
                                            <td>{item.title || '-'}</td>
                                            <td>{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) || '-'}</td>
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
                title="Delete News"
                confirmLabel="Yes, Delete"
                processingLabel="Deleting..."
                processing={deleting}
            />
        </>
    )
}
