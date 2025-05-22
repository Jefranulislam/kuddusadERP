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

const paymentSchema = z.object({
  rental_id: z.string().min(1, 'Rental is required'),
  client_id: z.string().min(1, 'Client is required'),
  amount_paid: z.string().transform((val) => parseFloat(val)),
  payment_date: z.string().min(1, 'Payment date is required'),
  payment_mode: z.string().min(1, 'Payment mode is required'),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSuccess: () => void;
  initialData?: Partial<PaymentFormData>;
}

export function PaymentForm({ onSuccess, initialData }: PaymentFormProps) {
  const [rentals, setRentals] = useState([]);
  const [clients, setClients] = useState([]);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData || {
      rental_id: '',
      client_id: '',
      amount_paid: '',
      payment_date: '',
      payment_mode: '',
      notes: '',
    },
  });

  useEffect(() => {
    async function fetchData() {
      const [rentalsResponse, clientsResponse] = await Promise.all([
        supabase
          .from('rentals')
          .select(`
            id,
            billboard:billboards(location),
            client:clients(company_name)
          `),
        supabase.from('clients').select('id, company_name'),
      ]);

      if (rentalsResponse.data) setRentals(rentalsResponse.data);
      if (clientsResponse.data) setClients(clientsResponse.data);
    }

    fetchData();
  }, []);

  async function onSubmit(data: PaymentFormData) {
    try {
      const { error } = initialData?.rental_id
        ? await supabase
            .from('payments')
            .update(data)
            .eq('rental_id', initialData.rental_id)
        : await supabase.from('payments').insert(data);

      if (error) throw error;

      toast.success(
        initialData?.rental_id
          ? 'Payment updated successfully'
          : 'Payment created successfully'
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
        name="rental_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rental</FormLabel>
            <FormControl>
              <Select {...field}>
                <option value="">Select rental</option>
                {rentals.map((rental) => (
                  <option key={rental.id} value={rental.id}>
                    {rental.client.company_name} - {rental.billboard.location}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
        name="amount_paid"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount Paid</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter amount"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="payment_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
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
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
                <option value="Online">Online</option>
              </Select>
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
        {initialData?.rental_id ? 'Update Payment' : 'Create Payment'}
      </Button>
    </Form>
  );
}