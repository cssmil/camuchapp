
"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import { DashboardSummary, SalesOverTime, TopSellingProduct, LowStockProduct, ExpiringProduct } from "@/types";
import { SummaryCards } from "./SummaryCards";
import { SalesLineChart } from "./SalesLineChart";
import { TopSellingProductsPieChart } from "./TopSellingProductsPieChart";
import { LowStockProductsTable } from "./LowStockProductsTable";
import { ExpiringProductsTable } from "./ExpiringProductsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangeFilter, Preset } from "./DateRangeFilter";
import { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startOfMonth, startOfToday } from "date-fns";

export function DashboardClient() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [salesOverTime, setSalesOverTime] = useState<SalesOverTime[]>([]);
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<ExpiringProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [preset, setPreset] = useState<Preset>('this_month');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = startOfToday();
    return { from: startOfMonth(today), to: today };
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryData, salesData, topProductsData, lowStockData, expiringData] = await Promise.all([
          dashboardService.getSummary(dateRange?.from?.toISOString(), dateRange?.to?.toISOString()),
          dashboardService.getSalesOverTime(dateRange?.from?.toISOString(), dateRange?.to?.toISOString()),
          dashboardService.getTopSellingProducts(dateRange?.from?.toISOString(), dateRange?.to?.toISOString()),
          dashboardService.getLowStockProducts(),
          dashboardService.getExpiringProducts(),
        ]);
        setSummary(summaryData);
        setSalesOverTime(salesData);
        setTopProducts(topProductsData);
        setLowStock(lowStockData);
        setExpiringProducts(expiringData);
      } catch (err) {
        setError("No se pudieron cargar los datos del dashboard. Intente de nuevo más tarde.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const getPeriodLabel = () => {
    switch (preset) {
      case 'today': return 'hoy';
      case 'this_week': return 'esta semana';
      case 'this_month': return 'este mes';
      case 'all_time': return 'desde siempre';
      case 'custom': return 'en el periodo seleccionado';
      default: return '';
    }
  };

  const periodLabel = getPeriodLabel();

  return (
    <div className="space-y-8">
      <div className="flex justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Panel de Control</h1>
        <DateRangeFilter 
            onDateChange={setDateRange} 
            onPresetChange={setPreset}
            activePreset={preset}
        />
      </div>

      {loading ? (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            </div>
            <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            </div>
            <Skeleton className="h-96" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          {summary && <SummaryCards summary={summary} periodLabel={periodLabel} />}
          
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
                {salesOverTime.length > 0 && <SalesLineChart data={salesOverTime} periodLabel={periodLabel} />}
            </div>
            <div className="lg:col-span-2">
                {topProducts.length > 0 && <TopSellingProductsPieChart data={topProducts} periodLabel={periodLabel} />}
            </div>
          </div>

          <Tabs defaultValue="low-stock">
            <TabsList>
              <TabsTrigger
                value="low-stock"
                className="border border-destructive text-destructive data-[state=active]:bg-red-100"
              >
                Alertas de Stock Bajo
              </TabsTrigger>
              <TabsTrigger
                value="expiring-soon"
                className="border border-destructive text-destructive data-[state=active]:bg-red-100"
              >
                Productos por Vencer
              </TabsTrigger>
            </TabsList>
            <TabsContent value="low-stock">
              {lowStock.length > 0 ? (
                <LowStockProductsTable data={lowStock} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No hay productos con stock bajo.
                </div>
              )}
            </TabsContent>
            <TabsContent value="expiring-soon">
              {expiringProducts.length > 0 ? (
                <ExpiringProductsTable data={expiringProducts} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No hay productos próximos a vencer.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
