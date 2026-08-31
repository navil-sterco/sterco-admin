import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { graphqlRequest, GET_CATEGORIES, CREATE_PORTFOLIO, UPDATE_PORTFOLIO } from '../../api/portfolioGraphql';
import { assetUrl, urlFromBase } from '../../config';
import { uploadImage } from '../../utils/uploadImage';


export const PortfolioForm = ({ portfolio, onSaved, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    imageUrl: '',
    categoryId: '',
    subCategoryId:'',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await graphqlRequest(GET_CATEGORIES);
        setCategories(data.categories || []);

        if (portfolio) {
          setForm({
            imageUrl: portfolio.imageUrl || '',
            categoryId: portfolio.category?._id || '',
            subCategoryId: portfolio.subCategory?._id || '',
          });
        } else if (data.categories?.[0]?._id) {
          setForm((prev) => ({ ...prev, categoryId: data.categories[0]._id }));
        }
      } catch (err) {
        setError(err.message);
      }
    };

    loadCategories();
  }, [portfolio]);

  const selectedCategory = categories.find((c) => c._id === form.categoryId);
  const subCategories = selectedCategory?.subCategories || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'categoryId') {
      setForm((prev) => ({ ...prev, categoryId: value, subCategoryId: '' }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = form.imageUrl;

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      if (!imageUrl) {
        throw new Error('Please upload an image first');
      }

      const payload = {
        imageUrl,
        categoryId: form.categoryId,
        subCategoryId: form.subCategoryId || null,
      };

      if (portfolio?._id) {
        await graphqlRequest(UPDATE_PORTFOLIO, {
          id: portfolio._id,
          input: payload,
        });
      } else {
        await graphqlRequest(CREATE_PORTFOLIO, {
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
          <label className="form-label">Portfolio Image</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          {form.imageUrl && !selectedFile && (
            <div className="mb-3">
              <img src={assetUrl(form.imageUrl)} alt="Current portfolio" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8 }} />
            </div>
          )}
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
              No categories yet. <Link to="/categories">Create one first</Link>.
            </div>
          )}
        </div>

        {subCategories.length > 0 && (
          <div className="mb-3 col-md-6">
            <label className="form-label">Sub Category</label>
            <select
              name="subCategoryId"
              className="form-select"
              value={form.subCategoryId}
              onChange={handleChange}
            >
              <option value="">None</option>
              {subCategories.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>
        )}

      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : portfolio?._id ? 'Update' : 'Create'}
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
