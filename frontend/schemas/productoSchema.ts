import { z } from 'zod';

export const registrarProductoSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio y no puede estar vacío'),
    categoria: z.string().min(1, 'La categoría es obligatoria'),
    precio: z.number({ error: 'Debe ser un número' }).min(0, 'El precio debe ser mayor o igual a 0'),
    cantidad: z.number().int().min(0, 'La cantidad debe ser un entero mayor o igual a 0'),
    fecha_vencimiento: z.string().min(1, 'La fecha de vencimiento es requerida'),
    lote: z.string().min(1, 'El código de lote es obligatorio'),
});

export type RegistrarProductoFormData = z.infer<typeof registrarProductoSchema>;

export const registrarLoteSchema = z.object({
    producto_id: z.number().int().positive('Debe seleccionar un producto válido'),
    codigo_lote: z.string().min(1, 'El código de lote es obligatorio'),
    fecha_vencimiento: z.string().min(1, 'La fecha de vencimiento es obligatoria'),
    cantidad: z.number().int().min(0, 'La cantidad debe ser mayor o igual a 0'),
});

export type RegistrarLoteFormData = z.infer<typeof registrarLoteSchema>;
