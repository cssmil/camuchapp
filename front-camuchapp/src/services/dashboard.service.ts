
import api from './api';
import { 
    DashboardSummary, 
    SalesOverTime, 
    TopSellingProduct, 
    LowStockProduct,
    ExpiringProduct
} from '@/types';

const getSummary = async (fecha_inicio?: string, fecha_fin?: string): Promise<DashboardSummary> => {
  const response = await api.get('/dashboard/summary', { params: { fecha_inicio, fecha_fin } });
  return response.data;
};

const getSalesOverTime = async (fecha_inicio?: string, fecha_fin?: string): Promise<SalesOverTime[]> => {
    const response = await api.get('/dashboard/sales-over-time', { params: { fecha_inicio, fecha_fin } });
    return response.data;
};

const getTopSellingProducts = async (fecha_inicio?: string, fecha_fin?: string): Promise<TopSellingProduct[]> => {
    const response = await api.get('/dashboard/top-selling-products', { params: { fecha_inicio, fecha_fin } });
    return response.data;
};

const getLowStockProducts = async (): Promise<LowStockProduct[]> => {
    const response = await api.get('/dashboard/low-stock-products');
    return response.data;
};

const getExpiringProducts = async (): Promise<ExpiringProduct[]> => {
    const response = await api.get('/dashboard/expiring-products');
    return response.data;
};


export const dashboardService = {
    getSummary,
    getSalesOverTime,
    getTopSellingProducts,
    getLowStockProducts,
    getExpiringProducts,
};
