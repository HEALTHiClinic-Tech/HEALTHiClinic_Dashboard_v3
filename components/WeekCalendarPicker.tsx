"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { format, startOfWeek, endOfWeek, addWeeks, getWeek, getYear, startOfYear, addDays, isSameWeek, isAfter } from "date-fns"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WeekCalendarPickerProps {
  selectedWeek: Date
  onWeekSelect: (weekStart: Date) => void
  minYear?: number
  maxYear?: number
}

export default function WeekCalendarPicker({ 
  selectedWeek, 
  onWeekSelect,
  minYear = 2024,
  maxYear = 2075
}: WeekCalendarPickerProps) {
  const [currentYear, setCurrentYear] = useState(getYear(selectedWeek))
  const [weeks, setWeeks] = useState<Date[]>([])
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')

  useEffect(() => {
    generateWeeks()
  }, [currentYear])

  const generateWeeks = () => {
    const yearStart = startOfYear(new Date(currentYear, 0, 1))
    let firstMonday = startOfWeek(yearStart, { weekStartsOn: 1 })
    
    // If January 1st is not a Monday, get the first Monday of the year
    if (firstMonday < yearStart) {
      firstMonday = addWeeks(firstMonday, 1)
    }

    const weekDates: Date[] = []
    let currentWeek = firstMonday
    
    // Generate all Mondays for the year
    for (let i = 0; i < 52; i++) {
      if (getYear(currentWeek) === currentYear) {
        weekDates.push(currentWeek)
      }
      currentWeek = addWeeks(currentWeek, 1)
    }
    
    setWeeks(weekDates)
  }

  const handlePreviousYear = () => {
    if (currentYear > minYear) {
      setCurrentYear(currentYear - 1)
    }
  }

  const handleNextYear = () => {
    if (currentYear < maxYear) {
      setCurrentYear(currentYear + 1)
    }
  }

  const handleWeekClick = (weekStart: Date) => {
    onWeekSelect(weekStart)
  }

  const today = new Date()
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 })

  // Calendar View - Grid of months
  const renderCalendarView = () => {
    const months = Array.from({ length: 12 }, (_, i) => i)
    
    return (
      <div className="grid grid-cols-3 gap-4">
        {months.map(monthIndex => {
          const monthName = format(new Date(currentYear, monthIndex), 'MMMM')
          const monthWeeks = weeks.filter(week => {
            const weekMonth = week.getMonth()
            return weekMonth === monthIndex
          })

          return (
            <Card key={monthIndex} className="p-4">
              <h3 className="font-semibold text-sm mb-3 text-center">{monthName}</h3>
              <div className="space-y-1">
                {monthWeeks.map(weekStart => {
                  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
                  const weekNum = getWeek(weekStart, { weekStartsOn: 1 })
                  const isSelected = isSameWeek(weekStart, selectedWeek, { weekStartsOn: 1 })
                  const isCurrentWeek = isSameWeek(weekStart, currentWeekStart, { weekStartsOn: 1 })
                  const isFuture = isAfter(weekStart, today)
                  
                  return (
                    <button
                      key={weekStart.toISOString()}
                      onClick={() => handleWeekClick(weekStart)}
                      className={`
                        w-full text-left px-3 py-2 rounded-md text-xs transition-all
                        hover:bg-gray-100 flex justify-between items-center
                        ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                        ${isCurrentWeek && !isSelected ? 'bg-green-100 text-green-700' : ''}
                        ${isFuture && !isSelected ? 'text-gray-400' : ''}
                      `}
                    >
                      <span className="font-medium">Week {weekNum}</span>
                      <span className="text-[10px] opacity-80">
                        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  // List View - All weeks in a scrollable list
  const renderListView = () => {
    return (
      <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
        {weeks.map(weekStart => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
          const weekNum = getWeek(weekStart, { weekStartsOn: 1 })
          const isSelected = isSameWeek(weekStart, selectedWeek, { weekStartsOn: 1 })
          const isCurrentWeek = isSameWeek(weekStart, currentWeekStart, { weekStartsOn: 1 })
          const isFuture = isAfter(weekStart, today)
          
          return (
            <button
              key={weekStart.toISOString()}
              onClick={() => handleWeekClick(weekStart)}
              className={`
                w-full text-left px-4 py-3 rounded-lg transition-all
                hover:bg-gray-100 border
                ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600 border-blue-600' : 'border-gray-200'}
                ${isCurrentWeek && !isSelected ? 'bg-green-50 border-green-300' : ''}
                ${isFuture && !isSelected ? 'text-gray-400' : ''}
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">Week {weekNum}</span>
                  {isCurrentWeek && (
                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">Current Week</span>
                  )}
                </div>
                <div className="text-sm">
                  <span className="font-medium">{format(weekStart, 'MMM d, yyyy')}</span>
                  <span className="mx-2">→</span>
                  <span className="font-medium">{format(weekEnd, 'MMM d, yyyy')}</span>
                </div>
              </div>
              <div className="mt-1 text-xs opacity-70">
                Monday to Sunday
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Year Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={handlePreviousYear}
            disabled={currentYear <= minYear}
            variant="outline"
            size="icon"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-2xl font-bold">{currentYear}</h2>
          
          <Button
            onClick={handleNextYear}
            disabled={currentYear >= maxYear}
            variant="outline"
            size="icon"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setViewMode('calendar')}
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
          >
            List View
          </Button>
        </div>
      </div>

      {/* Selected Week Display */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">Selected Week</p>
            <p className="text-xl font-bold text-blue-900">
              Week {getWeek(selectedWeek, { weekStartsOn: 1 })} - {format(selectedWeek, 'MMMM d, yyyy')}
            </p>
            <p className="text-sm text-blue-700">
              {format(selectedWeek, 'EEEE, MMM d')} → {format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 'EEEE, MMM d')}
            </p>
          </div>
          <Calendar className="h-8 w-8 text-blue-500" />
        </div>
      </Card>

      {/* Week Selection */}
      {viewMode === 'calendar' ? renderCalendarView() : renderListView()}
      
      {/* Quick Jump to Current Week */}
      <div className="flex justify-center">
        <Button
          onClick={() => {
            const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
            onWeekSelect(thisWeekStart)
            setCurrentYear(getYear(thisWeekStart))
          }}
          variant="outline"
          className="w-full max-w-xs"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Jump to Current Week
        </Button>
      </div>
    </div>
  )
}