"use client"

import { CalendarIcon } from "lucide-react"
import * as React from "react"
import { DateRange } from "react-day-picker"

import { Button } from "@/lib/shared/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/lib/shared/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerWithRangeProps {
  className?: string
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
  className,
  date,
  onDateChange,
}: DatePickerWithRangeProps) {
  const [selectedDate, setSelectedDate] = React.useState<DateRange | undefined>(date)

  const handleDateChange = (newDate: DateRange | undefined) => {
    setSelectedDate(newDate)
    onDateChange?.(newDate)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate?.from ? (
              selectedDate.to ? (
                <>
                  {selectedDate.from.toLocaleDateString()} -{" "}
                  {selectedDate.to.toLocaleDateString()}
                </>
              ) : (
                selectedDate.from.toLocaleDateString()
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4">
            <div className="text-sm text-muted-foreground mb-4">
              Select a date range for your query
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  handleDateChange({ from: lastWeek, to: today })
                }}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                  handleDateChange({ from: lastMonth, to: today })
                }}
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const lastYear = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
                  handleDateChange({ from: lastYear, to: today })
                }}
              >
                Last year
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}