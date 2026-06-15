import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ACCOUNT_TYPES, FREQUENCIES } from '../data/seedData';
import { v4 as uuid } from 'uuid';

export default function ClientForm() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const isEdit = !!id;
  const existing = isEdit ? state.clients.find(c => c.id === id) : null;

  const [form, setForm] = useState({
    name: existing?.name || '',
    phone: existing?.phone || '',
    address: existing?.address || '',
    accountType: existing?.accountType || 'Residential',
    frequency: existing?.frequency || 'Monthly',
    notes: existing?.notes || '',
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    if (isEdit) {
      dispatch({ type: 'UPDATE_CLIENT', payload: { ...existing, ...form } });
      navigate(`/clients/${id}`);
    } else {
      const newClient = { id: uuid(), ...form };
      dispatch({ type: 'ADD_CLIENT', payload: newClient });
      navigate(`/clients/${newClient.id}`);
    }
  }

  return (
    <div>
      <Link to={isEdit ? `/clients/${id}` : '/clients'} className="back-link">
        &#8592; Back
      </Link>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Client' : 'New Client'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            placeholder="e.g. John Haas"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone (Required for SMS)</label>
          <input
            className="form-input"
            placeholder="(724) 555-0100"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            className="form-input"
            placeholder="123 Main St, Slickville, PA"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <div className="form-group">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select
                className="form-select"
                value={form.accountType}
                onChange={e => setForm({ ...form, accountType: e.target.value })}
              >
                {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select
                className="form-select"
                value={form.frequency}
                onChange={e => setForm({ ...form, frequency: e.target.value })}
              >
                {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            placeholder="Gate code, dog at house, preferred mowing height..."
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-green">
            {isEdit ? 'Save Changes' : 'Save Client'}
          </button>
        </div>
      </form>
    </div>
  );
}
