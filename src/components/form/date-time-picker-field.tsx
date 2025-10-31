"use client"

import * as React from "react"
import { FieldError } from "react-hook-form"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Label } from "@/components/ui/label"

interface DateTimePickerFieldProps {
  label: string
  dateId: string
  timeId: string
  value: string | undefined // Form value as ISO string (YYYY-MM-DDTHH:mm:ss)
  onChange: (value: string) => void // Callback with ISO string
  error?: FieldError
  disabled?: boolean
  datePlaceholder?: string
  timePlaceholder?: string
  className?: string
}

// Convert ISO string (YYYY-MM-DDTHH:mm:ss) or YYYY-MM-DD string to Date object
function stringToDate(value: string | undefined): Date | undefined {
  if (!value) return undefined
  // Handle ISO string format
  let dateStr = value
  if (!value.includes("T")) {
    dateStr = value + "T00:00:00"
  }
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? undefined : date
}

// Convert Date object to ISO string format (YYYY-MM-DDTHH:mm:ss)
function dateToISOString(date: Date | undefined): string {
  if (!date) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

// Extract time string (HH:mm:ss) from ISO string or Date
function extractTimeString(value: string | undefined, date?: Date): string {
  if (date) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`
  }
  if (!value) return ""
  if (value.includes("T")) {
    const timePart = value.split("T")[1]
    return timePart || "00:00:00"
  }
  return "00:00:00"
}

export function DateTimePickerField({
  label,
  dateId,
  timeId,
  value,
  onChange,
  error,
  disabled = false,
  datePlaceholder = "Select date",
  timePlaceholder = "10:30:00",
  className,
}: DateTimePickerFieldProps) {
  const [dateValue, setDateValue] = React.useState<Date | undefined>(
    stringToDate(value)
  )

  const [timeValue, setTimeValue] = React.useState<string>(
    extractTimeString(value, dateValue)
  )

  React.useEffect(() => {
    const newDate = stringToDate(value)
    setDateValue(newDate)
    setTimeValue(extractTimeString(value, newDate))
  }, [value])

  const handleDateChange = (date: Date | undefined) => {
    setDateValue(date)
    const isoString = dateToISOString(date)
    onChange(isoString)
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)
    
    // Update the date with new time
    const currentDate = dateValue || new Date()
    const [hours, minutes, seconds = "0"] = time.split(":")
    currentDate.setHours(parseInt(hours, 10))
    currentDate.setMinutes(parseInt(minutes, 10))
    currentDate.setSeconds(parseInt(seconds, 10))
    
    const isoString = dateToISOString(currentDate)
    onChange(isoString)
  }

  return (
    <div className={className}>
      <Label htmlFor={dateId}>{label}</Label>
      <DateTimePicker
        dateId={dateId}
        timeId={timeId}
        dateValue={dateValue}
        timeValue={timeValue}
        onDateChange={handleDateChange}
        onTimeChange={handleTimeChange}
        datePlaceholder={datePlaceholder}
        timePlaceholder={timePlaceholder}
        disabled={disabled}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  )
}

