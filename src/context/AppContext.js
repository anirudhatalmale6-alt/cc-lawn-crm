import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { seedClients, seedWorkers, seedInvoices, seedTimeEntries } from '../data/seedData';

const AppContext = createContext();

const STORAGE_KEY = 'cc-lawn-crm';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    clients: seedClients,
    workers: seedWorkers,
    invoices: seedInvoices,
    timeEntries: seedTimeEntries,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(c => c.id !== action.payload),
      };
    case 'ADD_INVOICE':
      return { ...state, invoices: [...state.invoices, action.payload] };
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(i =>
          i.id === action.payload.id ? action.payload : i
        ),
      };
    case 'DELETE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.filter(i => i.id !== action.payload),
      };
    case 'ADD_WORKER':
      return { ...state, workers: [...state.workers, action.payload] };
    case 'UPDATE_WORKER':
      return {
        ...state,
        workers: state.workers.map(w =>
          w.id === action.payload.id ? action.payload : w
        ),
      };
    case 'ADD_TIME_ENTRY':
      return { ...state, timeEntries: [...state.timeEntries, action.payload] };
    case 'PAY_WORKER': {
      const workerId = action.payload;
      return {
        ...state,
        timeEntries: state.timeEntries.map(te =>
          te.workerId === workerId && !te.paid ? { ...te, paid: true } : te
        ),
      };
    }
    case 'RESET_DATA':
      return {
        clients: seedClients,
        workers: seedWorkers,
        invoices: seedInvoices,
        timeEntries: seedTimeEntries,
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
