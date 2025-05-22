import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash, Download } from 'lucide-react';

export function TaxReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const { data, error } = await supabase
        .from('yearly_tax_reports')
        .select(`
          *,
          client:clients(company_name)
        `);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching tax reports:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tax Reports</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {report.year} Report
                </h3>
                <p className="text-sm text-gray-500">
                  {report.client.company_name}
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <Edit className="w-5 h-5" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Rent:</span>
                <span className="font-medium">
                  ${report.total_rent_collected.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">AIT Deducted:</span>
                <span className="font-medium">
                  ${report.total_ait_deducted.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT Deducted:</span>
                <span className="font-medium">
                  ${report.total_vat_deducted.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    report.ait_receipts_submitted
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {report.ait_receipts_submitted
                    ? 'Receipts Submitted'
                    : 'Pending Receipts'}
                </span>
                {report.summary_report_url && (
                  <a
                    href={report.summary_report_url}
                    className="text-blue-600 hover:text-blue-900 flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    <span className="text-sm">Download</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}