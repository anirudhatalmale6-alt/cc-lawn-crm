import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getLastServiceDate, getNextServiceDate, getZipFromAddress } from '../hooks/useHelpers';

export default function Schedule() {
  const { state } = useApp();
  const { clients, invoices } = state;

  const scheduled = clients
    .map(client => {
      const lastDate = getLastServiceDate(client.id, invoices);
      const nextDate = lastDate
        ? getNextServiceDate(lastDate, client.frequency)
        : new Date().toISOString().split('T')[0];
      const zip = getZipFromAddress(client.address);
      return { client, nextDate, zip };
    })
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate) || a.zip.localeCompare(b.zip));

  const dayGroups = {};
  scheduled.forEach(item => {
    const d = new Date(item.nextDate + 'T12:00:00');
    const dayKey = item.nextDate;
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'numeric', day: 'numeric', year: '2-digit' });
    if (!dayGroups[dayKey]) dayGroups[dayKey] = { label: dayLabel, date: dayKey, items: [] };
    dayGroups[dayKey].items.push(item);
  });

  const sortedDays = Object.values(dayGroups).sort((a, b) => a.date.localeCompare(b.date));

  function getZipGroups(items) {
    const groups = {};
    items.forEach(item => {
      if (!groups[item.zip]) groups[item.zip] = [];
      groups[item.zip].push(item);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function getDayDisplayLabel(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    d.setHours(0, 0, 0, 0);
    const diff = Math.floor((d - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }

  return (
    <div>
      <div className="page-header">
        <h1>Schedule</h1>
        <Link to="/schedule/new" className="btn-new">+ Add Job</Link>
      </div>

      <p style={{ padding: '0 20px 16px', fontSize: 13, color: '#6B6B6B' }}>
        Grouped by date and ZIP for efficient routes
      </p>

      {sortedDays.slice(0, 14).map(day => {
        const zipGroups = getZipGroups(day.items);
        const totalStops = day.items.length;
        const displayLabel = getDayDisplayLabel(day.date);
        const dateShort = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });

        return (
          <div className="schedule-day" key={day.date}>
            <div className="day-header">
              <h3>{displayLabel} <span style={{ fontWeight: 400, fontSize: 14, color: '#6B6B6B' }}>{dateShort}</span></h3>
              <span className="count">{totalStops} stop{totalStops !== 1 ? 's' : ''}</span>
            </div>

            {zipGroups.map(([zip, items]) => {
              let stopNum = 0;
              return (
                <div className="zip-group" key={zip}>
                  <div className="zip-header">
                    <span className="zip-code">ZIP {zip}</span>
                    <span className="stop-count">{items.length} stop{items.length !== 1 ? 's' : ''}</span>
                  </div>
                  {items.map(item => {
                    stopNum++;
                    return (
                      <div className="schedule-stop" key={item.client.id}>
                        <div className="stop-header">
                          <span className="stop-number">{stopNum}</span>
                          <span className="client-name">{item.client.name}</span>
                          <span className="auto-badge">AUTO</span>
                        </div>
                        <div className="stop-detail">
                          &#128205; {item.client.address}<br />
                          {item.client.frequency} &middot; {item.client.accountType}
                        </div>
                        <div className="stop-actions">
                          <button className="btn-assign">&#128100; Assign</button>
                          <Link
                            to={`/invoices/new?client=${item.client.id}`}
                            className="btn-complete"
                          >
                            &#10004; Complete &amp; Invoice
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}

      {sortedDays.length === 0 && (
        <div className="empty-state"><p>No scheduled jobs</p></div>
      )}
    </div>
  );
}
