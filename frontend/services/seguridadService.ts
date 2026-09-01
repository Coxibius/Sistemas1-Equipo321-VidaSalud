import { api } from './api';
import { EstadoSolicitudBaja, LogAuditoria, SolicitudBaja } from '../types/seguridad';

export const SeguridadService = {
    async solicitarBaja(usuarioId: number, motivo?: string): Promise<SolicitudBaja> {
        const response = await api.post<SolicitudBaja>('/solicitudes-baja', {
            usuarioId,
            motivo,
        });
        return response.data;
    },

    async listarSolicitudes(): Promise<SolicitudBaja[]> {
        const response = await api.get<SolicitudBaja[]>('/solicitudes-baja');
        return response.data;
    },

    async resolverSolicitud(
        id: number,
        estado: Exclude<EstadoSolicitudBaja, 'PENDIENTE'>,
        resueltaPor: string,
    ): Promise<SolicitudBaja> {
        const response = await api.put<SolicitudBaja>(`/solicitudes-baja/${id}/resolver`, {
            estado,
            resueltaPor,
        });
        return response.data;
    },

    async listarAuditoria(limite = 100): Promise<LogAuditoria[]> {
        const response = await api.get<LogAuditoria[]>('/auditoria', {
            params: { limite },
        });
        return response.data;
    },
};
