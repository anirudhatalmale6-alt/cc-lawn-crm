import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateShort, getLastServiceDate, getNextServiceDate } from '../hooks/useHelpers';

export default function Dashboard() {
  const { state } = useApp();
  const { clients, invoices } = state;

  const outstanding = invoices.filter(i => !i.paid).reduce((s, i) => s + i.total, 0);
  const thisMonth = invoices
    .filter(i => i.paid && i.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, i) => s + i.total, 0);
  const activeClients = clients.length;

  const servicesDue = clients
    .map(client => {
      const lastDate = getLastServiceDate(client.id, invoices);
      if (!lastDate) return { client, daysOverdue: 0, lastDate: null, isNew: true };
      const nextDate = getNextServiceDate(lastDate, client.frequency);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const next = new Date(nextDate + 'T12:00:00');
      next.setHours(0, 0, 0, 0);
      const diff = Math.floor((today - next) / (1000 * 60 * 60 * 24));
      return { client, daysOverdue: diff, lastDate, nextDate, isNew: false };
    })
    .filter(s => s.daysOverdue >= 0 || s.isNew)
    .sort((a, b) => {
      if (a.isNew && !b.isNew) return 1;
      if (!a.isNew && b.isNew) return -1;
      return b.daysOverdue - a.daysOverdue;
    });

  const recentInvoices = [...invoices]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div>
      <div className="dashboard-header">
        <div className="tagline">
          <span className="leaf">&#9880;</span>
          Maintenance &middot; Invoices &middot; CRM
          <span className="leaf">&#9880;</span>
        </div>
        <h1>C&amp;C Lawn Service</h1>
        <div className="motto">"Our Business Is Always Growing"</div>
        <div className="date">Today &middot; {dateStr}</div>
      </div>

      <div className="hero-card">
        <div className="label">Outstanding Balance</div>
        <div className="amount">{formatCurrency(outstanding)}</div>
        <div className="stats-row">
          <div>
            <div className="stat-label">Paid This Month</div>
            <div className="stat-value">{formatCurrency(thisMonth)}</div>
          </div>
          <div>
            <div className="stat-label">Active Clients</div>
            <div className="stat-value">{activeClients}</div>
          </div>
        </div>
      </div>

      <Link to="/invoices/new" className="new-invoice-btn">
        + New Invoice
      </Link>

      <div className="section-header">
        <h2>Service Due</h2>
        <Link to="/schedule">All &rsaquo;</Link>
      </div>

      {servicesDue.slice(0, 3).map(({ client, daysOverdue, lastDate, isNew }) => (
        <Link to={`/clients/${client.id}`} className="card-link" key={client.id}>
          <div className="card">
            <div className="service-due-item">
              <div>
                <div className="client-name">{client.name}</div>
                <div className="last-service">
                  Last service {lastDate ? formatDateShort(lastDate) : 'Never'} &middot; {client.frequency}
                </div>
              </div>
              {isNew ? (
                <span className="badge badge-today">NEW</span>
              ) : daysOverdue === 0 ? (
                <span className="badge badge-today">TODAY</span>
              ) : (
                <span className="badge-overdue">{daysOverdue}D</span>
              )}
            </div>
          </div>
        </Link>
      ))}

      {servicesDue.length === 0 && (
        <div className="empty-state"><p>No services due right now</p></div>
      )}

      <div className="section-header" style={{ marginTop: 16 }}>
        <h2>Recent Invoices</h2>
        <Link to="/invoices">Browse &rsaquo;</Link>
      </div>

      {recentInvoices.map(inv => {
        const client = clients.find(c => c.id === inv.clientId);
        const serviceNames = inv.services.map(s => s.name).join(', ');
        const truncated = serviceNames.length > 30 ? serviceNames.slice(0, 30) + '...' : serviceNames;
        return (
          <Link to={`/invoices/${inv.id}`} className="card-link" key={inv.id}>
            <div className="card">
              <div className="invoice-item">
                <div>
                  <div className="client-name">{client?.name || 'Unknown'}</div>
                  <div className="details">
                    {formatDateShort(inv.date)} &middot; {truncated}
                  </div>
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
    </div>
  );
}
