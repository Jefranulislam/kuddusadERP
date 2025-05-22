import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash, Phone, Mail } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ClientForm } from '../components/forms/client-form';
import { toast } from 'sonner';

export function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;

      toast.success('Client deleted successfully');
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  }

  function handleEdit(client) {
    setSelectedClient(client);
    setIsDialogOpen(true);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
    setSelectedClient(null);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {client.company_name}
                </h3>
                <p className="text-sm text-gray-500">{client.industry}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(client)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(client.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">{client.contact_email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">{client.contact_phone}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Contact Person: {client.contact_person}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogHeader>
          <DialogTitle>
            {selectedClient ? 'Edit Client' : 'Add New Client'}
          </DialogTitle>
        </DialogHeader>
        <ClientForm
          onSuccess={() => {
            handleCloseDialog();
            fetchClients();
          }}
          initialData={selectedClient}
        />
      </Dialog>
    </div>
  );
}