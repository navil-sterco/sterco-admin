import React, { useEffect, useState } from 'react';
import { assetUrl, urlFromBase } from '../../config';
import { uploadImage } from '../../utils/uploadImage';
import { CREATE_NEWS, GET_NEWS_LIST, newsGraphqlRequest, UPDATE_NEWS } from '../../api/newsGraphql';
import {caseStudiesGraphqlRequest, CREATE_CASE_STUDY, GET_CASE_STUDIES, UPDATE_CASE_STUDY } from '../../api/caseStudiesGraphql';


export const CaseStudiesForm = ({ caseStudy, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    title: '',
    thumbnailImage:'',
    logoImage:'',
    date:'',
    htmlContent:'',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
      const loadCaseStudies = async () => {
        try {
          const data = await caseStudiesGraphqlRequest(GET_CASE_STUDIES);
          setForm(data.caseStudies.items || []);
  
          if (caseStudy) {
            setForm({
              thumbnailImage: caseStudy.thumbnailImage || '',
              logoImage: caseStudy.logoImage || '',
              title: caseStudy.title || '',
              htmlContent: caseStudy.htmlContent || '',
              date: caseStudy.date
            ? new Date(caseStudy.date).toISOString().split('T')[0]
            : '',
            });
          } else if (data.caseStudies.items?.[0]?._id) {
            setForm((prev) => ({ ...prev, ...data.caseStudies.items[0]._id }));
          }
        } catch (err) {
          setError(err.message);
        }
      };
  
      loadCaseStudies();
    }, [caseStudy]);


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
      let thumbnailImageUrl = form.thumbnailImage;
      let logoImageUrl = form.logoImage;

      if (selectedFile) {
        thumbnailImageUrl = await uploadImage(selectedFile);
      }

      if (selectedLogoFile) {
        logoImageUrl = await uploadImage(selectedLogoFile);
      }

      if (!thumbnailImageUrl) {
        throw new Error('Please upload a thumbnail image first');
      }

      const payload = {
        thumbnailImage: thumbnailImageUrl,
        logoImage: logoImageUrl,
        title: form.title,
        date: form.date,
        htmlContent: form.htmlContent,
      };

      if (caseStudy?._id) {
        await caseStudiesGraphqlRequest(UPDATE_CASE_STUDY, {
          id: caseStudy._id,
          input: payload,
        });
      } else {
        await caseStudiesGraphqlRequest(CREATE_CASE_STUDY, {
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
          <label className="form-label">Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          {form.thumbnailImage && !selectedFile && (
            <div className="mb-3">
              <img src={assetUrl(form.thumbnailImage)} alt="Current portfolio" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8 }} />
            </div>
          )}
        </div>

        <div className="mb-3 col-md-6">
          <label className="form-label">Logo</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setSelectedLogoFile(e.target.files?.[0] || null)}
          />
          {form.logoImage && !selectedLogoFile && (
            <div className="mb-3">
              <img src={assetUrl(form.logoImage)} alt="Current portfolio" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8 }} />
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
          <label className="form-label">Date</label>
          <input
            type="date"
            name="date"
            className="form-control"
            value={form.date}
            onChange={handleChange}
          />
          
        </div>

        <div className="mb-3 col-md-12">
          <label className="form-label">Description</label>
          <textarea
            // type="text"
            name="htmlContent"
            className="form-control"
            value={form.htmlContent}
            onChange={handleChange}
            rows={12}
          />
          
        </div>

      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : caseStudy?._id ? 'Update' : 'Create'}
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
