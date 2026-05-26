import { useNavigate, useParams } from 'react-router-dom';
import { EmployeeForm } from '@/components/forms/EmployeeForm';
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployee';
import { showToast } from '@/components/ui/toast';
import type { EmployeeFormValues } from '@/lib/validations/employee';

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employeeId = id ? Number(id) : undefined;
  const { data: employee, isLoading, isError } = useEmployee(employeeId);
  const updateMutation = useUpdateEmployee();

  async function handleSubmit(data: EmployeeFormValues) {
    if (!employeeId) return;
    await updateMutation.mutateAsync({ id: employeeId, data });
    showToast('Employee updated successfully');
    navigate('/employees');
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load employee data.</p>
      </div>
    );
  }

  const defaultValues: EmployeeFormValues = {
    employee_code: employee.employee_code,
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    phone_number: employee.phone_number,
    country: employee.country,
    city: employee.city,
    department: employee.department,
    job_title: employee.job_title,
    salary: employee.salary,
    currency: employee.currency,
    joining_date: employee.joining_date,
    employment_type: employee.employment_type,
    manager_name: employee.manager_name,
    status: employee.status,
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Edit Employee</h1>
      <EmployeeForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitLabel="Update Employee"
      />
    </div>
  );
}
