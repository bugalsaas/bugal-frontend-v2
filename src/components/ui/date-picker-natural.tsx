"use client"

import * as React from "react"
import { parseDate } from "chrono-node"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

interface DatePickerNaturalProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
  initialInputValue?: string
}

export function DatePickerNatural({
  value,
  onChange,
  placeholder = "Tomorrow or next week",
  disabled = false,
  id,
  className,
  initialInputValue,
}: DatePickerNaturalProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(
    initialInputValue || formatDate(value) || ""
  )
  const [month, setMonth] = React.useState<Date | undefined>(value)

  React.useEffect(() => {
    if (value) {
      setInputValue(formatDate(value))
      setMonth(value)
    }
  }, [value])

  return (
    <div className={`relative flex gap-2 ${className || ""}`}>
      <Input
        id={id}
        value={inputValue}
        placeholder={placeholder}
        className="bg-background pr-10"
        onChange={(e) => {
          setInputValue(e.target.value)
          const parsedDate = parseDate(e.target.value)
          if (parsedDate) {
            onChange?.(parsedDate)
            setMonth(parsedDate)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
        }}
        disabled={disabled}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={`${id}-picker`}
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            disabled={disabled}
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="end">
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              onChange?.(date)
              setInputValue(formatDate(date))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

