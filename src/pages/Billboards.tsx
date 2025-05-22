import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { BillboardForm } from '../components/forms/billboard-form';
import { toast } from 'sonner';

export function Billboards() {
  const [billboards, setBillboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBillboard, setSelectedBillboard] = useState(null);

  useEffect(() => {
    fetchBillboards();
  }, []);

  async function fetchBillboards() {
    try {
      const { data, error } = await supabase
        .from('billboards')
        .select(`
          *,
          partner_billboard_shares (
            partner:partners(name),
            share_percentage
          )
        `);

      if (error) throw error;
      setBillboards(data || []);
    } catch (error) {
      console.error('Error fetching billboards:', error);
      toast.error('Failed to fetch billboards');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from('billboards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Billboard deleted successfully');
      fetchBillboards();
    } catch (error) {
      console.error('Error deleting billboard:', error);
      toast.error('Failed to delete billboard');
    }
  }

  function handleEdit(billboard) {
    setSelectedBillboard(billboard);
    setIsDialogOpen(true);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
    setSelectedBillboard(null);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Billboards</h1>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Billboard
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partners
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {billboards.map((billboard) => (
              <tr key={billboard.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {billboard.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{billboard.size}</td>
                <td className="px-6 py-4 whitespace-nowrap">{billboard.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      billboard.current_status === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {billboard.current_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {billboard.partner_billboard_shares?.map((share) => (
                    <div key={share.id}>
                      {share.partner.name} ({share.share_percentage}%)
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={() => handleEdit(billboard)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(billboard.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogHeader>
          <DialogTitle>
            {selectedBillboard ? 'Edit Billboard' : 'Add New Billboard'}
          </DialogTitle>
        </DialogHeader>
        <BillboardForm
          onSuccess={() => {
            handleCloseDialog();
            fetchBillboards();
          }}
          initialData={selectedBillboard}
        />
      </Dialog>
    </div>
  );
}