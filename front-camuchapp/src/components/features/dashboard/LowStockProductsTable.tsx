
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LowStockProduct } from "@/types";
import { Badge } from "@/components/ui/badge";

interface Props {
  data: LowStockProduct[];
}

export function LowStockProductsTable({ data }: Props) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Productos con Bajo Stock</CardTitle>
        <CardDescription>
          Productos cuyo stock actual es igual o menor al stock mínimo establecido.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-center">Stock Actual</TableHead>
              <TableHead className="text-center">Stock Mínimo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.nombre}</TableCell>
                <TableCell className="text-center">
                    <Badge variant="destructive">{product.stock}</Badge>
                </TableCell>
                <TableCell className="text-center">{product.stock_minimo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
