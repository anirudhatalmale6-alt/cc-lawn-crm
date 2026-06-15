import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateShort } from '../hooks/useHelpers';

export default function WorkerDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();

  const worker = state.workers.find(w => w.id === id);
  if (!worker) return <div className="empty-state"><p>Worker not found</p></div>;

  const entries = state.timeEntries
    .filter(te => te.workerId === id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const unpaid = entries.filter(te => !te.paid);
  const unpaidHours = unpaid.reduce((s, te) => s + te.hours, 0);
  const owed = unpaidHours * worker.payRate;

  const lifetimeHours = entries.reduce((s, te) => s + te.hours, 0);
  const lifetimePay = lifetimeHours * worker.payRate;

  function handlePayout() {
    if (window.confirm(`Pay out ${formatCurrency(owed)} to ${worker.name}?`)) {
      dispatch({ type: 'PAY_WORKER', payload: id });
    }
  }

  return (
    <div>
      <Link to="/crew" className="back-link">&#8592; Crew</Link>

      <div style={{ padding: '12px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, color: '#2C4A3E' }}>
            {worker.name}
          </h1>
          <div style={{ fontSize: 14, color: '#6B6B6B' }}>
            {worker.role} &middot; ${worker.payRate.toFixed(2)}/hr
            {worker.phone ? ` · ${worker.phone}` : ''}
          </div>
          <span className="badge" style={{
            marginTop: 8,
            background: worker.active ? '#E8F0E8' : '#F5E0DC',
            color: worker.active ? '#4A7A5A' : '#B44B3A',
            border: `1px solid ${worker.active ? '#C0D8C0' : '#E0C0B8'}`,
          }}>
            {worker.active ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
        <Link to={`/crew/${id}/edit`} className="edit-btn">&#9998;</Link>
      </div>

      <div className="worker-hero">
        <div className="balance-label">Balance Owed</div>
        <div className="balance-amount">{formatCurrency(owed)}</div>
        <div className="unpaid-hours">{unpaidHours.toFixed(1)} unpaid hrs</div>
        {owed > 0 && (
          <button className="payout-btn" onClick={handlePayout}>
            &#128176; Pay Out {formatCurrency(owed)}
          </button>
        )}
      </div>

      <div style={{ padding: '0 20px' }}>
        <div className="stat-boxes">
          <div className="stat-box">
            <div className="stat-label">Lifetime Hours</div>
            <div className="stat-value">{lifetimeHours.toFixed(1)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Lifetime Pay</div>
            <div className="stat-value">{formatCurrency(lifetimePay)}</div>
          </div>
        </div>

        <Link to={`/crew/${id}/log`} className="btn-gold" style={{ marginBottom: 24 }}>
          + Log Hours for {worker.name.split(' ')[0]}
        </Link>

        <h2 style={{ marginBottom: 12 }}>Time Entries</h2>

        {entries.map(te => {
          const client = state.clients.find(c => c.id === te.clientId);
          return (
            <div className="time-entry" key={te.id}>
              <div>
                <div className="date">{formatDateShort(te.date)}</div>
                <div className="client">{client?.name || '—'}</div>
                <span className={`badge ${te.paid ? 'badge-paid' : 'badge-unpaid'}`} style={{ marginTop: 4 }}>
                  {te.paid ? 'PAID' : 'UNPAID'}
                </span>
              </div>
              <div className="right">
                <div className="hours">{te.hours.toFixed(1)} hrs</div>
                <div className="pay">{formatCurrency(te.hours * worker.payRate)}</div>
              </div>
            </div>
          );
        })}

        {entries.length === 0 && (
          <div className="empty-state"><p>No time entries yet</p></div>
        )}
      </div>
    </div>
  );
}
