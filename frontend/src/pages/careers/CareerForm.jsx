import React, { useEffect, useState } from 'react';
import { careerGraphqlRequest, CREATE_CAREER, GET_CAREERS, UPDATE_CAREER } from '../../api/careerGraphql';


export const CareerForm = ({ career, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    title: '',
    experience:'',
    industry:'',
    joining:'',
    responsibilities:'',
    requirements:'',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
      const loadCareers = async () => {
        try {
          const data = await careerGraphqlRequest(GET_CAREERS);
          setForm(data.careers.items || []);
  
          if (career) {
            setForm({
              title: career.title || '',
              experience: career.experience || '',
              industry: career.industry || '',
              joining: career.joining || '',
              responsibilities: career.responsibilities || '',
              requirements: career.requirements || '',
            });
          }
        } catch (err) {
          setError(err.message);
        }
      };
  
      loadCareers();
    }, [career]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        title: form.title,
        experience: form.experience,
        industry: form.industry,
        joining: form.joining,
        responsibilities: form.responsibilities,
        requirements: form.requirements,
      };

      if (career?._id) {
        await careerGraphqlRequest(UPDATE_CAREER, {
          id: career._id,
          input: payload,
        });
      } else {
        await careerGraphqlRequest(CREATE_CAREER, {
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

        <div className="mb-3 col-md-12">
          <label className="form-label">Job Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={form.title}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3 col-md-12">
          <label className="form-label">Experience</label>
          <input
            type="text"
            name="experience"
            className="form-control"
            value={form.experience}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3 col-md-12">
          <label className="form-label">Industry</label>
          <input
            type="text"
            name="industry"
            className="form-control"
            value={form.industry}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3 col-md-12">
          <label className="form-label">Joining</label>
          <input
            type="text"
            name="joining"
            className="form-control"
            value={form.joining}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3 col-md-12">
          <label className="form-label">Responsibilities</label>
          <textarea
            // type="text"
            name="responsibilities"
            className="form-control"
            value={form.responsibilities}
            onChange={handleChange}
            rows={12}
          />
          
        </div>

        <div className="mb-3 col-md-12">
          <label className="form-label">Requirements</label>
          <textarea
            // type="text"
            name="requirements"
            className="form-control"
            value={form.requirements}
            onChange={handleChange}
            rows={12}
          />
          
        </div>

      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : career ? 'Update' : 'Create'}
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
