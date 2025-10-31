"use client"

import * as React from "react"
import { FieldError } from "react-hook-form"
import { DatePickerDOB } from "@/components/ui/date-picker-dob"
import { Label } from "@/components/ui/label"

interface DatePickerFieldProps {
  label: string
  id: string
  value: string | undefined // Form value as YYYY-MM-DD string
  onChange: (value: string) => void // Callback with YYYY-MM-DD string
  error?: FieldError
  disabled?: boolean
  placeholder?: string
  className?: string
}

// Convert YYYY-MM-DD string to Date object
function stringToDate(value: string | undefined): Date | undefined {
  if (!value) return undefined
  const date = new Date(value + "T00:00:00") // Add time to avoid timezone issues
  return isNaN(date.getTime()) ? undefined : date
}

// Convert Date object to YYYY-MM-DD string
function dateToString(date: Date | undefined): string {
  if (!date) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function DatePickerField({
  label,
  id,
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "Select date",
  className,
}: DatePickerFieldProps) {
  const [dateValue, setDateValue] = React.useState<Date | undefined>(
    stringToDate(value)
  )

  React.useEffect(() => {
    setDateValue(stringToDate(value))
  }, [value])

  const handleChange = (date: Date | undefined) => {
    setDateValue(date)
    const stringValue = dateToString(date)
    onChange(stringValue)
  }

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <DatePickerDOB
        id={id}
        value={dateValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  )
}

