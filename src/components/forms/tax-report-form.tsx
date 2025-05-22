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

const taxReportSchema = z.object({
  year: z.string().transform((val) => parseInt(val)),
  client_id: z.string().min(1, 'Client is required'),
  total_rent_collected: z.string().transform((val) => parseFloat(val)),
  total_ait_deducted: z.string().transform((val) => parseFloat(val)),
  total_vat_deducted: z.string().transform((val) => parseFloat(val)),
  ait_receipts_submitted: z.boolean(),
  notes: z.string().optional(),
});

type TaxReportFormData = z.infer<typeof taxReportSchema>;

interface TaxReportFormProps {
  onSuccess: () => void;
  initialData?: Partial<TaxReportFormData>;
}

export function TaxReportForm({ onSuccess, initialData }: TaxReportFormProps) {
  const [clients, setClients] = useState([]);

  const form = useForm<TaxReportFormData>({
    resolver: zodResolver(taxReportSchema),
    defaultValues: initialData || {
      year: new Date().getFullYear().toString(),
      client_id: '',
      total_rent_collected: '',
      total_ait_deducted: '',
      total_vat_deducted: '',
      ait_receipts_submitted: false,
      notes: '',
    },
  });

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase
        .from('clients')
        .select('id, company_name');
      if (data) setClients(data);
    }

    fetchClients();
  }, []);

  async function onSubmit(data: TaxReportFormData) {
    try {
      const { error } = initialData?.year
        ? await supabase
            .from('yearly_tax_reports')
            .update(data)
            .eq('year', initialData.year)
            .eq('client_id', data.client_id)
        : await supabase.from('yearly_tax_reports').insert(data);

      if (error) throw error;

      toast.success(
        initialData?.year
          ? 'Tax report updated successfully'
          : 'Tax report created successfully'
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
        name="year"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Year</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={2000}
                max={2100}
                {...field}
              />
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
        name="total_rent_collected"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Rent Collected</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter total rent collected"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="total_ait_deducted"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total AIT Deducted</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter total AIT deducted"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="total_vat_deducted"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total VAT Deducted</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter total VAT deducted"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="ait_receipts_submitted"
        render={({ field }) => (
          <FormItem>
            <FormLabel>AIT Receipts Submitted</FormLabel>
            <FormControl>
              <Select
                value={field.value ? 'true' : 'false'}
                onChange={(e) =>
                  field.onChange(e.target.value === 'true')
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
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
        {initialData?.year ? 'Update Tax Report' : 'Create Tax Report'}
      </Button>
    </Form>
  );
}