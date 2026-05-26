import { describe, it, expect } from 'vitest';
import { employeeFormSchema } from '@/lib/validations/employee';

const validEmployee = {
  employee_code: 'EMP001',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone_number: '+1234567890',
  country: 'USA',
  city: 'New York',
  department: 'Engineering',
  job_title: 'Software Engineer',
  salary: 75000,
  currency: 'USD',
  joining_date: '2024-01-15',
  employment_type: 'Full-Time' as const,
  manager_name: 'Jane Smith',
  status: 'Active' as const,
};

describe('Employee Form Validation (Zod Schema)', () => {
  it('should pass validation with valid employee data', () => {
    const result = employeeFormSchema.safeParse(validEmployee);
    expect(result.success).toBe(true);
  });

  it('should fail validation for negative salary', () => {
    const result = employeeFormSchema.safeParse({
      ...validEmployee,
      salary: -5000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const salaryErrors = result.error.issues.filter(
        (issue) => issue.path[0] === 'salary'
      );
      expect(salaryErrors.length).toBeGreaterThan(0);
    }
  });

  it('should fail validation for invalid email format', () => {
    const result = employeeFormSchema.safeParse({
      ...validEmployee,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailErrors = result.error.issues.filter(
        (issue) => issue.path[0] === 'email'
      );
      expect(emailErrors.length).toBeGreaterThan(0);
    }
  });

  it('should fail validation for missing required fields', () => {
    const result = employeeFormSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should have errors for multiple required fields
      expect(result.error.issues.length).toBeGreaterThan(0);
      const paths = result.error.issues.map((issue) => issue.path[0]);
      expect(paths).toContain('first_name');
      expect(paths).toContain('last_name');
      expect(paths).toContain('email');
    }
  });

  it('should pass validation for all valid employment types', () => {
    const validTypes = ['Full-Time', 'Part-Time', 'Contract', 'Intern'] as const;
    for (const type of validTypes) {
      const result = employeeFormSchema.safeParse({
        ...validEmployee,
        employment_type: type,
      });
      expect(result.success).toBe(true);
    }
  });

  it('should fail validation for invalid employment type', () => {
    const result = employeeFormSchema.safeParse({
      ...validEmployee,
      employment_type: 'Freelance',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const typeErrors = result.error.issues.filter(
        (issue) => issue.path[0] === 'employment_type'
      );
      expect(typeErrors.length).toBeGreaterThan(0);
    }
  });
});
