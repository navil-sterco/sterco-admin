import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { graphqlRequest, GET_CATEGORIES, CREATE_PORTFOLIO, UPDATE_PORTFOLIO, UPDATE_CLIENT, CREATE_CLIENT } from '../../api/portfolioGraphql';
import { assetUrl, urlFromBase } from '../../config';
import { uploadImage } from '../../utils/uploadImage';


export const ClientForm = ({ client, onSaved, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    imageUrl: '',
    name:'',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await graphqlRequest(GET_CATEGORIES);
        setCategories(data.categories || []);

        if (client) {
          setForm({
            imageUrl: client.imageUrl || '',
            name: client.name || '',
          });
        } else if (data.categories?.[0]?._id) {
          setForm((prev) => ({ ...prev, categoryId: data.categories[0]._id }));
        }
      } catch (err) {
        setError(err.message);
      }
    };

    loadCategories();
  }, [client]);

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
        name:form.name
      };

      if (client?._id) {
        await graphqlRequest(UPDATE_CLIENT, {
          id: client._id,
          input: payload,
        });
      } else {
        await graphqlRequest(CREATE_CLIENT, {
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
          <label className="form-label">Client Image</label>
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
          <label className="form-label">Client Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={form.name}
            onChange={handleChange}
          />
          
        </div>

      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : client?._id ? 'Update' : 'Create'}
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
