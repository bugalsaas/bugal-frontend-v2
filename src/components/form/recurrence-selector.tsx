"use client"

import * as React from "react"
import { FieldError } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface RecurrenceSelectorProps {
  label: string
  id: string
  value: string | undefined // Recurrence rule (RRULE format or empty string)
  onValueChange: (value: string) => void // Callback with recurrence rule
  startDate?: string // ISO DateTime string for generating dynamic labels
  error?: FieldError
  disabled?: boolean
  required?: boolean
  className?: string
}

// Generate recurrence options based on start date
function getRecurrenceOptions(startDate?: string): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [
    { value: 'none', label: 'Does not repeat' },
    { value: 'RRULE:FREQ=DAILY', label: 'Daily' },
  ]

  if (startDate) {
    try {
      const date = new Date(startDate)
      if (!isNaN(date.getTime())) {
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
        const dayOfWeekShort = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
        const monthName = date.toLocaleDateString('en-US', { month: 'long' })
        const dayOfMonth = date.getDate()

        options.push(
          { value: 'RRULE:FREQ=WEEKLY', label: `Weekly on ${dayOfWeek}` },
          { value: `RRULE:FREQ=WEEKLY;WKST=SU;INTERVAL=2;BYDAY=${dayOfWeekShort}`, label: 'Fortnightly' },
          { value: 'RRULE:FREQ=MONTHLY', label: 'Monthly' },
          { value: 'RRULE:FREQ=YEARLY', label: `Yearly on ${monthName} ${dayOfMonth}` },
          { value: 'RRULE:FREQ=WEEKLY;WKST=SU;BYDAY=MO,TU,WE,TH,FR', label: 'Every weekday (Monday to Friday)' }
        )
      } else {
        // Fallback if date is invalid
        options.push(
          { value: 'RRULE:FREQ=WEEKLY', label: 'Weekly' },
          { value: 'RRULE:FREQ=WEEKLY;WKST=SU;INTERVAL=2;BYDAY=MO', label: 'Fortnightly' },
          { value: 'RRULE:FREQ=MONTHLY', label: 'Monthly' },
          { value: 'RRULE:FREQ=YEARLY', label: 'Yearly' },
          { value: 'RRULE:FREQ=WEEKLY;WKST=SU;BYDAY=MO,TU,WE,TH,FR', label: 'Every weekday (Monday to Friday)' }
        )
      }
    } catch (e) {
      // Fallback if date parsing fails
      options.push(
        { value: 'RRULE:FREQ=WEEKLY', label: 'Weekly' },
        { value: 'RRULE:FREQ=WEEKLY;WKST=SU;INTERVAL=2;BYDAY=MO', label: 'Fortnightly' },
        { value: 'RRULE:FREQ=MONTHLY', label: 'Monthly' },
        { value: 'RRULE:FREQ=YEARLY', label: 'Yearly' },
        { value: 'RRULE:FREQ=WEEKLY;WKST=SU;BYDAY=MO,TU,WE,TH,FR', label: 'Every weekday (Monday to Friday)' }
      )
    }
  } else {
    // Fallback if no start date
    options.push(
      { value: 'RRULE:FREQ=WEEKLY', label: 'Weekly' },
      { value: 'RRULE:FREQ=WEEKLY;WKST=SU;INTERVAL=2;BYDAY=MO', label: 'Fortnightly' },
      { value: 'RRULE:FREQ=MONTHLY', label: 'Monthly' },
      { value: 'RRULE:FREQ=YEARLY', label: 'Yearly' },
      { value: 'RRULE:FREQ=WEEKLY;WKST=SU;BYDAY=MO,TU,WE,TH,FR', label: 'Every weekday (Monday to Friday)' }
    )
  }

  return options
}

export function RecurrenceSelector({
  label,
  id,
  value,
  onValueChange,
  startDate,
  error,
  disabled = false,
  required = false,
  className,
}: RecurrenceSelectorProps) {
  // Generate options based on start date
  const options = React.useMemo(() => getRecurrenceOptions(startDate), [startDate])

  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value || "none"}
        onValueChange={(newValue) => {
          // Convert 'none' back to empty string for the form
          onValueChange(newValue === 'none' ? '' : newValue);
        }}
        disabled={disabled}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder="Select recurrence" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
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
