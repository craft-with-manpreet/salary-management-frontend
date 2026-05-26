import { useQuery } from '@tanstack/react-query';
import {
  getDashboard,
  getSalaryByCountry,
  getPayrollSummary,
  getDistribution,
} from '@/api/analytics';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });
}

export function useSalaryByCountry() {
  return useQuery({
    queryKey: ['salaryByCountry'],
    queryFn: getSalaryByCountry,
  });
}

export function usePayrollSummary() {
  return useQuery({
    queryKey: ['payrollSummary'],
    queryFn: getPayrollSummary,
  });
}

export function useDistribution() {
  return useQuery({
    queryKey: ['distribution'],
    queryFn: getDistribution,
  });
}
