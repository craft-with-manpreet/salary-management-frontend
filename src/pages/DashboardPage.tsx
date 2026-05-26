import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  useDashboard,
  usePayrollSummary,
  useDistribution,
} from '@/hooks/useAnalytics';
import { Users, TrendingUp, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

function formatAxisTick(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toString();
}

function currencyTooltipFormatter(
  value: number | string | ReadonlyArray<number | string> | undefined,
): string {
  if (value == null) return '';
  if (Array.isArray(value)) return formatCurrency(Number(value[0]));
  return formatCurrency(Number(value));
}

function SummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

const CARD_CONFIGS = [
  {
    title: 'Total Employees',
    icon: Users,
    color: 'from-blue-500/10 to-blue-600/5',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    borderColor: 'border-t-blue-500',
  },
  {
    title: 'Average Salary',
    icon: TrendingUp,
    color: 'from-emerald-500/10 to-emerald-600/5',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    borderColor: 'border-t-emerald-500',
  },
  {
    title: 'Highest Salary',
    icon: ArrowUpRight,
    color: 'from-violet-500/10 to-violet-600/5',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-600',
    borderColor: 'border-t-violet-500',
  },
  {
    title: 'Lowest Salary',
    icon: ArrowDownRight,
    color: 'from-amber-500/10 to-amber-600/5',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    borderColor: 'border-t-amber-500',
  },
  {
    title: 'Total Payroll',
    icon: Wallet,
    color: 'from-rose-500/10 to-rose-600/5',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600',
    borderColor: 'border-t-rose-500',
  },
];

function SummaryCards() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState
            message="Failed to load summary metrics"
            onRetry={() => void refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  const cardValues = [
    data.total_employees.toLocaleString(),
    formatCurrencyCompact(data.average_salary),
    formatCurrencyCompact(data.highest_salary),
    formatCurrencyCompact(data.lowest_salary),
    formatCurrencyCompact(data.total_payroll),
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {CARD_CONFIGS.map((config, index) => {
        const Icon = config.icon;
        return (
          <Card
            key={config.title}
            className={`relative overflow-hidden border-t-2 ${config.borderColor} hover:-translate-y-0.5`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${config.color} pointer-events-none`} />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {config.title}
              </CardTitle>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.iconBg}`}>
                <Icon className={`h-4 w-4 ${config.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-2xl font-bold tracking-tight truncate" title={cardValues[index]}>{cardValues[index]}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CountryPayrollChart() {
  const { data, isLoading, isError, refetch } = usePayrollSummary();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Country-wise Total Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            message="Failed to load country payroll data"
            onRetry={() => void refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Country-wise Total Payroll</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.by_country} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="country" fontSize={12} />
            <YAxis fontSize={12} width={60} tickFormatter={formatAxisTick} />
            <Tooltip formatter={currencyTooltipFormatter} />
            <Legend />
            <Bar dataKey="total_payroll" fill="oklch(0.45 0.2 265)" name="Total Payroll" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function DepartmentSalaryChart() {
  const { data, isLoading, isError, refetch } = usePayrollSummary();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Department-wise Average Salary</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            message="Failed to load department salary data"
            onRetry={() => void refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Department-wise Average Salary</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.by_department} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="department" fontSize={12} />
            <YAxis fontSize={12} width={60} tickFormatter={formatAxisTick} />
            <Tooltip formatter={currencyTooltipFormatter} />
            <Legend />
            <Bar
              dataKey="total_payroll"
              fill="#0891b2"
              name="Average Salary"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function SalaryDistributionChart() {
  const { data, isLoading, isError, refetch } = useDistribution();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Salary Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            message="Failed to load salary distribution data"
            onRetry={() => void refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Salary Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="bucket" fontSize={12} />
            <YAxis fontSize={12} width={50} tickFormatter={formatAxisTick} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#059669" name="Employees" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function HiringTrendChart() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hiring Trend (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            message="Failed to load hiring trend data"
            onRetry={() => void refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Hiring Trend (Last 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.hiring_trend} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} width={50} tickFormatter={formatAxisTick} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#7c3aed"
              name="Hires"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#7c3aed' }}
              activeDot={{ r: 5, fill: '#7c3aed' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your organization's salary metrics
        </p>
      </div>

      <SummaryCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CountryPayrollChart />
        <DepartmentSalaryChart />
        <SalaryDistributionChart />
        <HiringTrendChart />
      </div>
    </div>
  );
}
