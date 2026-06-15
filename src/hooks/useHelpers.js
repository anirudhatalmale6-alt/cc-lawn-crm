import { useApp } from '../context/AppContext';

export function useClientBalance(clientId) {
  const { state } = useApp();
  return state.invoices
    .filter(inv => inv.clientId === clientId && !inv.paid)
    .reduce((sum, inv) => sum + inv.total, 0);
}

export function useClientLifetime(clientId) {
  const { state } = useApp();
  return state.invoices
    .filter(inv => inv.clientId === clientId)
    .reduce((sum, inv) => sum + inv.total, 0);
}

export function useWorkerBalance(workerId) {
  const { state } = useApp();
  const worker = state.workers.find(w => w.id === workerId);
  if (!worker) return { owed: 0, unpaidHours: 0 };
  const unpaid = state.timeEntries.filter(te => te.workerId === workerId && !te.paid);
  const unpaidHours = unpaid.reduce((sum, te) => sum + te.hours, 0);
  return { owed: unpaidHours * worker.payRate, unpaidHours };
}

export function useWorkerLifetime(workerId) {
  const { state } = useApp();
  const worker = state.workers.find(w => w.id === workerId);
  if (!worker) return { totalHours: 0, totalPay: 0 };
  const entries = state.timeEntries.filter(te => te.workerId === workerId);
  const totalHours = entries.reduce((sum, te) => sum + te.hours, 0);
  return { totalHours, totalPay: totalHours * worker.payRate };
}

export function formatCurrency(amount) {
  return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
}

export function getZipFromAddress(address) {
  const match = address.match(/\b(\d{5})\b/);
  return match ? match[1] : 'Unknown';
}

export function getDaysDiff(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T12:00:00');
  d.setHours(0, 0, 0, 0);
  return Math.floor((today - d) / (1000 * 60 * 60 * 24));
}

export function getNextServiceDate(lastServiceDate, frequency) {
  const d = new Date(lastServiceDate + 'T12:00:00');
  switch (frequency) {
    case 'Weekly': d.setDate(d.getDate() + 7); break;
    case 'Bi-Weekly': d.setDate(d.getDate() + 14); break;
    case 'Monthly': d.setMonth(d.getMonth() + 1); break;
    case '3 Months': d.setMonth(d.getMonth() + 3); break;
    default: d.setDate(d.getDate() + 7);
  }
  return d.toISOString().split('T')[0];
}

export function getLastServiceDate(clientId, invoices) {
  const clientInvoices = invoices
    .filter(inv => inv.clientId === clientId)
    .sort((a, b) => b.date.localeCompare(a.date));
  return clientInvoices.length > 0 ? clientInvoices[0].date : null;
}
