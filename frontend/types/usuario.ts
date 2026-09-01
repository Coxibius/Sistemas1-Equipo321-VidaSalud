export type RolUsuario = 'ADMINISTRADOR' | 'ENCARGADO' | 'AUXILIAR';

export interface UsuarioSesion {
    id: number;
    usuario: string;
    nombre: string;
    email?: string;
    rol: RolUsuario;
    fechaRegistro: string;
    activo: boolean;
}

export interface CrearUsuario {
    nombre: string;
    usuario: string;
    email?: string;
    rol: Exclude<RolUsuario, 'ADMINISTRADOR'>;
    contrasena: string;
}

export interface ActualizarUsuario {
    nombre: string;
    usuario: string;
    email?: string;
    rol: RolUsuario;
    contrasena?: string;
}

export interface ActualizarPerfil {
    nombre: string;
    email?: string;
}

export const obtenerEtiquetaRol = (rol: RolUsuario): string => ({
    ADMINISTRADOR: 'Administrador',
    ENCARGADO: 'Encargado',
    AUXILIAR: 'Auxiliar',
})[rol];
