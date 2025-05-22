import React from 'react';
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

const billboardSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  size: z.string().min(1, 'Size is required'),
  type: z.string().min(1, 'Type is required'),
  structure_installation_cost: z.string().transform((val) => parseFloat(val)),
  installation_date: z.string().min(1, 'Installation date is required'),
  current_status: z.string().min(1, 'Status is required'),
});

type BillboardFormData = z.infer<typeof billboardSchema>;

interface BillboardFormProps {
  onSuccess: () => void;
  initialData?: Partial<BillboardFormData>;
}

export function BillboardForm({ onSuccess, initialData }: BillboardFormProps) {
  const form = useForm<BillboardFormData>({
    resolver: zodResolver(billboardSchema),
    defaultValues: initialData || {
      location: '',
      size: '',
      type: '',
      structure_installation_cost: '',
      installation_date: '',
      current_status: 'Available',
    },
  });

  async function onSubmit(data: BillboardFormData) {
    try {
      const { error } = initialData?.location
        ? await supabase
            .from('billboards')
            .update(data)
            .eq('location', initialData.location)
        : await supabase.from('billboards').insert(data);

      if (error) throw error;

      toast.success(
        initialData?.location
          ? 'Billboard updated successfully'
          : 'Billboard created successfully'
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
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="Enter location" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Size</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 20x10 ft" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type</FormLabel>
            <FormControl>
              <Select {...field}>
                <option value="">Select type</option>
                <option value="Unipole">Unipole</option>
                <option value="Gantry">Gantry</option>
                <option value="Billboard">Billboard</option>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="structure_installation_cost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Installation Cost</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Enter cost"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="installation_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Installation Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="current_status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <FormControl>
              <Select {...field}>
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
                <option value="Maintenance">Maintenance</option>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="submit" className="w-full">
        {initialData?.location ? 'Update Billboard' : 'Create Billboard'}
      </Button>
    </Form>
  );
}