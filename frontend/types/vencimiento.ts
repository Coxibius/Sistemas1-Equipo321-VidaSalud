export type EstadoVencimiento = 'PROXIMO_A_VENCER' | 'VENCIDO';

export interface AlertaVencimiento {
    loteId: number;
    productoId: number;
    producto: string;
    cantidad: number;
    fechaVencimiento: string;
    diasRestantes: number;
    estadoVencimiento: EstadoVencimiento;
    mensaje: string;
}
