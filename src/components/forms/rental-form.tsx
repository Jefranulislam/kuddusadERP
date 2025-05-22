import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

const rentalSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  billboard_id: z.string().min(1, 'Billboard is required'),
  rental_start_date: z.string().min(1, 'Start date is required'),
  rental_end_date: z.string().min(1, 'End date is required'),
  total_rent_amount: z.string().transform((val) => parseFloat(val)),
  payment_mode: z.string().min(1, 'Payment mode is required'),
  pvc_cost: z.string().transform((val) => parseFloat(val)),
  fitting_cost: z.string().transform((val) => parseFloat(val)),
  notes: z.string().optional(),
});

type RentalFormData = z.infer<typeof rentalSchema>;

interface RentalFormProps {
  onSuccess: () => void;
  initialData?: Partial<RentalFormData>;
}

export function RentalForm({ onSuccess, initialData }: RentalFormProps) {
  const [clients, setClients] = useState([]);
  const [billboards, setBillboards] = useState([]);

  const form = useForm<RentalFormData>({
    resolver: zodResolver(rentalSchema),
    defaultValues: initialData || {
      client_id: '',
      billboard_id: '',
      rental_start_date: '',
      rental_end_date: '',
      total_rent_amount: '',
      payment_mode: '',
      pvc_cost: '0',
      fitting_cost: '0',
      notes: '',
    },
  });

  useEffect(() => {
    async function fetchData() {
      const [clientsResponse, billboardsResponse] = await Promise.all([
        supabase.from('clients').select('id, company_name'),
        supabase
          .from('billboards')
          .select('id, location')
          .eq('current_status', 'Available'),
      ]);

      if (clientsResponse.data) setClients(clientsResponse.data);
      if (billboardsResponse.data) setBillboards(billboardsResponse.data);
    }

    fetchData();
  }, []);

  async function onSubmit(data: RentalFormData) {
    try {
      const { error } = initialData?.client_id
        ? await supabase
            .from('rentals')
            .update(data)
            .eq('client_id', initialData.client_id)
        : await supabase.from('rentals').insert(data);

      if (error) throw error;

      toast.success(
        initialData?.client_id
          ? 'Rental updated successfully'
          : 'Rental created successfully'
      );
      onSuccess();
    } catch (error) {
      toast.error('Something went wrong');
      console.error('Error:', error);
    }
  }

  return (
    <Form form={form} onSubmit={onSubmit}>
      <FormField
        name="client_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client</FormLabel>
            <FormControl>
              <Select {...field}>
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company_name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="billboard_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Billboard</FormLabel>
            <FormControl>
              <Select {...field}>
                <option value="">Select billboard</option>
                {billboards.map((billboard) => (
                  <option key={billboard.id} value={billboard.id}>
                    {billboard.location}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="rental_start_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Start Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="rental_end_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>End Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="total_rent_amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Rent Amount</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter total rent amount"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="payment_mode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Mode</FormLabel>
            <FormControl>
              <Select {...field}>
                <option value="">Select payment mode</option>
                <option value="Full">Full</option>
                <option value="Installments">Installments</option>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="pvc_cost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>PVC Cost</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter PVC cost"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="fitting_cost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fitting Cost</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter fitting cost"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter any additional notes"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="submit" className="w-full">
        {initialData?.client_id ? 'Update Rental' : 'Create Rental'}
      </Button>
    </Form>
  );
}