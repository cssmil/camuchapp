
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SalesOverTime } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: SalesOverTime[];
  periodLabel: string;
}

const formatCurrency = (amount: number) => {
return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
}
export function SalesLineChart({ data, periodLabel }: Props) {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Ventas {periodLabel}</CardTitle>
            <CardDescription>Evolución de los ingresos {periodLabel}.</CardDescription>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Total']} />
                    <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
  );
}
