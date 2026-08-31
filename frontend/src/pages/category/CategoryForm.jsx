import React, { useEffect, useState } from 'react';
import { graphqlRequest, CREATE_CATEGORY, UPDATE_CATEGORY } from '../../api/portfolioGraphql';
import { uploadImage } from '../../utils/uploadImage';
import { assetUrl } from '../../config';

export const CategoryForm = ({ category, onSaved, onCancel }) => {
  const [form, setForm] = useState({ name: '', isActive: true, imageUrl: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setForm({ name: category.name || '', isActive: category.isActive ?? true, imageUrl: category.imageUrl || 'test' });
    } else {
      setForm({ name: '', isActive: true, imageUrl: '' });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!form.name.trim()) {
        throw new Error('Category name is required');
      }

      let imageUrl = form.imageUrl;

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      if (category?._id) {
        await graphqlRequest(UPDATE_CATEGORY, {
          id: category._id,
          input: { name: form.name, isActive: form.isActive, imageUrl },
        });
      } else {
        await graphqlRequest(CREATE_CATEGORY, {
          input: { name: form.name, isActive: form.isActive, imageUrl },
        });
      }

      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-body">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="mb-3 col-md-6">
          <label className="form-label">Category Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Branding, Web Design"
            required
          />
        </div>

        <div className="mb-3 col-md-6">
          <label className="form-label">Category Icon</label>
          <input
            type="file"
            accept="image/*"
            name="icon"
            className="form-control"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />

          {form.imageUrl && (
              <div className="mt-2">
                <img src={assetUrl(form.imageUrl)} alt="Current portfolio" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} />
              </div>
            )}
        </div>

        
      </div>

      

      <div className="mb-3 form-check form-switch">
        <input
          type="checkbox"
          className="form-check-input"
          id="isActive"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="isActive">Active</label>
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : category?._id ? 'Update' : 'Create'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
