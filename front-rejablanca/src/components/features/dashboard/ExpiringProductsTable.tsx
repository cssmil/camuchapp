import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExpiringProduct } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, parseISO } from 'date-fns';

interface Props {
  data: ExpiringProduct[];
}

export function ExpiringProductsTable({ data }: Props) {

  const getRemainingDays = (expirationDate: string | null | undefined) => {
    if (!expirationDate) return { text: 'N/A', variant: 'secondary' as const };
    const today = new Date();
    const expiry = parseISO(expirationDate);
    const days = differenceInDays(expiry, today);

    if (days < 0) return { text: 'Vencido', variant: 'destructive' as const };
    if (days <= 7) return { text: `${days} días`, variant: 'destructive' as const };
    if (days <= 15) return { text: `${days} días`, variant: 'warning' as const };
    return { text: `${days} días`, variant: 'default' as const };
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Productos Próximos a Vencer</CardTitle>
        <CardDescription>
          Productos que vencerán en los próximos 15 días.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-center">Fecha de Vencimiento</TableHead>
              <TableHead className="text-center">Días Restantes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product) => {
              const remaining = getRemainingDays(product.fecha_vencimiento);
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.nombre}</TableCell>
                  <TableCell className="text-center">{formatDate(product.fecha_vencimiento)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={remaining.variant}>{remaining.text}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
