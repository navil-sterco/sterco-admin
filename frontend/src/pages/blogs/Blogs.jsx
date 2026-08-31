import React, { useEffect, useRef, useState } from 'react';
import { ConfirmModal } from '../../components/ConfirmModal';
import { assetUrl } from '../../config';
import { BlogsForm } from './BlogsForm';
import { blogsGraphqlRequest, GET_BLOGS, DELETE_BLOG } from '../../api/blogsGraphql';

export const Blogs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const confirmModalRef = useRef(null);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogsGraphqlRequest(GET_BLOGS);
      setItems(data.blogList.items || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = await confirmModalRef.current.confirm({
      message: 'Are you sure you want to delete this blog? This action cannot be undone.',
    });

    if (!confirmed) return;

    try {
      setDeleting(true);
      await blogsGraphqlRequest(DELETE_BLOG, { id });
      confirmModalRef.current.hide();
      loadBlogs();
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
    loadBlogs();
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="py-3 mb-0"><span className="text-muted fw-light">Content /</span> Blogs</h4>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          Add Blog
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <>
          <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }} aria-modal="true" role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-xl" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editing ? 'Edit Blog' : 'Add Blog'}</h5>
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
                  <BlogsForm
                    blog={editing}
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
        <h5 className="card-header">Blogs List</h5>
        <div className="table-responsive text-nowrap">
          {loading ? (
            <div className="p-4">Loading...</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="table-border-bottom-0">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4">No blogs found.</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id}>
                      <td>
                        {item.imageUrl ? (
                          <img
                            src={assetUrl(item.imageUrl)}
                            alt={item.title || 'Blog'}
                            style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }}
                          />
                        ) : (
                          <span className="text-muted">No image</span>
                        )}
                      </td>
                      <td>{item.title || '-'}</td>
                      <td>{item.category || 'General'}</td>
                      <td>{item.date ? new Date(item.date).toLocaleDateString() : '-'}</td>
                      <td>
                        <span className={`badge ${item.status ? 'bg-label-success' : 'bg-label-secondary'}`}>
                          {item.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
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
        title="Delete Blog"
        confirmLabel="Yes, Delete"
        processingLabel="Deleting..."
        processing={deleting}
      />
    </>
  );
};
