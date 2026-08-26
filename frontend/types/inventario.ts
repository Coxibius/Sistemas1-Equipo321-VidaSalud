export interface InventarioFiltro {
    criterio?: string;
}

export interface InventarioItem {
    id: number;
    nombre: string;
    categoria: string;
    precio: number;
    stockActual: number;
    fechaVencimiento: string;
    estadoVencimiento: 'VIGENTE' | 'PROXIMO_A_VENCER' | 'VENCIDO';
}