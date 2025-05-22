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
import { Button } from '../ui/button';

const partnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact_phone: z.string().min(1, 'Phone number is required'),
  contact_email: z.string().email('Invalid email address'),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

interface PartnerFormProps {
  onSuccess: () => void;
  initialData?: Partial<PartnerFormData>;
}

export function PartnerForm({ onSuccess, initialData }: PartnerFormProps) {
  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: initialData || {
      name: '',
      contact_phone: '',
      contact_email: '',
    },
  });

  async function onSubmit(data: PartnerFormData) {
    try {
      const { error } = initialData?.name
        ? await supabase
            .from('partners')
            .update(data)
            .eq('name', initialData.name)
        : await supabase.from('partners').insert(data);

      if (error) throw error;

      toast.success(
        initialData?.name
          ? 'Partner updated successfully'
          : 'Partner created successfully'
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
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter partner name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="contact_phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input placeholder="Enter phone number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="contact_email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Enter email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="submit" className="w-full">
        {initialData?.name ? 'Update Partner' : 'Create Partner'}
      </Button>
    </Form>
  );
}