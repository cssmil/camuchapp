
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSummary } from "@/types";
import { CreditCard, TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  summary: DashboardSummary;
}

const formatCurrency = (amount: number) => {
return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
}
export function SummaryCards({ summary }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalVentas)}</div>
          <p className="text-xs text-muted-foreground">Total de ingresos registrados</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalGastos)}</div>
          <p className="text-xs text-muted-foreground">Total de egresos registrados</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.balance)}
          </div>
          <p className="text-xs text-muted-foreground">Diferencia entre ventas y gastos</p>
        </CardContent>
      </Card>
    </div>
  );
}
