import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getLastServiceDate, getNextServiceDate } from '../hooks/useHelpers';

export default function ClientDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const client = state.clients.find(c => c.id === id);
  if (!client) return <div className="empty-state"><p>Client not found</p></div>;

  const clientInvoices = state.invoices
    .filter(inv => inv.clientId === id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const balance = clientInvoices.filter(i => !i.paid).reduce((s, i) => s + i.total, 0);
  const lifetime = clientInvoices.reduce((s, i) => s + i.total, 0);

  const lastDate = getLastServiceDate(id, state.invoices);
  let serviceDueText = null;
  if (lastDate) {
    const nextDate = getNextServiceDate(lastDate, client.frequency);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next = new Date(nextDate + 'T12:00:00');
    next.setHours(0, 0, 0, 0);
    const diff = Math.floor((today - next) / (1000 * 60 * 60 * 24));
    if (diff >= 0) {
      serviceDueText = diff === 0 ? 'Service due today' : `Service ${diff} day${diff > 1 ? 's' : ''} overdue`;
    }
  }

  function handleDelete() {
    if (window.confirm(`Delete ${client.name}? This cannot be undone.`)) {
      dispatch({ type: 'DELETE_CLIENT', payload: id });
      navigate('/clients');
    }
  }

  return (
    <div>
      <div className="detail-top">
        <Link to="/clients" className="back-link" style={{ padding: 0 }}>&#8592; Clients</Link>
        <div className="actions">
          <Link to={`/clients/${id}/edit`} className="edit-btn">&#9998;</Link>
          <button className="delete-btn" onClick={handleDelete}>&#128465;</button>
        </div>
      </div>

      <div className="client-detail" style={{ marginTop: 16 }}>
        <h1>{client.name}</h1>
        <div className="contact-info">
          {client.phone} &middot; {client.address}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-type">{client.accountType}</span>
          <span className="badge badge-freq">{client.frequency}</span>
        </div>

        {client.notes && (
          <div className="notes-box">
            <strong>Notes</strong> &middot; {client.notes}
          </div>
        )}

        <div className="stat-boxes">
          <div className="stat-box">
            <div className="stat-label">Balance Due</div>
            <div className="stat-value">{formatCurrency(balance)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Lifetime</div>
            <div className="stat-value">{formatCurrency(lifetime)}</div>
          </div>
        </div>

        {serviceDueText && (
          <div className="service-due-banner">
            <div className="icon">&#9888;</div>
            <div className="text">
              <strong>{serviceDueText}</strong>
              <span>Last service was {lastDate ? formatDate(lastDate) : 'never'}</span>
            </div>
          </div>
        )}

        <Link to={`/invoices/new?client=${id}`} className="btn-gold" style={{ marginTop: 16, marginBottom: 24 }}>
          + New Invoice for {client.name.split(' ')[0]}
        </Link>

        <h2 style={{ marginBottom: 12 }}>Invoice History</h2>

        {clientInvoices.map(inv => {
          const serviceNames = inv.services.map(s => s.name).join(', ');
          const truncated = serviceNames.length > 30 ? serviceNames.slice(0, 30) + '...' : serviceNames;
          return (
            <Link to={`/invoices/${inv.id}`} className="card-link" key={inv.id}>
              <div className="card">
                <div className="invoice-item">
                  <div>
                    <div className="client-name">{formatDate(inv.date)}</div>
                    <div className="details">{truncated}</div>
                  </div>
                  <div className="right">
                    <div className="amount">{formatCurrency(inv.total)}</div>
                    <span className={`badge ${inv.paid ? 'badge-paid' : 'badge-unpaid'}`}>
                      {inv.paid ? 'PAID' : 'UNPAID'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {clientInvoices.length === 0 && (
          <div className="empty-state"><p>No invoices yet</p></div>
        )}
      </div>
    </div>
  );
}
