import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../hooks/useHelpers';

export default function InvoiceDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const invoice = state.invoices.find(i => i.id === id);
  if (!invoice) return <div className="empty-state"><p>Invoice not found</p></div>;

  const client = state.clients.find(c => c.id === invoice.clientId);
  const clientName = client?.name || 'Unknown';
  const firstName = clientName.split(' ')[0];

  function togglePaid() {
    dispatch({
      type: 'UPDATE_INVOICE',
      payload: { ...invoice, paid: !invoice.paid },
    });
  }

  function handleDelete() {
    if (window.confirm('Delete this invoice?')) {
      dispatch({ type: 'DELETE_INVOICE', payload: id });
      navigate('/');
    }
  }

  const smsText = `Hi ${firstName},

Your invoice from C&C Lawn Service:

Date: ${invoice.date}
${invoice.services.map(s => `• ${s.name} — ${formatCurrency(s.amount)}`).join('\n')}
${invoice.equipmentFees > 0 ? `\nEquipment fees: ${formatCurrency(invoice.equipmentFees)}` : ''}
Total: ${formatCurrency(invoice.total)}
Status: ${invoice.paid ? 'PAID — thank you!' : 'UNPAID — payment due upon receipt'}

— C&C Lawn Service
(724) 468-4959`;

  const smsLink = `sms:${client?.phone || ''}?body=${encodeURIComponent(smsText)}`;

  return (
    <div>
      <div className="detail-top">
        <Link to="/" className="back-link" style={{ padding: 0 }}>&#8592; Back</Link>
        <div className="actions">
          <button className="edit-btn" onClick={() => navigate(`/invoices/${id}/edit`)}>&#9998;</button>
          <button className="delete-btn" onClick={handleDelete}>&#128465;</button>
        </div>
      </div>

      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#6B6B6B' }}>
          Invoice
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, color: '#2C4A3E' }}>
          {formatDate(invoice.date)}
        </h1>
      </div>

      <div className="receipt">
        {invoice.paid && <div className="watermark">PAID</div>}
        <div className="company-header">
          <h3>C&amp;C Lawn Service, Inc.</h3>
          <p>PO Box 275 &middot; Slickville, PA 15684</p>
          <p>(724) 468-4959</p>
        </div>

        <hr className="divider" />

        <div className="to-section">
          <div>
            <div className="label">To</div>
            <div style={{ fontWeight: 600 }}>{clientName}</div>
            {client && <div style={{ fontSize: 13, color: '#6B6B6B' }}>{client.address}</div>}
            {client && <div style={{ fontSize: 13, color: '#6B6B6B' }}>{client.phone}</div>}
            {client && <span className="badge badge-type" style={{ marginTop: 4 }}>{client.accountType}</span>}
          </div>
          <div>
            <div className="label">Date</div>
            <div style={{ fontWeight: 600 }}>{invoice.date.replace(/-/g, '/').slice(5) + '/' + invoice.date.slice(2, 4)}</div>
          </div>
        </div>

        <table className="services-table">
          <thead>
            <tr>
              <th>Service</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.services.map((svc, idx) => (
              <tr key={idx}>
                <td>&#10004; {svc.name}</td>
                <td style={{ textAlign: 'center' }}>1</td>
                <td>{formatCurrency(svc.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {invoice.equipmentFees > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0' }}>
            <span>Equipment fees</span>
            <span style={{ fontFamily: "'Courier New', monospace" }}>{formatCurrency(invoice.equipmentFees)}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0', borderTop: '1px solid #D4C9B8' }}>
          <span>Subtotal</span>
          <span style={{ fontFamily: "'Courier New', monospace" }}>{formatCurrency(invoice.total)}</span>
        </div>

        <div className="total-section">
          <div className="total-row">
            <span className="total-label">TOTAL</span>
            <span className="total-amount">{formatCurrency(invoice.total)}</span>
          </div>
        </div>

        <div className="footer-note">
          Thank You &middot; Payment Due Upon Receipt
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <a href={smsLink} className="btn-green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', marginBottom: 12 }}>
          &#128172; Text Invoice to {firstName}
        </a>
        <button className="btn-outline" onClick={togglePaid}>
          {invoice.paid ? '✕ Mark Unpaid' : '✔ Mark Paid'}
        </button>
      </div>

      <div className="sms-preview">
        <div className="label">SMS Preview</div>
        <pre>{smsText}</pre>
      </div>
    </div>
  );
}
