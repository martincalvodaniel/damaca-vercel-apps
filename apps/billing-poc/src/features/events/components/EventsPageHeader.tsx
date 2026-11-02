"use client"

import MonthPicker from "@/features/payments/components/month/MonthPicker"

interface EventsPageHeaderProps {
  selectedDate: Date
  showCalendar: boolean
  onShowCalendarChange: (show: boolean) => void
  isViewingCurrentMonth: boolean
  onGoToCurrentMonth: () => void
  onMonthChange: (year: number, month: number) => void
}

export default function EventsPageHeader({
  selectedDate,
  showCalendar,
  onShowCalendarChange,
  isViewingCurrentMonth,
  onGoToCurrentMonth,
  onMonthChange,
}: EventsPageHeaderProps) {
  return (
    <div className="space-y-2 rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 border-b border-zinc-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          <MonthPicker
            selectedDate={selectedDate}
            onMonthChange={onMonthChange}
            showCalendar={showCalendar}
            onShowCalendarChange={onShowCalendarChange}
            isViewingCurrentMonth={isViewingCurrentMonth}
            onGoToCurrentMonth={onGoToCurrentMonth}
          />
        </div>
      </div>
    </div>
  )
}
