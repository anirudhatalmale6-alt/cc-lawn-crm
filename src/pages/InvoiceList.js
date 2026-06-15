import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateShort } from '../hooks/useHelpers';

export default function InvoiceList() {
  const { state } = useApp();

  const invoices = [...state.invoices].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="page-header">
        <h1>Invoices</h1>
        <Link to="/invoices/new" className="btn-new">+ New</Link>
      </div>

      {invoices.map(inv => {
        const client = state.clients.find(c => c.id === inv.clientId);
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

      {invoices.length === 0 && (
        <div className="empty-state"><p>No invoices yet</p></div>
      )}
    </div>
  );
}
