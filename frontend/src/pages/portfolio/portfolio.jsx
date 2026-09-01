import React, { useEffect, useRef, useState } from 'react';
import { graphqlRequest, GET_PORTFOLIOS, DELETE_PORTFOLIO, UPDATE_PORTFOLIO } from '../../api/portfolioGraphql';
import { PortfolioForm } from './PortfolioForm';
import { ConfirmModal } from '../../components/ConfirmModal';
import { assetUrl } from '../../config';

export const Portfolio = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const confirmModalRef = useRef(null);

    const loadPortfolios = async () => {
        try {
            setLoading(true);
            const data = await graphqlRequest(GET_PORTFOLIOS);
            setItems(data.portfolios || []);
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

    const handleFeaturedToggle = async(item)=>{
        const nextValue = !item.isFeatured;

        setItems((prev)=>(
            prev.map((p)=>p._id === item._id ? {...p, isFeatured: nextValue} : p)
        ))
        setTogglingId(item._id);

        try{
            await graphqlRequest(UPDATE_PORTFOLIO, {
                id: item._id,
                input:{isFeatured: nextValue}
            })
        }catch(err){
            setItems((prev) =>
                prev.map((p) => (p._id === item._id ? { ...p, isFeatured: !nextValue } : p))
            );
            setError(err.message);
        }finally {
            setTogglingId(null);
        }
    }

    const handleDelete = async (id) => {
        const confirmed = await confirmModalRef.current.confirm({
            message: 'Are you sure you want to delete this portfolio image? This action cannot be undone.',
        });
        if (!confirmed) return;

        try {
            setDeleting(true);
            await graphqlRequest(DELETE_PORTFOLIO, { id });
            confirmModalRef.current.hide();
            loadPortfolios();
        } catch (err) {
            setError(err.message);
            confirmModalRef.current.hide();
        } finally {
            setDeleting(false);
        }
    };

    const handleOrderChange = (item, e) => {
        const value = e.target.value;
        const nextOrder = value === '' ? 0 : Number(value);

        setItems((prev) =>
            prev.map((p) => (p._id === item._id ? { ...p, order: nextOrder } : p))
        );
    }

    const handleOrderSave = async (item) => {
        setTogglingId(item._id);
        try {
            await graphqlRequest(UPDATE_PORTFOLIO, {
                id: item._id,
                input: { order: item.order },
            });
        } catch (err) {
            setError(err.message);
            loadPortfolios(); // revert to server truth on failure
        } finally {
            setTogglingId(null);
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
                <h4 className="py-3 mb-0"><span className="text-muted fw-light">Portfolio /</span> Manage</h4>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                        setEditing(null);
                        setShowForm(true);
                    }}
                >
                    Add Portfolio
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {showForm && (
                <>
                    <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }} aria-modal="true" role="dialog">
                        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editing ? 'Edit Portfolio' : 'Add Portfolio'}</h5>
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
                                    <PortfolioForm
                                        portfolio={editing}
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
                <h5 className="card-header">Portfolio List</h5>
                <div className="table-responsive text-nowrap">
                    {loading ? (
                        <div className="p-4">Loading...</div>
                    ) : (
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Category</th>
                                    <th>Sub Category</th>
                                    <th>Featured</th>
                                    <th>Order</th>
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
                                            <td>{item.category?.name || 'Uncategorized'}</td>
                                            <td>{item.subCategory?.name || '-'}</td>
                                            <td>
                                                <div class="mb-6">
                                                    <div class="form-check form-switch">
                                                        <input 
                                                            class="form-check-input" type="checkbox" 
                                                            id={`featured-${item._id}`}
                                                            required="" 
                                                            checked={!!item.isFeatured}
                                                            disabled={togglingId === item._id}
                                                            onChange={() => handleFeaturedToggle(item)}
                                                        />
                                                        
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.order} 
                                                    onChange={(e) => handleOrderChange(item, e)} 
                                                    disabled={togglingId === item._id}
                                                    onBlur={() => handleOrderSave(item)}
                                                    style={{ width: 50 }}
                                                />
                                            </td>
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
