import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SERVICES } from '../data/seedData';
import { formatCurrency } from '../hooks/useHelpers';
import { v4 as uuid } from 'uuid';

export default function InvoiceForm() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClient = searchParams.get('client') || '';

  const [clientId, setClientId] = useState(preselectedClient);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [services, setServices] = useState(
    SERVICES.map(name => ({ name, checked: false, amount: '' }))
  );
  const [customServices, setCustomServices] = useState([]);
  const [equipmentFees, setEquipmentFees] = useState('');
  const [tax, setTax] = useState('');
  const [notes, setNotes] = useState('');

  function toggleService(idx) {
    const updated = [...services];
    updated[idx].checked = !updated[idx].checked;
    setServices(updated);
  }

  function setServiceAmount(idx, val) {
    const updated = [...services];
    updated[idx].amount = val;
    setServices(updated);
  }

  function addCustomService() {
    setCustomServices([...customServices, { name: '', amount: '' }]);
  }

  function updateCustom(idx, field, val) {
    const updated = [...customServices];
    updated[idx][field] = val;
    setCustomServices(updated);
  }

  const subtotal = [
    ...services.filter(s => s.checked).map(s => parseFloat(s.amount) || 0),
    ...customServices.map(s => parseFloat(s.amount) || 0),
  ].reduce((a, b) => a + b, 0);

  const eqFees = parseFloat(equipmentFees) || 0;
  const taxAmt = parseFloat(tax) || 0;
  const total = subtotal + eqFees + taxAmt;

  function handleSubmit(e) {
    e.preventDefault();
    if (!clientId) return;

    const checkedServices = services
      .filter(s => s.checked && parseFloat(s.amount) > 0)
      .map(s => ({ name: s.name, amount: parseFloat(s.amount) }));

    const customs = customServices
      .filter(s => s.name.trim() && parseFloat(s.amount) > 0)
      .map(s => ({ name: s.name, amount: parseFloat(s.amount) }));

    const invoice = {
      id: uuid(),
      clientId,
      date,
      services: [...checkedServices, ...customs],
      equipmentFees: eqFees,
      tax: taxAmt,
      total,
      paid: false,
      notes,
    };

    dispatch({ type: 'ADD_INVOICE', payload: invoice });
    navigate(`/invoices/${invoice.id}`);
  }

  return (
    <div>
      <Link to="/" className="back-link">&#8592; Back</Link>
      <div className="page-header">
        <h1>New Invoice</h1>
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
          <label className="form-label">Invoice Date</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div style={{ padding: '0 20px 8px' }}>
          <label className="form-label">Work Done</label>
        </div>

        <div className="service-checklist">
          {services.map((svc, idx) => (
            <div className="service-row" key={svc.name}>
              <input
                type="checkbox"
                checked={svc.checked}
                onChange={() => toggleService(idx)}
              />
              <span className="service-name">{svc.name}</span>
              <input
                className="amount-input"
                type="number"
                step="0.01"
                placeholder="—"
                value={svc.amount}
                onChange={e => setServiceAmount(idx, e.target.value)}
                disabled={!svc.checked}
              />
            </div>
          ))}

          {customServices.map((cs, idx) => (
            <div className="service-row" key={`custom-${idx}`}>
              <input type="checkbox" checked readOnly />
              <input
                className="service-name"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
                placeholder="Custom service name"
                value={cs.name}
                onChange={e => updateCustom(idx, 'name', e.target.value)}
              />
              <input
                className="amount-input"
                type="number"
                step="0.01"
                placeholder="—"
                value={cs.amount}
                onChange={e => updateCustom(idx, 'amount', e.target.value)}
              />
            </div>
          ))}

          <button type="button" className="add-custom-btn" onClick={addCustomService}>
            + Add Custom Service
          </button>
        </div>

        <div className="form-group">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Equipment Fees</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={equipmentFees}
                onChange={e => setEquipmentFees(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tax</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={tax}
                onChange={e => setTax(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            placeholder="Optional notes for this job..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ minHeight: 60 }}
          />
        </div>

        <div className="invoice-totals">
          <div className="row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {eqFees > 0 && (
            <div className="row">
              <span>Equipment Fees</span>
              <span>{formatCurrency(eqFees)}</span>
            </div>
          )}
          {taxAmt > 0 && (
            <div className="row">
              <span>Tax</span>
              <span>{formatCurrency(taxAmt)}</span>
            </div>
          )}
          <div className="total-row">
            <span>TOTAL</span>
            <span className="total-amount">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-green">Save Invoice</button>
        </div>
      </form>
    </div>
  );
}
