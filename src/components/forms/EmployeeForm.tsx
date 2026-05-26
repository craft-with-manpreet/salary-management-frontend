import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
  employeeFormSchema,
  type EmployeeFormValues,
} from '@/lib/validations/employee';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormValues>;
  onSubmit: (data: EmployeeFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
}

export function EmployeeForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: EmployeeFormProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: defaultValues ?? {
      employee_code: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      country: '',
      city: '',
      department: '',
      job_title: '',
      salary: 0,
      currency: 'USD',
      joining_date: '',
      employment_type: 'Full-Time',
      manager_name: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  async function handleFormSubmit(data: EmployeeFormValues) {
    try {
      await onSubmit(data);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 400) {
        const fieldErrors = err.response.data as Record<string, string[]>;
        for (const [field, messages] of Object.entries(fieldErrors)) {
          if (field in employeeFormSchema.shape) {
            setError(field as keyof EmployeeFormValues, {
              type: 'server',
              message: Array.isArray(messages) ? messages[0] : messages,
            });
          }
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          label="Employee Code"
          error={errors.employee_code?.message}
        >
          <Input {...register('employee_code')} placeholder="EMP001" />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <Input
            {...register('email')}
            type="email"
            placeholder="john@example.com"
          />
        </FormField>

        <FormField label="First Name" error={errors.first_name?.message}>
          <Input {...register('first_name')} placeholder="John" />
        </FormField>

        <FormField label="Last Name" error={errors.last_name?.message}>
          <Input {...register('last_name')} placeholder="Doe" />
        </FormField>

        <FormField label="Phone Number" error={errors.phone_number?.message}>
          <Input {...register('phone_number')} placeholder="+1234567890" />
        </FormField>

        <FormField label="Country" error={errors.country?.message}>
          <Input {...register('country')} placeholder="United States" />
        </FormField>

        <FormField label="City" error={errors.city?.message}>
          <Input {...register('city')} placeholder="New York" />
        </FormField>

        <FormField label="Department" error={errors.department?.message}>
          <Input {...register('department')} placeholder="Engineering" />
        </FormField>

        <FormField label="Job Title" error={errors.job_title?.message}>
          <Input {...register('job_title')} placeholder="Software Engineer" />
        </FormField>

        <FormField label="Salary" error={errors.salary?.message}>
          <Input
            {...register('salary', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            placeholder="50000"
          />
        </FormField>

        <FormField label="Currency" error={errors.currency?.message}>
          <Input {...register('currency')} placeholder="USD" />
        </FormField>

        <FormField label="Joining Date" error={errors.joining_date?.message}>
          <Input {...register('joining_date')} type="date" />
        </FormField>

        <FormField
          label="Employment Type"
          error={errors.employment_type?.message}
        >
          <Select {...register('employment_type')}>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
            <option value="Intern">Intern</option>
          </Select>
        </FormField>

        <FormField label="Status" error={errors.status?.message}>
          <Select {...register('status')}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </FormField>

        <FormField label="Manager Name" error={errors.manager_name?.message}>
          <Input {...register('manager_name')} placeholder="Jane Smith" />
        </FormField>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && (
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/employees')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
