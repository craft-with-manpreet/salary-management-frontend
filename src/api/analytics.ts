import apiClient from './client';
import type {
  CountrySalary,
  DashboardMetrics,
  Employee,
  JobTitleSalary,
  JobTitleSalaryParams,
  PayrollSummary,
  SalaryDistribution,
} from '@/types';

export async function getDashboard(): Promise<DashboardMetrics> {
  const response = await apiClient.get<DashboardMetrics>(
    '/api/analytics/dashboard/'
  );
  return response.data;
}

export async function getSalaryByCountry(): Promise<CountrySalary[]> {
  const response = await apiClient.get<CountrySalary[]>(
    '/api/analytics/salary-by-country/'
  );
  return response.data;
}

export async function getJobTitleSalary(
  params: JobTitleSalaryParams
): Promise<JobTitleSalary[]> {
  const response = await apiClient.get<JobTitleSalary[]>(
    '/api/analytics/job-title-salary/',
    { params }
  );
  return response.data;
}

export async function getTopPaid(): Promise<Employee[]> {
  const response = await apiClient.get<Employee[]>(
    '/api/analytics/top-paid/'
  );
  return response.data;
}

export async function getPayrollSummary(): Promise<PayrollSummary> {
  const response = await apiClient.get<PayrollSummary>(
    '/api/analytics/payroll-summary/'
  );
  return response.data;
}

export async function getDistribution(): Promise<SalaryDistribution[]> {
  const response = await apiClient.get<SalaryDistribution[]>(
    '/api/analytics/distribution/'
  );
  return response.data;
}
