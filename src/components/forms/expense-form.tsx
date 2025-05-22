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

const expenseSchema = z.object({
  billboard_id: z.string().min(1, 'Billboard is required'),
  expense_type: z.string().min(1, 'Expense type is required'),
  description: z.string().optional(),
  expense_date: z.string().min(1, 'Date is required'),
  amount: z.string().transform((val) => parseFloat(val)),
  paid_by: z.string().min(1, 'Paid by is required'),
  partner_deducted: z.boolean(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSuccess: () => void;
  initialData?: Partial<ExpenseFormData>;
}

export function ExpenseForm({ onSuccess, initialData }: ExpenseFormProps) {
  const [billboards, setBillboards] = useState([]);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData || {
      billboard_id: '',
      expense_type: '',
      description: '',
      expense_date: '',
      amount: '',
      paid_by: '',
      partner_deducted: false,
    },
  });

  useEffect(() => {
    async function fetchBillboards() {
      const { data } = await supabase
        .from('billboards')
        .select('id, location');
      if (data) setBillboards(data);
    }

    fetchBillboards();
  }, []);

  async function onSubmit(data: ExpenseFormData) {
    try {
      const { error } = initialData?.billboard_id
        ? await supabase
            .from('expenses')
            .update(data)
            .eq('billboard_id', initialData.billboard_id)
        : await supabase.from('expenses').insert(data);

      if (error) throw error;

      toast.success(
        initialData?.billboard_id
          ? 'Expense updated successfully'
          : 'Expense created successfully'
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
        name="expense_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Expense Type</FormLabel>
            <FormControl>
              <Select {...field}>
                <option value="">Select type</option>
                <option value="PVC Replacement">PVC Replacement</option>
                <option value="Repair">Repair</option>
                <option value="Tax">Tax</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter expense description"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="expense_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
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
        name="paid_by"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Paid By</FormLabel>
            <FormControl>
              <Select {...field}>
                <option value="">Select who paid</option>
                <option value="Self">Self</option>
                <option value="Partner">Partner</option>
                <option value="Shared">Shared</option>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="partner_deducted"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Partner Deducted</FormLabel>
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

      <Button type="submit" className="w-full">
        {initialData?.billboard_id ? 'Update Expense' : 'Create Expense'}
      </Button>
    </Form>
  );
}