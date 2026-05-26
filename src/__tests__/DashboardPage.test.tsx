import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '@/pages/DashboardPage';

// Mock the analytics hooks
const mockUseDashboard = vi.fn();
const mockUsePayrollSummary = vi.fn();
const mockUseDistribution = vi.fn();

vi.mock('@/hooks/useAnalytics', () => ({
  useDashboard: () => mockUseDashboard(),
  usePayrollSummary: () => mockUsePayrollSummary(),
  useDistribution: () => mockUseDistribution(),
}));

// Mock recharts to avoid rendering issues in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
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

const mockDashboardData = {
  total_employees: 500,
  average_salary: 75000.5,
  highest_salary: 200000,
  lowest_salary: 20000,
  total_payroll: 37500250,
  active_count: 450,
  inactive_count: 50,
  hiring_trend: [
    { month: '2024-01', count: 10 },
    { month: '2024-02', count: 15 },
  ],
};

const mockPayrollData = {
  by_country: [{ country: 'USA', total_payroll: 15000000 }],
  by_department: [{ department: 'Engineering', total_payroll: 10000000 }],
};

const mockDistributionData = [
  { bucket: '0-30k', count: 50 },
  { bucket: '30k-50k', count: 100 },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render summary cards with mocked data', async () => {
    mockUseDashboard.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUsePayrollSummary.mockReturnValue({
      data: mockPayrollData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseDistribution.mockReturnValue({
      data: mockDistributionData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Total Employees')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('Average Salary')).toBeInTheDocument();
      expect(screen.getByText('$75.0K')).toBeInTheDocument();
      expect(screen.getByText('Highest Salary')).toBeInTheDocument();
      expect(screen.getByText('$200.0K')).toBeInTheDocument();
      expect(screen.getByText('Lowest Salary')).toBeInTheDocument();
      expect(screen.getByText('$20.0K')).toBeInTheDocument();
      expect(screen.getByText('Total Payroll')).toBeInTheDocument();
      expect(screen.getByText('$37.50M')).toBeInTheDocument();
    });
  });

  it('should show loading skeletons while fetching', () => {
    mockUseDashboard.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });
    mockUsePayrollSummary.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseDistribution.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    const { container } = render(<DashboardPage />, { wrapper: createWrapper() });

    // Skeleton elements should be present (they use the Skeleton component with specific classes)
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show error state on API failure', async () => {
    mockUseDashboard.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });
    mockUsePayrollSummary.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });
    mockUseDistribution.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    render(<DashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/failed to load summary metrics/i)).toBeInTheDocument();
    });

    // Should have retry buttons
    const retryButtons = screen.getAllByRole('button', { name: /retry/i });
    expect(retryButtons.length).toBeGreaterThan(0);
  });
});
