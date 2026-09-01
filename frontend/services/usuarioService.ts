import { api } from './api';
import {
    ActualizarPerfil,
    ActualizarUsuario,
    CrearUsuario,
    UsuarioSesion,
} from '../types/usuario';

export const UsuarioService = {
    async listar(): Promise<UsuarioSesion[]> {
        const response = await api.get<UsuarioSesion[]>('/usuarios');
        return response.data;
    },

    async obtener(id: number): Promise<UsuarioSesion> {
        const response = await api.get<UsuarioSesion>(`/usuarios/${id}`);
        return response.data;
    },

    async crear(datos: CrearUsuario, actor: string): Promise<UsuarioSesion> {
        const response = await api.post<UsuarioSesion>('/usuarios', datos, {
            headers: { 'X-Actor': actor },
        });
        return response.data;
    },

    async actualizar(id: number, datos: ActualizarUsuario, actor: string): Promise<UsuarioSesion> {
        const response = await api.put<UsuarioSesion>(`/usuarios/${id}`, datos, {
            headers: { 'X-Actor': actor },
        });
        return response.data;
    },

    async actualizarPerfil(
        id: number,
        datos: ActualizarPerfil,
        actor: string,
    ): Promise<UsuarioSesion> {
        const response = await api.put<UsuarioSesion>(`/usuarios/${id}/perfil`, datos, {
            headers: { 'X-Actor': actor },
        });
        return response.data;
    },

    async eliminar(id: number, actor: string): Promise<void> {
        await api.delete(`/usuarios/${id}`, {
            headers: { 'X-Actor': actor },
        });
    },
};
