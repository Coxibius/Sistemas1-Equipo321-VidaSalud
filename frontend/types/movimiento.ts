export type TipoMovimiento = 'ENTRADA' | 'SALIDA';
export type EstadoMovimiento = 'PENDIENTE' | 'VALIDADO' | 'RECHAZADO' | 'REGISTRADO';

export interface MovimientoInventario {
    id?: number;
    productoId: number;
    tipo: TipoMovimiento;
    cantidad: number;
    fecha?: string;
    estado?: EstadoMovimiento;
}