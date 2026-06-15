import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../hooks/useHelpers';

export default function ClientList() {
  const { state } = useApp();
  const [search, setSearch] = useState('');

  const filtered = state.clients.filter(c => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.phone.includes(q);
  });

  function getBalance(clientId) {
    return state.invoices
      .filter(inv => inv.clientId === clientId && !inv.paid)
      .reduce((sum, inv) => sum + inv.total, 0);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Clients</h1>
        <Link to="/clients/new" className="btn-new">+ New</Link>
      </div>

      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, address, or phone"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.map(client => {
        const balance = getBalance(client.id);
        return (
          <Link to={`/clients/${client.id}`} className="card-link" key={client.id}>
            <div className="card client-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div className="client-name">{client.name}</div>
                  <div className="client-info">
                    <span>&#9742; {client.phone}</span>
                    <span>&middot;</span>
                    <span>{client.address}</span>
                  </div>
                  <div className="tags">
                    <span className="badge badge-type">{client.accountType}</span>
                    <span className="badge badge-freq">{client.frequency}</span>
                  </div>
                </div>
                {balance > 0 ? (
                  <div className="owes">
                    <div className="owes-label">Owes</div>
                    <div className="owes-amount">{formatCurrency(balance)}</div>
                  </div>
                ) : (
                  <div className="check-icon">&#10004;</div>
                )}
              </div>
            </div>
          </Link>
        );
      })}

      {filtered.length === 0 && (
        <div className="empty-state"><p>No clients found</p></div>
      )}
    </div>
  );
}
