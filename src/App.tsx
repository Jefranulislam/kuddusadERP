import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Billboards } from './pages/Billboards';
import { Clients } from './pages/Clients';
import { Partners } from './pages/Partners';
import { Rentals } from './pages/Rentals';
import { Expenses } from './pages/Expenses';
import { Payments } from './pages/Payments';
import { TaxReports } from './pages/TaxReports';
import { Reports } from './pages/Reports';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/billboards" element={<Billboards />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/tax-reports" element={<TaxReports />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;