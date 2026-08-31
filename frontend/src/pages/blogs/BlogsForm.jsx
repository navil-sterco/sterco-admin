import React, { useEffect, useState } from 'react';
import { assetUrl } from '../../config';
import { uploadImage } from '../../utils/uploadImage';
import { blogsGraphqlRequest, GET_BLOGS, CREATE_BLOG, UPDATE_BLOG } from '../../api/blogsGraphql';

export const BlogsForm = ({ blog, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'General',
    imageUrl: '',
    date: '',
    status: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBlogDefaults = async () => {
      try {
        const data = await blogsGraphqlRequest(GET_BLOGS);
        if (blog) {
          setForm({
            title: blog.title || '',
            slug: blog.slug || '',
            excerpt: blog.excerpt || '',
            content: blog.content || '',
            category: blog.category || 'General',
            imageUrl: blog.imageUrl || '',
            date: blog.date ? new Date(blog.date).toISOString().split('T')[0] : '',
            status: blog.status ?? true,
          });
        } else if (data.blogList?.items?.[0]) {
          setForm((prev) => ({ ...prev, category: data.blogList.items[0].category || 'General' }));
        }
      } catch (err) {
        setError(err.message);
      }
    };

    loadBlogDefaults();
  }, [blog]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!form.title.trim()) {
        throw new Error('Blog title is required');
      }

      if (!form.content.trim()) {
        throw new Error('Blog content is required');
      }

      let imageUrl = form.imageUrl;
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const payload = {
        title: form.title,
        slug: form.slug || form.title,
        excerpt: form.excerpt,
        content: form.content,
        category: form.category || 'General',
        imageUrl,
        date: form.date || new Date().toISOString(),
        status: form.status,
      };

      if (blog?._id) {
        await blogsGraphqlRequest(UPDATE_BLOG, {
          id: blog._id,
          input: payload,
        });
      } else {
        await blogsGraphqlRequest(CREATE_BLOG, {
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
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={form.title}
            onChange={handleChange}
            placeholder="Blog title"
            required
          />
        </div>

        <div className="mb-3 col-md-6">
          <label className="form-label">Slug</label>
          <input
            type="text"
            name="slug"
            className="form-control"
            value={form.slug}
            onChange={handleChange}
            placeholder="blog-slug"
          />
        </div>

        <div className="mb-3 col-md-6">
          <label className="form-label">Category</label>
          <input
            type="text"
            name="category"
            className="form-control"
            value={form.category}
            onChange={handleChange}
            placeholder="General"
          />
        </div>

        <div className="mb-3 col-md-6">
          <label className="form-label">Publish Date</label>
          <input
            type="date"
            name="date"
            className="form-control"
            value={form.date}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3 col-md-6">
          <label className="form-label">Featured Image</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          {form.imageUrl && !selectedFile && (
            <div className="mt-2">
              <img
                src={assetUrl(form.imageUrl)}
                alt="Current blog"
                style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8 }}
              />
            </div>
          )}
        </div>

        <div className="mb-3 col-md-6">
          <label className="form-label">Excerpt</label>
          <textarea
            name="excerpt"
            className="form-control"
            rows="3"
            value={form.excerpt}
            onChange={handleChange}
            placeholder="Short summary"
          />
        </div>

        <div className="mb-3 col-12">
          <label className="form-label">Content</label>
          <textarea
            name="content"
            className="form-control"
            rows="8"
            value={form.content}
            onChange={handleChange}
            placeholder="Write blog content here"
            required
          />
        </div>
      </div>

      <div className="mb-3 form-check form-switch">
        <input
          type="checkbox"
          className="form-check-input"
          id="blogStatus"
          name="status"
          checked={form.status}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="blogStatus">Active</label>
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : blog?._id ? 'Update' : 'Create'}
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
