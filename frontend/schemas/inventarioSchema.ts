import { z } from 'zod';

// Validaciones HU01: Registrar Producto
export const registrarProductoSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio y no puede estar vacío'),
    categoria: z.string().min(1, 'La categoría es obligatoria'),
    precio: z.number({ invalid_type_error: 'El precio debe ser un número' }).min(0, 'El precio no puede ser negativo'),
    cantidad: z.number({ invalid_type_error: 'La cantidad debe ser un número' }).int().min(0, 'La cantidad no puede ser negativa'),
    fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es obligatoria'),
});

export type RegistrarProductoForm = z.infer<typeof registrarProductoSchema>;

// Validaciones HU03: Movimientos de Inventario
export const registrarMovimientoSchema = z.object({
    productoId: z.number().int().positive('Debe seleccionar un producto válido'),
    tipo: z.enum(['ENTRADA', 'SALIDA']),
    cantidad: z.number({ invalid_type_error: 'Debe ingresar una cantidad' }).int().positive('La cantidad debe ser mayor a 0'),
});

export type RegistrarMovimientoForm = z.infer<typeof registrarMovimientoSchema>;