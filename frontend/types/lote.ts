export interface Lote {
    id?: number;
    producto_id: number;
    codigo_lote: string;
    fecha_vencimiento: string;
    cantidad: number;
    estado?: 'REGISTRADO' | 'DISPONIBLE' | 'PROXIMO_A_VENCER' | 'VENCIDO';
}