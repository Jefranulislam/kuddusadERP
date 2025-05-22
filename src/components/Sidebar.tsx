import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Keyboard as Billboard, Users, Handshake, Receipt, WalletCards, DollarSign, FileText, BarChart } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/billboards', icon: Billboard, label: 'Billboards' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/partners', icon: Handshake, label: 'Partners' },
  { path: '/rentals', icon: Receipt, label: 'Rentals' },
  { path: '/expenses', icon: WalletCards, label: 'Expenses' },
  { path: '/payments', icon: DollarSign, label: 'Payments' },
  { path: '/tax-reports', icon: FileText, label: 'Tax Reports' },
  { path: '/reports', icon: BarChart, label: 'Custom Reports' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Billboard MS</h1>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 ${
                isActive ? 'bg-gray-50 border-r-4 border-blue-500' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}