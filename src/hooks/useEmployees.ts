import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, deleteEmployee } from '@/api/employees';
import type { EmployeeListParams } from '@/types';

export function useEmployees(params?: EmployeeListParams) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => getEmployees(params),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
