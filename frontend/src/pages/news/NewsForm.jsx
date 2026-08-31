import React, { useEffect, useState } from 'react';
import { assetUrl, urlFromBase } from '../../config';
import { uploadImage } from '../../utils/uploadImage';
import { CREATE_NEWS, GET_NEWS_LIST, newsGraphqlRequest, UPDATE_NEWS } from '../../api/newsGraphql';


export const NewsForm = ({ news, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    imageUrl: '',
    title:'',
    description:'',
    date:''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
      const loadNews = async () => {
        try {
          const data = await newsGraphqlRequest(GET_NEWS_LIST);
          setForm(data.newsList.items || []);
  
          if (news) {
            setForm({
              imageUrl: news.imageUrl || '',
              title: news.title || '',
              description: news.description || '',
              date: news.date
            ? new Date(news.date).toISOString().split('T')[0]
            : '',
            });
          } else if (data.newsList.items?.[0]?._id) {
            setForm((prev) => ({ ...prev, ...data.newsList.items[0]._id }));
          }
        } catch (err) {
          setError(err.message);
        }
      };
  
      loadNews();
    }, [news]);


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
        title:form.title,
        description:form.description,
        date:form.date
      };

      if (news?._id) {
        await newsGraphqlRequest(UPDATE_NEWS, {
          id: news._id,
          input: payload,
        });
      } else {
        await newsGraphqlRequest(CREATE_NEWS, {
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
          <label className="form-label">Image</label>
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
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={form.title}
            onChange={handleChange}
          />
          
        </div>

        <div className="mb-3 col-md-6">
          <label className="form-label">Description</label>
          <textarea
            // type="text"
            name="description"
            className="form-control"
            value={form.description}
            onChange={handleChange}
          />
          
        </div>

        <div className="mb-3 col-md-6">
          <label className="form-label">Date</label>
          <input
            type="date"
            name="date"
            className="form-control"
            value={form.date}
            onChange={handleChange}
          />
          
        </div>

      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : news?._id ? 'Update' : 'Create'}
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
