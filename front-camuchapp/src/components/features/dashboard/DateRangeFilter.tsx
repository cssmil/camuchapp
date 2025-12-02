"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { format, startOfMonth, startOfWeek, startOfToday, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

type Preset = 'this_week' | 'this_month' | 'today' | 'all_time';

interface DateRangeFilterProps {
  onDateChange: (dateRange: DateRange | undefined) => void;
  defaultRange?: Preset;
}

export function DateRangeFilter({ onDateChange, defaultRange = 'this_week' }: DateRangeFilterProps) {
  const getInitialDateRange = (): DateRange | undefined => {
    const today = startOfToday();
    switch (defaultRange) {
      case 'this_month':
        return { from: startOfMonth(today), to: today };
      case 'this_week':
        return { from: startOfWeek(today, { locale: es }), to: today };
      case 'today':
        return { from: today, to: today };
      case 'all_time':
      default:
        return undefined;
    }
  };

  const [date, setDate] = useState<DateRange | undefined>(getInitialDateRange());
  const [activePreset, setActivePreset] = useState<Preset | null>(defaultRange);

  const handlePresetClick = (preset: Preset) => {
    const today = startOfToday();
    let newRange: DateRange | undefined;

    switch (preset) {
      case 'this_month':
        newRange = { from: startOfMonth(today), to: today };
        break;
      case 'this_week':
        newRange = { from: startOfWeek(today, { locale: es }), to: today };
        break;
      case 'today':
        newRange = { from: today, to: today };
        break;
      case 'all_time':
        newRange = undefined;
        break;
    }
    setDate(newRange);
    onDateChange(newRange);
    setActivePreset(preset);
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setDate(range);
    onDateChange(range);
    setActivePreset(null); // Custom range selected
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Selecciona un rango</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <Button variant={activePreset === 'today' ? 'default' : 'outline'} onClick={() => handlePresetClick('today')}>Hoy</Button>
      <Button variant={activePreset === 'this_week' ? 'default' : 'outline'} onClick={() => handlePresetClick('this_week')}>Esta semana</Button>
      <Button variant={activePreset === 'this_month' ? 'default' : 'outline'} onClick={() => handlePresetClick('this_month')}>Este mes</Button>
      <Button variant={activePreset === 'all_time' ? 'default' : 'outline'} onClick={() => handlePresetClick('all_time')}>Desde siempre</Button>
    </div>
  );
}
