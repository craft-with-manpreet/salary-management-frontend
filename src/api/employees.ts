import apiClient from './client';
import type {
  Employee,
  EmployeeCreatePayload,
  EmployeeListParams,
  EmployeeUpdatePayload,
  PaginatedResponse,
} from '@/types';

export async function getEmployees(
  params?: EmployeeListParams
): Promise<PaginatedResponse<Employee>> {
  const response = await apiClient.get<PaginatedResponse<Employee>>(
    '/api/employees/',
    { params }
  );
  return response.data;
}

export async function getEmployee(id: number): Promise<Employee> {
  const response = await apiClient.get<Employee>(`/api/employees/${id}/`);
  return response.data;
}

export async function createEmployee(
  data: EmployeeCreatePayload
): Promise<Employee> {
  const response = await apiClient.post<Employee>('/api/employees/', data);
  return response.data;
}

export async function updateEmployee(
  id: number,
  data: EmployeeUpdatePayload
): Promise<Employee> {
  const response = await apiClient.patch<Employee>(
    `/api/employees/${id}/`,
    data
  );
  return response.data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await apiClient.delete(`/api/employees/${id}/`);
}
