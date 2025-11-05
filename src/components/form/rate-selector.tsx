"use client"

import * as React from "react"
import { FieldError } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Lock } from "lucide-react"
import { useRates } from "@/hooks/use-rates"
import { Rate, RateType } from "@/lib/api/rates-service"

interface RateSelectorProps {
  label: string
  id: string
  value: string | undefined // Rate ID
  onValueChange: (value: string) => void // Callback with rate ID
  onRateChange?: (rate: Rate | undefined) => void // Optional callback with full rate object (for rateAmountExclGst)
  error?: FieldError
  disabled?: boolean
  required?: boolean
  className?: string
}

// Format amount for display
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function RateSelector({
  label,
  id,
  value,
  onValueChange,
  onRateChange,
  error,
  disabled = false,
  required = false,
  className,
}: RateSelectorProps) {
  // Fetch rates, excluding archived ones
  const { data: rates, loading, error: fetchError } = useRates({
    defaultFilters: { isArchived: false },
    pageSize: 100,
  })

  const handleValueChange = (newValue: string) => {
    onValueChange(newValue)
    if (onRateChange) {
      const selectedRate = rates.find(r => r.id === newValue)
      onRateChange(selectedRate)
    }
  }

  // Find the selected rate for display
  const selectedRate = value ? rates.find(r => r.id === value) : undefined

  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value || ""}
        onValueChange={handleValueChange}
        disabled={disabled || loading}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={loading ? "Loading rates..." : "Select rate"} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading rates...</span>
            </div>
          ) : fetchError ? (
            <div className="p-4 text-sm text-red-600">
              Failed to load rates: {fetchError}
            </div>
          ) : rates.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No rates available</div>
          ) : (
            rates.map((rate) => (
              <SelectItem key={rate.id} value={rate.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {rate.rateType === RateType.Fixed && (
                      <Lock className="h-3 w-3 text-gray-400" />
                    )}
                    <span>{rate.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    {formatAmount(rate.amountExclGst)} {rate.rateType === RateType.Hourly ? '/hr' : ''}
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  )
}
