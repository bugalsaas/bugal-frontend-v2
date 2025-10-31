"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  dateValue?: Date
  timeValue?: string
  onDateChange?: (date: Date | undefined) => void
  onTimeChange?: (time: string) => void
  datePlaceholder?: string
  timePlaceholder?: string
  disabled?: boolean
  dateId?: string
  timeId?: string
  className?: string
}

export function DateTimePicker({
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  datePlaceholder = "Select date",
  timePlaceholder = "10:30:00",
  disabled = false,
  dateId,
  timeId,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Extract time string from Date if timeValue not provided but dateValue is
  const timeString = timeValue || (dateValue 
    ? `${String(dateValue.getHours()).padStart(2, '0')}:${String(dateValue.getMinutes()).padStart(2, '0')}:${String(dateValue.getSeconds()).padStart(2, '0')}`
    : "")

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    onTimeChange?.(time)
    
    // If we have a date, update it with the new time
    if (dateValue && time) {
      const [hours, minutes, seconds = '0'] = time.split(':')
      const newDate = new Date(dateValue)
      newDate.setHours(parseInt(hours, 10))
      newDate.setMinutes(parseInt(minutes, 10))
      newDate.setSeconds(parseInt(seconds, 10))
      onDateChange?.(newDate)
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date && timeString) {
      // Preserve time when date changes
      const [hours, minutes, seconds = '0'] = timeString.split(':')
      date.setHours(parseInt(hours, 10))
      date.setMinutes(parseInt(minutes, 10))
      date.setSeconds(parseInt(seconds, 10))
    }
    onDateChange?.(date)
    setOpen(false)
  }

  return (
    <div className={`flex gap-4 ${className || ""}`}>
      <div className="flex flex-col gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id={dateId}
              className="w-32 justify-between font-normal"
              disabled={disabled}
            >
              {dateValue ? dateValue.toLocaleDateString() : datePlaceholder}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              captionLayout="dropdown"
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Input
          type="time"
          id={timeId}
          step="1"
          value={timeString}
          placeholder={timePlaceholder}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          onChange={handleTimeChange}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

