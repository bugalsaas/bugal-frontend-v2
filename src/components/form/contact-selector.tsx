"use client"

import * as React from "react"
import { FieldError } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useContacts } from "@/hooks/use-contacts"
import { Contact } from "@/lib/api/contacts-service"

interface ContactSelectorProps {
  label: string
  id: string
  value: string | undefined // Contact ID
  onValueChange: (value: string) => void // Callback with contact ID
  error?: FieldError
  disabled?: boolean
  required?: boolean
  className?: string
  onContactChange?: (contact: Contact | undefined) => void // Optional callback with full contact object
}

export function ContactSelector({
  label,
  id,
  value,
  onValueChange,
  error,
  disabled = false,
  required = false,
  className,
  onContactChange,
}: ContactSelectorProps) {
  const { data: contacts, loading, error: fetchError } = useContacts({ pageSize: 100 })

  const handleValueChange = (newValue: string) => {
    onValueChange(newValue)
    if (onContactChange) {
      const selectedContact = contacts.find(c => c.id === newValue)
      onContactChange(selectedContact)
    }
  }

  // Find the selected contact for display
  const selectedContact = value ? contacts.find(c => c.id === value) : undefined

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
          <SelectValue placeholder={loading ? "Loading contacts..." : "Select contact"} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading contacts...</span>
            </div>
          ) : fetchError ? (
            <div className="p-4 text-sm text-red-600">
              Failed to load contacts: {fetchError}
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No contacts available</div>
          ) : (
            contacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                {contact.fullName || contact.organisationName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed Contact'}
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
