export type EstadoSolicitudBaja = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface SolicitudBaja {
    id: number;
    usuarioId?: number;
    nombre: string;
    usuario: string;
    motivo?: string;
    estado: EstadoSolicitudBaja;
    fechaSolicitud: string;
    fechaResolucion?: string;
    resueltaPor?: string;
}

export interface LogAuditoria {
    id: number;
    actor: string;
    accion: string;
    entidad: string;
    entidadId?: number;
    fechaUtc: string;
    resultado: 'EXITOSO' | 'FALLIDO' | 'RECHAZADO';
    detalle?: string;
}
