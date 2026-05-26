import { z } from 'zod';

export const employeeFormSchema = z.object({
  employee_code: z.string().min(1, 'Employee code is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  phone_number: z.string().min(1, 'Phone number is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  department: z.string().min(1, 'Department is required'),
  job_title: z.string().min(1, 'Job title is required'),
  salary: z
    .number({ message: 'Salary must be a number' })
    .min(0, 'Salary must be 0 or greater'),
  currency: z.string().min(1, 'Currency is required'),
  joining_date: z.string().min(1, 'Joining date is required').refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid date format' }
  ),
  employment_type: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Intern'], {
    message: 'Employment type is required',
  }),
  manager_name: z.string().min(1, 'Manager name is required'),
  status: z.enum(['Active', 'Inactive'], {
    message: 'Status is required',
  }),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
