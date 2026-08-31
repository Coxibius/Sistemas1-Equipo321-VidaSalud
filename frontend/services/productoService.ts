import { api } from './api';
import { Producto, ProductoResponse } from '../types/producto';
import { MovimientoInventario, MovimientoResponse } from '../types/movimiento';
import { AlertaVencimiento } from '../types/vencimiento';

export const ProductoService = {
    // HU01: Registrar Producto
    registrarProducto: async (datos: Producto): Promise<ProductoResponse> => {
        const response = await api.post<ProductoResponse>('/productos', datos);
        return response.data;
    },

    // HU02: Consultar y Buscar Productos
    buscarProductos: async (criterio?: string): Promise<ProductoResponse[]> => {
        const response = await api.get<ProductoResponse[]>('/productos', {
            params: { search: criterio?.trim() || undefined },
        });
        return response.data;
    },

    // HU03: Registrar Movimiento
    registrarMovimiento: async (movimiento: MovimientoInventario): Promise<MovimientoResponse> => {
        const response = await api.post<MovimientoResponse>('/movimientos', movimiento);
        return response.data;
    },

    // HU04: Controlar Vencimientos
    obtenerAlertasVencimiento: async (): Promise<AlertaVencimiento[]> => {
        const response = await api.get<AlertaVencimiento[]>('/vencimientos/alertas');
        return response.data;
    },
};
