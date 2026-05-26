import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEmployees, useDeleteEmployee } from '@/hooks/useEmployees';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Search,
  Globe,
  Building2,
  CircleDot,
  X,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import type { Employee, EmployeeListParams } from '@/types';

const COUNTRY_OPTIONS = [
  { value: 'USA', label: 'USA' },
  { value: 'UK', label: 'UK' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Germany', label: 'Germany' },
  { value: 'India', label: 'India' },
  { value: 'Australia', label: 'Australia' },
  { value: 'France', label: 'France' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Singapore', label: 'Singapore' },
];

const DEPARTMENT_OPTIONS = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'HR', label: 'HR' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Design', label: 'Design' },
  { value: 'Product', label: 'Product' },
  { value: 'Support', label: 'Support' },
];

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

const PAGE_SIZE = 20;

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export function EmployeeListPage() {
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const deleteEmployee = useDeleteEmployee();

  // Search state with debounce
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filter state
  const [countryFilter, setCountryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);

  // Sort state
  const [sort, setSort] = useState<SortConfig | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Computed: active filter count
  const activeFilterCount = [countryFilter, departmentFilter, statusFilter].filter(Boolean).length;

  const clearAllFilters = useCallback(() => {
    setCountryFilter('');
    setDepartmentFilter('');
    setStatusFilter('');
    setSearchInput('');
    setPage(1);
  }, []);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build query params
  const params: EmployeeListParams = {
    page,
    page_size: PAGE_SIZE,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(countryFilter && { country: countryFilter }),
    ...(departmentFilter && { department: departmentFilter }),
    ...(statusFilter && { status: statusFilter }),
    ...(sort && {
      ordering: sort.direction === 'desc' ? `-${sort.field}` : sort.field,
    }),
  };

  const { data, isLoading, isError, refetch } = useEmployees(params);

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  const handleSort = useCallback((field: string) => {
    setSort((prev) => {
      if (prev?.field === field) {
        return prev.direction === 'asc'
          ? { field, direction: 'desc' }
          : null;
      }
      return { field, direction: 'asc' };
    });
  }, []);

  const handleFilterChange = useCallback(
    (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setPage(1);
    },
    []
  );

  const handleDeleteClick = useCallback((employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (employeeToDelete) {
      await deleteEmployee.mutateAsync(employeeToDelete.id);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  }, [employeeToDelete, deleteEmployee]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  }, []);

  const getSortIcon = (field: string) => {
    if (sort?.field !== field) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 inline opacity-50" />;
    }
    return sort.direction === 'asc' ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 inline text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 inline text-primary" />
    );
  };

  const renderSortableHeader = (label: string, field: string) => (
    <button
      className="flex items-center font-medium hover:text-foreground transition-colors duration-150"
      onClick={() => handleSort(field)}
      type="button"
    >
      {label}
      {getSortIcon(field)}
    </button>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your organization's employee records
          </p>
        </div>
        {canWrite() && (
          <Button onClick={() => navigate('/employees/new')} className="shadow-[var(--shadow-md)]">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, department..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-10"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="font-medium">Filters</span>
          </div>

          <div className="h-5 w-px bg-border" />

          <Select
            options={COUNTRY_OPTIONS}
            placeholder="All Countries"
            value={countryFilter}
            onChange={handleFilterChange(setCountryFilter)}
            icon={<Globe className="h-3.5 w-3.5" />}
          />
          <Select
            options={DEPARTMENT_OPTIONS}
            placeholder="All Departments"
            value={departmentFilter}
            onChange={handleFilterChange(setDepartmentFilter)}
            icon={<Building2 className="h-3.5 w-3.5" />}
          />
          <Select
            options={STATUS_OPTIONS}
            placeholder="All Statuses"
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
            icon={<CircleDot className="h-3.5 w-3.5" />}
          />

          {/* Active filter count + clear */}
          {activeFilterCount > 0 && (
            <>
              <div className="h-5 w-px bg-border" />
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                <Filter className="h-3 w-3" />
                {activeFilterCount} active
                <X className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            Failed to load employees
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && data && data.results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            No employees found matching your criteria
          </p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !isError && data && data.results.length > 0 && (
        <>
          <div className="rounded-xl border border-border/60 bg-card shadow-[var(--shadow-sm)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>
                    {renderSortableHeader('Code', 'employee_code')}
                  </TableHead>
                  <TableHead>
                    {renderSortableHeader('Name', 'last_name')}
                  </TableHead>
                  <TableHead>
                    {renderSortableHeader('Email', 'email')}
                  </TableHead>
                  <TableHead>
                    {renderSortableHeader('Department', 'department')}
                  </TableHead>
                  <TableHead>
                    {renderSortableHeader('Job Title', 'job_title')}
                  </TableHead>
                  <TableHead>
                    {renderSortableHeader('Salary', 'salary')}
                  </TableHead>
                  <TableHead>
                    {renderSortableHeader('Country', 'country')}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  {canWrite() && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((employee) => (
                  <TableRow key={employee.id} className="transition-colors duration-150">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {employee.employee_code}
                    </TableCell>
                    <TableCell className="font-medium">
                      {employee.full_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{employee.email}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.job_title}</TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: employee.currency || 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(employee.salary)}
                    </TableCell>
                    <TableCell>{employee.country}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          employee.status === 'Active' ? 'success' : 'secondary'
                        }
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    {canWrite() && (
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() =>
                              navigate(`/employees/${employee.id}/edit`)
                            }
                            aria-label={`Edit ${employee.full_name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(employee)}
                            aria-label={`Delete ${employee.full_name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} <span className="text-muted-foreground/60">({data.count} total)</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                {employeeToDelete?.full_name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
