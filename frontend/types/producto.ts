export interface Producto {
    id?: number;
    nombre: string;
    categoria: string;
    precio: number;
    cantidad: number;
    fechaVencimiento: string;
}

export interface ProductoResponse extends Producto {
    id: number;
    creadoEn?: string;
    loteId: number;
    estadoVencimiento: string;
}
