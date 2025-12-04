"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { format, startOfMonth, startOfWeek, startOfToday, endOfMonth, endOfWeek, endOfToday, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export type Preset = 'this_week' | 'this_month' | 'today' | 'all_time' | 'custom';

interface DateRangeFilterProps {
  onDateChange: (dateRange: DateRange | undefined) => void;
  onPresetChange?: (preset: Preset) => void;
  activePreset?: Preset;
  defaultRange?: Preset;
}

export function DateRangeFilter({ 
  onDateChange, 
  onPresetChange, 
  activePreset, 
  defaultRange = 'this_month' 
}: DateRangeFilterProps) {
  
  const [date, setDate] = useState<DateRange | undefined>();
  const [internalPreset, setInternalPreset] = useState<Preset>(defaultRange);

  const currentPreset = activePreset ?? internalPreset;

  // Initialize date based on defaultRange on mount
  useEffect(() => {
    const today = startOfToday();
    if (defaultRange === 'this_month') {
       setDate({ from: startOfMonth(today), to: endOfToday() });
       // Ensure parent gets the initial date if needed, though usually parent fetches on its own
    } else if (defaultRange === 'this_week') {
       setDate({ from: startOfWeek(today, { locale: es }), to: endOfToday() });
    } else if (defaultRange === 'today') {
       setDate({ from: today, to: endOfToday() });
    } else if (defaultRange === 'all_time') {
       setDate(undefined);
    }
  }, []);

  const handlePresetClick = (preset: Preset) => {
    const today = startOfToday();
    let newRange: DateRange | undefined;

    switch (preset) {
      case 'this_month':
        newRange = { from: startOfMonth(today), to: endOfToday() };
        break;
      case 'this_week':
        newRange = { from: startOfWeek(today, { locale: es }), to: endOfToday() };
        break;
      case 'today':
        newRange = { from: today, to: endOfToday() };
        break;
      case 'all_time':
        newRange = undefined;
        break;
    }
    setDate(newRange);
    onDateChange(newRange);
    setInternalPreset(preset);
    if (onPresetChange) onPresetChange(preset);
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    const adjustedRange = range?.to ? { ...range, to: endOfToday() < range.to ? range.to : endOfToday() } : range; // Just ensuring we don't break it. 
    // actually, if I select a past date, endOfToday is wrong. I should use endOfDay(range.to).
    
    let finalRange = range;
    if (range?.to) {
        finalRange = { ...range, to: endOfDay(range.to) };
    }

    setDate(finalRange);
    onDateChange(finalRange);
    setInternalPreset('custom');
    if (onPresetChange) onPresetChange('custom'); 
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={`cursor-pointer ${currentPreset === 'custom' ? 'border-primary text-primary' : ''}`}>
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
      <Button className="cursor-pointer" variant={currentPreset === 'today' ? 'default' : 'outline'} onClick={() => handlePresetClick('today')}>Hoy</Button>
      <Button className="cursor-pointer" variant={currentPreset === 'this_week' ? 'default' : 'outline'} onClick={() => handlePresetClick('this_week')}>Esta semana</Button>
      <Button className="cursor-pointer" variant={currentPreset === 'this_month' ? 'default' : 'outline'} onClick={() => handlePresetClick('this_month')}>Este mes</Button>
      <Button className="cursor-pointer" variant={currentPreset === 'all_time' ? 'default' : 'outline'} onClick={() => handlePresetClick('all_time')}>Desde siempre</Button>
    </div>
  );
}
