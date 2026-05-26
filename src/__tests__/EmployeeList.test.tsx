import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmployeeListPage } from '@/pages/EmployeeListPage';

// Mock the useEmployees hook
const mockUseEmployees = vi.fn();
const mockUseDeleteEmployee = vi.fn();

vi.mock('@/hooks/useEmployees', () => ({
  useEmployees: (params: unknown) => mockUseEmployees(params),
  useDeleteEmployee: () => mockUseDeleteEmployee(),
}));

// Mock the auth context
const mockCanWrite = vi.fn(() => true);
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'admin@test.com', role: 'Admin' },
    isAuthenticated: true,
    isLoading: false,
    canWrite: mockCanWrite,
    hasRole: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  };
}

const mockEmployees = [
  {
    id: 1,
    employee_code: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
    email: 'john@example.com',
    phone_number: '+1234567890',
    country: 'USA',
    city: 'New York',
    department: 'Engineering',
    job_title: 'Software Engineer',
    salary: 95000,
    currency: 'USD',
    joining_date: '2023-01-15',
    employment_type: 'Full-Time',
    manager_name: 'Jane Smith',
    status: 'Active',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2023-01-15T00:00:00Z',
  },
  {
    id: 2,
    employee_code: 'EMP002',
    first_name: 'Alice',
    last_name: 'Johnson',
    full_name: 'Alice Johnson',
    email: 'alice@example.com',
    phone_number: '+1987654321',
    country: 'UK',
    city: 'London',
    department: 'Marketing',
    job_title: 'Marketing Manager',
    salary: 85000,
    currency: 'GBP',
    joining_date: '2023-03-20',
    employment_type: 'Full-Time',
    manager_name: 'Bob Wilson',
    status: 'Active',
    created_at: '2023-03-20T00:00:00Z',
    updated_at: '2023-03-20T00:00:00Z',
  },
];

describe('EmployeeListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeleteEmployee.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  it('should render table with employee data', async () => {
    mockUseEmployees.mockReturnValue({
      data: { count: 2, next: null, previous: null, results: mockEmployees },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<EmployeeListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('EMP001')).toBeInTheDocument();
      expect(screen.getByText('EMP002')).toBeInTheDocument();
    });
  });

  it('should show loading skeleton', () => {
    mockUseEmployees.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    const { container } = render(<EmployeeListPage />, { wrapper: createWrapper() });

    // Skeleton elements should be present
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show empty state when no results', async () => {
    mockUseEmployees.mockReturnValue({
      data: { count: 0, next: null, previous: null, results: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<EmployeeListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(
        screen.getByText(/no employees found matching your criteria/i)
      ).toBeInTheDocument();
    });
  });

  it('should show error state with retry button', async () => {
    const mockRefetch = vi.fn();
    mockUseEmployees.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<EmployeeListPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/failed to load employees/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });
});
