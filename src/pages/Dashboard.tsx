import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, DollarSign, Users, Keyboard as Billboard } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalBillboards: 0,
    activeRentals: 0,
    totalRevenue: 0,
    totalClients: 0,
  });

  useEffect(() => {
    async function fetchDashboardStats() {
      const [billboards, rentals, clients, profitability] = await Promise.all([
        supabase.from('billboards').select('count').single(),
        supabase.from('rentals').select('count').eq('paid_status', 'Paid').single(),
        supabase.from('clients').select('count').single(),
        supabase.from('billboard_profitability').select('total_revenue'),
      ]);

      // Calculate total revenue by summing all billboard revenues
      const totalRevenue = profitability.data?.reduce((sum, item) => {
        return sum + (Number(item.total_revenue) || 0);
      }, 0) || 0;

      setStats({
        totalBillboards: billboards?.count || 0,
        activeRentals: rentals?.count || 0,
        totalRevenue: totalRevenue,
        totalClients: clients?.count || 0,
      });
    }

    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Billboards"
          value={stats.totalBillboards}
          icon={Billboard}
          color="blue"
        />
        <StatCard
          title="Active Rentals"
          value={stats.activeRentals}
          icon={BarChart}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="yellow"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          color="purple"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}