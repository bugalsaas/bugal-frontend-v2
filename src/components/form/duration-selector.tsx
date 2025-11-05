"use client"

import * as React from "react"
import { FieldError } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface DurationSelectorProps {
  label: string
  id: string
  value: number | undefined // Duration in seconds
  onValueChange: (value: number) => void // Callback with duration in seconds
  error?: FieldError
  disabled?: boolean
  required?: boolean
  className?: string
}

// Generate duration label (e.g., "1h 30m" or "45m")
function getDurationLabel(durationSeconds: number): string {
  const hours = Math.floor(durationSeconds / 3600)
  const minutes = Math.floor((durationSeconds % 3600) / 60)
  
  if (hours === 0) {
    return `${minutes}m`
  }
  
  if (minutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${minutes}m`
}

// Generate duration options: 15 min increments, from 15 minutes to 24 hours
function getDurationOptions(): Array<{ value: number; label: string }> {
  const options: Array<{ value: number; label: string }> = []
  const step = 15 * 60 // 15 minutes in seconds
  const start = 15 * 60 // 15 minutes in seconds
  const max = 24 * 60 * 60 // 24 hours in seconds
  
  for (let i = start; i <= max; i += step) {
    options.push({
      value: i,
      label: getDurationLabel(i),
    })
  }
  
  return options
}

const DURATION_OPTIONS = getDurationOptions()

export function DurationSelector({
  label,
  id,
  value,
  onValueChange,
  error,
  disabled = false,
  required = false,
  className,
}: DurationSelectorProps) {
  const handleValueChange = (stringValue: string) => {
    const numValue = parseInt(stringValue, 10)
    if (!isNaN(numValue)) {
      onValueChange(numValue)
    }
  }

  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value?.toString() || ""}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select duration" />
        </SelectTrigger>
        <SelectContent>
          {DURATION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
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
