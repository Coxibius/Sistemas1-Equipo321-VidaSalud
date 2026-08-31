export type TipoMovimiento = 'ENTRADA' | 'SALIDA';
export type EstadoMovimiento = 'PENDIENTE' | 'VALIDADO' | 'RECHAZADO' | 'REGISTRADO';

export interface MovimientoInventario {
    id?: number;
    productoId: number;
    tipo: TipoMovimiento;
    cantidad: number;
    responsable: string;
    fecha?: string;
    estado?: EstadoMovimiento;
}

export interface MovimientoResponse extends MovimientoInventario {
    id: number;
    producto: string;
    fecha: string;
    estado: EstadoMovimiento;
    stockActual: number;
}
