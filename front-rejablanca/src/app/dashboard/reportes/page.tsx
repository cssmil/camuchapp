'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gasto, Venta } from '@/types';
import { gastosService } from '@/services/gastos.service';
import { ventasService } from '@/services/ventas.service';
import { BalanceSummary } from '@/components/features/reportes/balance-summary';
import { VentasReportTable } from '@/components/features/reportes/ventas-report-table';
import { GastosReportTable } from '@/components/features/reportes/gastos-report-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangeFilter } from '@/components/features/dashboard/DateRangeFilter';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { exportToExcel } from '@/utils/excel';
import { format } from 'date-fns';

export default function PaginaReportes() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ventasData, gastosData] = await Promise.all([
        ventasService.obtenerTodos(dateRange?.from?.toISOString(), dateRange?.to?.toISOString()),
        gastosService.obtenerTodos(dateRange?.from?.toISOString(), dateRange?.to?.toISOString()),
      ]);
      setVentas(ventasData);
      setGastos(gastosData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos para los reportes.');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAnularVenta = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres anular esta venta? El stock de los productos será restaurado.')) {
      try {
        await ventasService.anular(id);
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error al anular la venta', error);
        setError('No se pudo anular la venta.');
      }
    }
  };

  const handleAnularGasto = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres anular este gasto?')) {
      try {
        await gastosService.anular(id);
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error al anular el gasto', error);
        setError('No se pudo anular el gasto.');
      }
    }
  };

  const totalVentas = ventas.filter(v => v.esta_activo).reduce((acc, v) => acc + Number(v.total), 0);
  const totalGastos = gastos.filter(g => g.esta_activo).reduce((acc, g) => acc + Number(g.total), 0);

  const handleExport = () => {
    const from = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : 'inicio';
    const to = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : 'fin';
    const fileName = `Reporte_${from}_a_${to}`;
    exportToExcel(ventas, gastos, fileName);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <div className="flex items-center gap-2">
          <DateRangeFilter onDateChange={setDateRange} defaultRange="this_week" />
        </div>
      </div>
      
      {isLoading ? (
        <p>Cargando reportes...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <BalanceSummary totalVentas={totalVentas} totalGastos={totalGastos} />
          
          <Tabs defaultValue="ventas" className="w-full">
            <div className='flex justify-between items-center'>
              <TabsList>
                <TabsTrigger value="ventas">Ventas</TabsTrigger>
                <TabsTrigger value="gastos">Gastos</TabsTrigger>
              </TabsList>
            <Button onClick={handleExport}>Exportar a Excel</Button>
            </div>
            
            <TabsContent value="ventas">
              <VentasReportTable ventas={ventas} onAnular={handleAnularVenta} />
            </TabsContent>
            <TabsContent value="gastos">
              <GastosReportTable gastos={gastos} onAnular={handleAnularGasto} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
