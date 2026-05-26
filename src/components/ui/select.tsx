import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[]
  placeholder?: string
  icon?: React.ReactNode
  label?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, icon, label, children, value, ...props }, ref) => {
    const hasValue = value !== undefined && value !== '';

    return (
      <div className="relative inline-flex flex-col gap-1">
        {label && (
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </span>
          )}
          <select
            ref={ref}
            value={value}
            className={cn(
              "flex h-9 w-full min-w-[140px] appearance-none rounded-lg border border-input bg-background pr-9 text-sm shadow-[var(--shadow-sm)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50",
              icon ? "pl-9" : "pl-3",
              hasValue && "border-primary/40 bg-primary/[0.03]",
              className
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options
              ? options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
export type { SelectProps }
