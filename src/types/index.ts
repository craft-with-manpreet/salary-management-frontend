// User and Auth types
export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export type UserRole = 'Admin' | 'HR_Manager' | 'Viewer';

export interface LoginResponse {
  access: string;
  refresh: string;
  role: UserRole;
}

export interface TokenRefreshResponse {
  access: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: UserRole;
}

// Employee types
export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  country: string;
  city: string;
  department: string;
  job_title: string;
  salary: number;
  currency: string;
  joining_date: string;
  employment_type: EmploymentType;
  manager_name: string;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
}

export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
export type EmployeeStatus = 'Active' | 'Inactive';

export interface EmployeeCreatePayload {
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  country: string;
  city: string;
  department: string;
  job_title: string;
  salary: number;
  currency: string;
  joining_date: string;
  employment_type: EmploymentType;
  manager_name: string;
  status: EmployeeStatus;
}

export type EmployeeUpdatePayload = Partial<EmployeeCreatePayload>;

export interface EmployeeListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  country?: string;
  department?: string;
  job_title?: string;
  employment_type?: string;
  status?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Analytics types
export interface HiringTrend {
  month: string;
  count: number;
}

export interface DashboardMetrics {
  total_employees: number;
  average_salary: number;
  highest_salary: number;
  lowest_salary: number;
  total_payroll: number;
  active_count: number;
  inactive_count: number;
  hiring_trend: HiringTrend[];
}

export interface CountrySalary {
  country: string;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
  median_salary: number;
  employee_count: number;
  total_payroll: number;
}

export interface JobTitleSalary {
  job_title: string;
  avg_salary: number;
  employee_count: number;
}

export interface JobTitleSalaryParams {
  country: string;
  job_title?: string;
}

export interface PayrollSummary {
  by_country: { country: string; total_payroll: number }[];
  by_department: { department: string; total_payroll: number }[];
}

export interface SalaryDistribution {
  bucket: string;
  count: number;
}
