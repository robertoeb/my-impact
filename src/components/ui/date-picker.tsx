import * as React from "react"
import { format, parse } from "date-fns"
import { enUS, ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useApp } from "@/contexts/AppContext"

const dateFnsLocales = {
  "en-US": enUS,
  "pt-BR": ptBR,
}

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const { locale } = useApp()

  const dateFnsLocale = dateFnsLocales[locale] || enUS
  const date = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(format(selectedDate, "yyyy-MM-dd"))
    }
    setOpen(false)
  }

  const formatDate = (d: Date) => {
    return format(d, "dd MMM yyyy", { locale: dateFnsLocale })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-10 justify-start text-left font-normal bg-background hover:bg-secondary",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          {date ? formatDate(date) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-border" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          locale={dateFnsLocale}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

