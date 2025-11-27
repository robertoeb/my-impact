import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useNavigation } from "react-day-picker"
import { format, setMonth, setYear } from "date-fns"
import type { Locale } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  locale?: Locale
}

function CustomCaption({ calendarMonth, locale }: { calendarMonth: Date; locale?: Locale }) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation()

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2024, i, 1)
    return {
      value: i,
      label: format(date, "LLLL", { locale }),
    }
  })

  const currentYear = new Date().getFullYear()
  const fromYear = currentYear - 10
  const toYear = currentYear + 5
  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i)

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10)
    goToMonth(setMonth(calendarMonth, newMonth))
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10)
    goToMonth(setYear(calendarMonth, newYear))
  }

  return (
    <div className="calendar-caption">
      <button
        type="button"
        className="calendar-nav-button"
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="calendar-dropdowns">
        <select
          className="calendar-dropdown"
          value={calendarMonth.getMonth()}
          onChange={handleMonthChange}
          aria-label="Select month"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        <select
          className="calendar-dropdown calendar-dropdown-year"
          value={calendarMonth.getFullYear()}
          onChange={handleYearChange}
          aria-label="Select year"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="calendar-nav-button"
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale,
  ...props
}: CalendarProps) {
  const currentYear = new Date().getFullYear()
  const fromYear = currentYear - 10
  const toYear = currentYear + 5

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      startMonth={new Date(fromYear, 0)}
      endMonth={new Date(toYear, 11)}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-2",
        month: "flex flex-col gap-3",
        month_caption: "hidden",
        nav: "hidden",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground w-9 font-medium text-[0.75rem] text-center uppercase",
        week: "flex w-full mt-1",
        day: "h-9 w-9 text-center text-sm p-0 relative",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal hover:bg-secondary rounded-md"
        ),
        range_end: "day-range-end",
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:font-semibold",
        today: "[&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:font-semibold",
        outside: "[&>button]:text-muted-foreground [&>button]:opacity-40",
        disabled: "[&>button]:text-muted-foreground [&>button]:opacity-30 [&>button]:cursor-not-allowed",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        MonthCaption: ({ calendarMonth }) => (
          <CustomCaption calendarMonth={calendarMonth.date} locale={locale} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
