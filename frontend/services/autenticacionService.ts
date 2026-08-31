import { api } from './api';
import { UsuarioSesion } from '../types/usuario';

export const AutenticacionService = {
    async iniciarSesion(usuario: string, contrasena: string): Promise<UsuarioSesion> {
        const response = await api.post<UsuarioSesion>('/auth/login', {
            usuario: usuario.trim(),
            contrasena,
        });
        return response.data;
    },
};
