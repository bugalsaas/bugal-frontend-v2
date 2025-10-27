"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" {...props} />
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "focus:ring-primary data-[state=unchecked]:border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground hover:border-primary/50 aspect-square h-4 w-4 rounded-full border outline-offset-2 outline-hidden focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&:has([data-slot=radio-group-indicator])]:border-primary",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="relative flex items-center justify-center data-[state=checked]:animate-in data-[state=unchecked]:animate-out data-[state=unchecked]:fade-out-0 data-[state=checked]:fade-in-0 data-[state=checked]:zoom-in-95 data-[state=unchecked]:zoom-out-95">
        <CircleIcon className="h-2.5 w-2.5 fill-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
