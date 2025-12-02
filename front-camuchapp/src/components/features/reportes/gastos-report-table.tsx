'use client';

import { Gasto } from '@/types';
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

interface GastosReportTableProps {
  gastos: Gasto[];
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

export function GastosReportTable({ gastos, onAnular }: GastosReportTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Gasto</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gastos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">No se encontraron gastos.</TableCell>
            </TableRow>
          ) : (
            gastos.map((gasto) => (
              <TableRow key={gasto.id} className={!gasto.esta_activo ? 'bg-muted/50' : ''}>
                <TableCell className="font-medium">#{gasto.id}</TableCell>
                <TableCell>{formatDate(gasto.fecha)}</TableCell>
                <TableCell>{gasto.proveedor?.nombre || 'N/A'}</TableCell>
                <TableCell>{gasto.usuario?.nombre_completo || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    {gasto.detalles_gasto.map(d => (
                      <span key={d.id} className="text-sm">
                        {d.descripcion}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(Number(gasto.total))}</TableCell>
                <TableCell>
                  {!gasto.esta_activo && <Badge variant="destructive">Anulado</Badge>}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAnular(gasto.id)}
                    disabled={!gasto.esta_activo}
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
