import { api } from './api';
import { ActualizarUsuario, CrearUsuario, UsuarioSesion } from '../types/usuario';

export const UsuarioService = {
    async listar(): Promise<UsuarioSesion[]> {
        const response = await api.get<UsuarioSesion[]>('/usuarios');
        return response.data;
    },

    async crear(datos: CrearUsuario): Promise<UsuarioSesion> {
        const response = await api.post<UsuarioSesion>('/usuarios', datos);
        return response.data;
    },

    async actualizar(id: number, datos: ActualizarUsuario): Promise<UsuarioSesion> {
        const response = await api.put<UsuarioSesion>(`/usuarios/${id}`, datos);
        return response.data;
    },

    async eliminar(id: number): Promise<void> {
        await api.delete(`/usuarios/${id}`);
    },
};
