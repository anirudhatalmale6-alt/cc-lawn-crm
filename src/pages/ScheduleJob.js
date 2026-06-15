import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ScheduleJob() {
  const { state } = useApp();
  const navigate = useNavigate();

  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [notes, setNotes] = useState('');

  function toggleWorker(wid) {
    setSelectedWorkers(prev =>
      prev.includes(wid) ? prev.filter(id => id !== wid) : [...prev, wid]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!clientId) return;
    navigate(`/invoices/new?client=${clientId}`);
  }

  return (
    <div>
      <Link to="/schedule" className="back-link">&#8592; Back</Link>
      <div className="page-header">
        <h1>Schedule Job</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Client</label>
          <select
            className="form-select"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            required
          >
            <option value="">Select a client...</option>
            {state.clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

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
          <label className="form-label">Assign Workers (Optional)</label>
          <div style={{ padding: 0 }}>
            {state.workers.filter(w => w.active).map(worker => (
              <div className="worker-check" key={worker.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedWorkers.includes(worker.id)}
                    onChange={() => toggleWorker(worker.id)}
                  />
                  {worker.name}
                </label>
                <span className="rate">${worker.payRate.toFixed(2)}/hr</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            placeholder="Special equipment, access notes, etc."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ minHeight: 80 }}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-green">Schedule Job</button>
        </div>
      </form>
    </div>
  );
}
