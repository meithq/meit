"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FormSelectProps {
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  options: Array<{ value: string; label: string }>
  className?: string
  disabled?: boolean
}

export function FormSelect({
  placeholder,
  value,
  onValueChange,
  options,
  className,
  disabled,
}: FormSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={`w-full bg-white ${className || ""}`}
        style={{ minHeight: "56px", borderRadius: "50px", borderColor: "#eeeeee" }}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
