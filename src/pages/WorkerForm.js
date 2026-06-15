import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { WORKER_ROLES } from '../data/seedData';
import { v4 as uuid } from 'uuid';

export default function WorkerForm() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const isEdit = !!id;
  const existing = isEdit ? state.workers.find(w => w.id === id) : null;

  const [form, setForm] = useState({
    name: existing?.name || '',
    role: existing?.role || 'Crew',
    payRate: existing?.payRate?.toString() || '',
    phone: existing?.phone || '',
    email: existing?.email || '',
    active: existing?.active ?? true,
    notes: existing?.notes || '',
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.payRate) return;

    const data = { ...form, payRate: parseFloat(form.payRate) };

    if (isEdit) {
      dispatch({ type: 'UPDATE_WORKER', payload: { ...existing, ...data } });
      navigate(`/crew/${id}`);
    } else {
      const newWorker = { id: uuid(), ...data };
      dispatch({ type: 'ADD_WORKER', payload: newWorker });
      navigate(`/crew/${newWorker.id}`);
    }
  }

  return (
    <div>
      <Link to={isEdit ? `/crew/${id}` : '/crew'} className="back-link">
        &#8592; Back
      </Link>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Worker' : 'New Worker'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            placeholder="e.g. Mike Johnson"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                {WORKER_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Pay Rate ($/hr)</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                placeholder="18.00"
                value={form.payRate}
                onChange={e => setForm({ ...form, payRate: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            className="form-input"
            placeholder="(724) 555-0100"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email (Optional)</label>
          <input
            className="form-input"
            type="email"
            placeholder="mike@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm({ ...form, active: e.target.checked })}
            />
            Active worker
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            placeholder="Vehicle, certifications, availability..."
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-green">
            {isEdit ? 'Save Changes' : 'Save Worker'}
          </button>
        </div>
      </form>
    </div>
  );
}
