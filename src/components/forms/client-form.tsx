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

const clientSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  contact_person: z.string().min(1, 'Contact person is required'),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().min(1, 'Phone number is required'),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  onSuccess: () => void;
  initialData?: Partial<ClientFormData>;
}

export function ClientForm({ onSuccess, initialData }: ClientFormProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      company_name: '',
      industry: '',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
    },
  });

  async function onSubmit(data: ClientFormData) {
    try {
      const { error } = initialData?.company_name
        ? await supabase
            .from('clients')
            .update(data)
            .eq('company_name', initialData.company_name)
            .select()
        : await supabase
            .from('clients')
            .insert([data])
            .select();

      if (error) throw error;

      toast.success(
        initialData?.company_name
          ? 'Client updated successfully'
          : 'Client created successfully'
      );
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    }
  }

  return (
    <Form form={form} onSubmit={onSubmit}>
      <FormField
        name="company_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter company name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Industry</FormLabel>
            <FormControl>
              <Select {...field}>
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="contact_person"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Person</FormLabel>
            <FormControl>
              <Input placeholder="Enter contact person name" {...field} />
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

      <Button type="submit" className="w-full">
        {initialData?.company_name ? 'Update Client' : 'Create Client'}
      </Button>
    </Form>
  );
}