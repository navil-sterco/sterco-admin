import React, { useEffect, useState } from 'react';
import { graphqlRequest, CREATE_CATEGORY, UPDATE_CATEGORY, CREATE_SUB_CATEGORY, UPDATE_SUB_CATEGORY, GET_CATEGORIES } from '../../api/portfolioGraphql';
import { uploadImage } from '../../utils/uploadImage';
import { assetUrl } from '../../config';

export const SubCategoryForm = ({ category, onSaved, onCancel }) => {
  const [form, setForm] = useState({ name: '', isActive: true, categoryId: '' });
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {

    const loadSubCategories = async () => {
      try {
        const data = await graphqlRequest(GET_CATEGORIES);
        setCategories(data.categories || []);

        if (category) {
          setForm({ name: category.name || '', isActive: category.isActive ?? true, categoryId: category.category?._id || '', });
        } else {
          setForm({ name: '', isActive: true, categoryId: '' });
        }

      } catch (err) {
        setError(err.message);
      }
    };

    loadSubCategories();
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
        throw new Error('Sub Category name is required');
      }

      const payload = { name: form.name, isActive: form.isActive, categoryId: form.categoryId };

      if (category?._id) {
        await graphqlRequest(UPDATE_SUB_CATEGORY, {
          id: category._id,
          input: payload,
        });
      } else {
        await graphqlRequest(CREATE_SUB_CATEGORY, {
          input: payload,
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
          <label className="form-label">Sub Category Name</label>
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
                <label className="form-label">Category</label>
                <select
                  name="categoryId"
                  className="form-select"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <div className="form-text">
                    No categories yet. <a href="/categories">Create one first</a>.
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
