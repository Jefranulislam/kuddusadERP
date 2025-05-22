import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash, Phone, Mail } from 'lucide-react';

export function Partners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  async function fetchPartners() {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select(`
          *,
          partner_billboard_shares (
            billboard:billboards(location)
          )
        `);

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Partners</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Partner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <div key={partner.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {partner.name}
                </h3>
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
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">{partner.contact_email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">{partner.contact_phone}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Associated Billboards
              </h4>
              <div className="space-y-1">
                {partner.partner_billboard_shares?.map((share) => (
                  <p key={share.id} className="text-sm text-gray-600">
                    {share.billboard.location}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}