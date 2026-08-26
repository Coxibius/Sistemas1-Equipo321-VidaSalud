import { api } from './api';
import { Producto, ProductoResponse } from '../types/producto';
import { MovimientoInventario } from '../types/movimiento';
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
            params: { criterio },
        });
        return response.data;
    },

    // HU03: Registrar Movimiento
    registrarMovimiento: async (movimiento: MovimientoInventario) => {
        const response = await api.post('/movimientos', movimiento);
        return response.data;
    },

    // HU04: Controlar Vencimientos
    obtenerAlertasVencimiento: async (): Promise<AlertaVencimiento[]> => {
        const response = await api.get<AlertaVencimiento[]>('/vencimientos/alertas');
        return response.data;
    },
};