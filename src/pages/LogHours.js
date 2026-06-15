import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../hooks/useHelpers';
import { v4 as uuid } from 'uuid';

export default function LogHours() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [workerId, setWorkerId] = useState(id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');

  const selectedWorker = state.workers.find(w => w.id === workerId);
  const projection = selectedWorker && hours
    ? parseFloat(hours) * selectedWorker.payRate
    : 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (!workerId || !hours) return;

    dispatch({
      type: 'ADD_TIME_ENTRY',
      payload: {
        id: uuid(),
        workerId,
        date,
        hours: parseFloat(hours),
        clientId: clientId || null,
        paid: false,
        notes,
      },
    });

    navigate(`/crew/${workerId}`);
  }

  return (
    <div>
      <Link to={id ? `/crew/${id}` : '/crew'} className="back-link">&#8592; Back</Link>
      <div className="page-header">
        <h1>Log Hours</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Worker</label>
          <select
            className="form-select"
            value={workerId}
            onChange={e => setWorkerId(e.target.value)}
            required
          >
            <option value="">Select a worker...</option>
            {state.workers.filter(w => w.active).map(w => (
              <option key={w.id} value={w.id}>
                {w.name} &middot; ${w.payRate.toFixed(2)}/hr
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hours</label>
              <input
                className="form-input"
                type="number"
                step="0.1"
                placeholder="4.5"
                value={hours}
                onChange={e => setHours(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Client (Optional)</label>
          <select
            className="form-select"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
          >
            <option value="">— None —</option>
            {state.clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div style={{ fontSize: 12, color: '#9B9B9B', marginTop: 4 }}>
            Link this entry to a specific job
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            placeholder="What was done, equipment used, conditions..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ minHeight: 80 }}
          />
        </div>

        {projection > 0 && (
          <div style={{ padding: '0 20px 16px', textAlign: 'center' }}>
            <div style={{ background: '#E8F0E8', borderRadius: 10, padding: 12, fontSize: 14, color: '#4A7A5A', fontWeight: 600 }}>
              Cost projection: {formatCurrency(projection)}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-green">Save Time Entry</button>
        </div>
      </form>
    </div>
  );
}
