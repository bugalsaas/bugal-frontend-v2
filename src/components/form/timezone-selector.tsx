"use client"

import * as React from "react"
import { FieldError } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TimezoneSelectorProps {
  label: string
  id: string
  value: string | undefined // Timezone string (e.g., "Australia/Sydney")
  onValueChange: (value: string) => void // Callback with timezone string
  error?: FieldError
  disabled?: boolean
  required?: boolean
  className?: string
}

// Timezone options matching the old frontend
const TIMEZONE_OPTIONS = [
  { value: 'Australia/Perth', label: 'Perth' },
  { value: 'Australia/Adelaide', label: 'Adelaide' },
  { value: 'Australia/Darwin', label: 'Darwin' },
  { value: 'Australia/Brisbane', label: 'Brisbane' },
  { value: 'Australia/Sydney', label: 'Canberra, Melbourne, Sydney' },
  { value: 'Australia/Hobart', label: 'Hobart' },
]

export function TimezoneSelector({
  label,
  id,
  value,
  onValueChange,
  error,
  disabled = false,
  required = false,
  className,
}: TimezoneSelectorProps) {
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value || ""}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent>
          {TIMEZONE_OPTIONS.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  )
}
