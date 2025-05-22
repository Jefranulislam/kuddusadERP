import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, DollarSign, PieChart, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export function Reports() {
  const [partners, setPartners] = useState([]);
  const [billboards, setBillboards] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [selectedBillboard, setSelectedBillboard] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    const [partnersData, billboardsData] = await Promise.all([
      supabase.from('partners').select('*'),
      supabase.from('billboards').select('*')
    ]);

    if (partnersData.data) setPartners(partnersData.data);
    if (billboardsData.data) setBillboards(billboardsData.data);
  }

  async function generateReport() {
    setLoading(true);
    try {
      // Fetch partner investments
      const { data: partnerShares } = await supabase
        .from('partner_billboard_shares')
        .select(`
          *,
          billboard:billboards(
            *,
            rentals(
              *,
              payments(*),
              client:clients(*)
            )
          )
        `)
        .eq('partner_id', selectedPartner);

      // Calculate total investment and revenue
      const reportSummary = {
        totalInvestment: 0,
        totalRevenue: 0,
        billboards: [],
        partnerProfit: 0,
        pendingPayments: 0
      };

      if (partnerShares) {
        partnerShares.forEach(share => {
          const billboard = share.billboard;
          const billboardSummary = {
            location: billboard.location,
            investment: billboard.structure_installation_cost * (share.share_percentage / 100),
            sharePercentage: share.share_percentage,
            rentals: [],
            totalRevenue: 0,
            partnerRevenue: 0
          };

          billboard.rentals.forEach(rental => {
            const rentalSummary = {
              client: rental.client.company_name,
              amount: rental.total_rent_amount,
              paidAmount: rental.payments.reduce((sum, payment) => sum + payment.amount_paid, 0),
              startDate: rental.rental_start_date,
              endDate: rental.rental_end_date
            };

            billboardSummary.rentals.push(rentalSummary);
            billboardSummary.totalRevenue += rental.total_rent_amount;
            billboardSummary.partnerRevenue += (rental.total_rent_amount * share.share_percentage / 100);
          });

          reportSummary.billboards.push(billboardSummary);
          reportSummary.totalInvestment += billboardSummary.investment;
          reportSummary.totalRevenue += billboardSummary.totalRevenue;
          reportSummary.partnerProfit += billboardSummary.partnerRevenue;
        });
      }

      setReportData(reportSummary);
      setShowReport(true);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Custom Reports</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Partner</label>
            <Select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="mt-1"
            >
              <option value="">Select Partner</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={generateReport}
              disabled={loading || !selectedPartner}
              className="w-full"
            >
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {showReport && reportData && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Partner Investment & Revenue Report</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Investment"
                value={`$${reportData.totalInvestment.toLocaleString()}`}
                icon={DollarSign}
                color="blue"
              />
              <StatCard
                title="Total Revenue"
                value={`$${reportData.totalRevenue.toLocaleString()}`}
                icon={TrendingUp}
                color="green"
              />
              <StatCard
                title="Partner's Profit"
                value={`$${reportData.partnerProfit.toLocaleString()}`}
                icon={PieChart}
                color="yellow"
              />
              <StatCard
                title="Active Billboards"
                value={reportData.billboards.length}
                icon={Calendar}
                color="purple"
              />
            </div>

            <div className="space-y-6">
              {reportData.billboards.map((billboard, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">{billboard.location}</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Investment Share</p>
                      <p className="font-medium">${billboard.investment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Share Percentage</p>
                      <p className="font-medium">{billboard.sharePercentage}%</p>
                    </div>
                  </div>

                  <h4 className="font-medium mb-2">Rentals</h4>
                  <div className="space-y-2">
                    {billboard.rentals.map((rental, rentalIndex) => (
                      <div key={rentalIndex} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between">
                          <span className="font-medium">{rental.client}</span>
                          <span className="text-green-600">${rental.amount.toLocaleString()}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(rental.startDate), 'MMM d, yyyy')} - 
                          {format(new Date(rental.endDate), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm">
                          Paid: ${rental.paidAmount.toLocaleString()}
                          {rental.amount > rental.paidAmount && (
                            <span className="text-red-500 ml-2">
                              (Pending: ${(rental.amount - rental.paidAmount).toLocaleString()})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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