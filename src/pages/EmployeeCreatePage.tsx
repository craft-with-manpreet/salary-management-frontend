import { useNavigate } from 'react-router-dom';
import { EmployeeForm } from '@/components/forms/EmployeeForm';
import { useCreateEmployee } from '@/hooks/useEmployee';
import { showToast } from '@/components/ui/toast';
import type { EmployeeFormValues } from '@/lib/validations/employee';

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateEmployee();

  async function handleSubmit(data: EmployeeFormValues) {
    await createMutation.mutateAsync(data);
    showToast('Employee created successfully');
    navigate('/employees');
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Create Employee</h1>
      <EmployeeForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitLabel="Create Employee"
      />
    </div>
  );
}
