'use client';

import { Venta } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface VentasReportTableProps {
  ventas: Venta[];
  onAnular: (id: number) => void;
}

const formatCurrency = (value: number) => {
return new Intl.NumberFormat('es-PE', {
style: 'currency',
currency: 'PEN',
}).format(value);
};
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function VentasReportTable({ ventas, onAnular }: VentasReportTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Venta</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ventas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">No se encontraron ventas.</TableCell>
            </TableRow>
          ) : (
            ventas.map((venta) => (
              <TableRow key={venta.id} className={!venta.esta_activo ? 'bg-muted/50' : ''}>
                <TableCell className="font-medium">#{venta.id}</TableCell>
                <TableCell>{formatDate(venta.fecha)}</TableCell>
                <TableCell>{venta.cliente?.nombre || 'N/A'}</TableCell>
                <TableCell>{venta.usuario?.nombre_completo || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    {venta.detalles_venta?.map(d => (
                      <span key={d.id} className="text-sm">
                        {d.cantidad}x {d.producto?.nombre || d.descripcion_libre}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(Number(venta.total))}</TableCell>
                <TableCell>
                  {!venta.esta_activo && <Badge variant="destructive">Anulado</Badge>}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAnular(venta.id)}
                    disabled={!venta.esta_activo}
                  >
                    Anular
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
