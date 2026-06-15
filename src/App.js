import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import ClientForm from './pages/ClientForm';
import InvoiceList from './pages/InvoiceList';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceDetail from './pages/InvoiceDetail';
import Schedule from './pages/Schedule';
import ScheduleJob from './pages/ScheduleJob';
import CrewList from './pages/CrewList';
import WorkerDetail from './pages/WorkerDetail';
import WorkerForm from './pages/WorkerForm';
import LogHours from './pages/LogHours';
import './index.css';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/clients/:id/edit" element={<ClientForm />} />
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/new" element={<InvoiceForm />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/schedule/new" element={<ScheduleJob />} />
            <Route path="/crew" element={<CrewList />} />
            <Route path="/crew/new" element={<WorkerForm />} />
            <Route path="/crew/:id" element={<WorkerDetail />} />
            <Route path="/crew/:id/edit" element={<WorkerForm />} />
            <Route path="/crew/:id/log" element={<LogHours />} />
          </Routes>
          <BottomNav />
        </div>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
