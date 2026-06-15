import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../hooks/useHelpers';

export default function CrewList() {
  const { state } = useApp();

  const workersWithStats = state.workers.map(worker => {
    const entries = state.timeEntries.filter(te => te.workerId === worker.id);
    const unpaid = entries.filter(te => !te.paid);
    const unpaidHours = unpaid.reduce((s, te) => s + te.hours, 0);
    const owed = unpaidHours * worker.payRate;
    const lifetimeHours = entries.reduce((s, te) => s + te.hours, 0);
    return { worker, owed, unpaidHours, lifetimeHours };
  });

  const totalOwed = workersWithStats.reduce((s, w) => s + w.owed, 0);
  const activeCount = state.workers.filter(w => w.active).length;

  return (
    <div>
      <div className="page-header">
        <h1>Crew</h1>
        <Link to="/crew/new" className="btn-new">+ New</Link>
      </div>

      <div className="crew-summary">
        {activeCount} active &middot; {formatCurrency(totalOwed)} owed
      </div>

      {workersWithStats.map(({ worker, owed, unpaidHours, lifetimeHours }) => (
        <Link to={`/crew/${worker.id}`} className="card-link" key={worker.id}>
          <div className="card">
            <div className="crew-card">
              <div>
                <div className="worker-name">{worker.name}</div>
                <div className="worker-info">
                  {worker.role} &middot; ${worker.payRate.toFixed(2)}/hr
                </div>
                <div className="worker-info">{lifetimeHours.toFixed(1)} lifetime hrs</div>
              </div>
              {owed > 0 ? (
                <div className="owed">
                  <div className="owed-label">Owed</div>
                  <div className="owed-amount">{formatCurrency(owed)}</div>
                  <div className="owed-hours">{unpaidHours.toFixed(1)} hrs</div>
                </div>
              ) : (
                <div style={{ color: '#4A7A5A', fontSize: 20 }}>&#10004;</div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
