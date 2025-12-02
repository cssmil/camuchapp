import * as XLSX from 'xlsx';
import { Venta, Gasto } from '@/types';

export const exportToExcel = (ventas: Venta[], gastos: Gasto[], fileName: string) => {
  const ventasData = ventas.map(venta => ({
    'Fecha': new Date(venta.fecha).toLocaleDateString(),
    'Cliente': venta.cliente?.nombre || 'N/A',
    'Total': venta.total,
    'Usuario': venta.usuario.nombre_completo,
    'Productos': venta.detalles_venta.map(d => d.producto?.nombre || d.descripcion_libre).join(', '),
  }));

  const gastosData = gastos.map(gasto => ({
    'Fecha': new Date(gasto.fecha).toLocaleDateString(),
    'Proveedor': gasto.proveedor?.nombre || 'N/A',
    'Total': gasto.total,
    'Usuario': gasto.usuario.nombre_completo,
    'Descripción': gasto.detalles_gasto.map(d => d.descripcion).join(', '),
  }));

  const wb = XLSX.utils.book_new();
  const wsVentas = XLSX.utils.json_to_sheet(ventasData);
  const wsGastos = XLSX.utils.json_to_sheet(gastosData);

  XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas');
  XLSX.utils.book_append_sheet(wb, wsGastos, 'Gastos');

  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
