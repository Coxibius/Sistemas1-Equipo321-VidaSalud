import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { obtenerEtiquetaRol, UsuarioSesion } from '../types/usuario';

interface SidebarProps {
    pantallaActual: string;
    alSeleccionar: (pantalla: string) => void;
    usuario: UsuarioSesion;
    alCerrarSesion: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    pantallaActual,
    alSeleccionar,
    usuario,
    alCerrarSesion,
}) => {
    const menuItems = [
        { id: 'dashboard', label: '📊 Dashboard' },
        { id: 'productos', label: '💊 Productos' },
        { id: 'inventario', label: '📦 Inventario' },
        { id: 'vencimientos', label: '⏰ Vencimientos' },
        ...(usuario.rol === 'ADMINISTRADOR'
            ? [{ id: 'usuarios', label: '👥 Usuarios' }]
            : []),
    ];

    return (
        <View style={styles.sidebar}>
            {/* Título / Marca */}
            <View style={styles.brandContainer}>
                <Text style={styles.brandText}>FARMACIA</Text>
                <Text style={styles.brandSubText}>VIDASALUD</Text>
            </View>

            {/* Opciones del menú */}
            <View style={styles.menuContainer}>
                {menuItems.map((item) => {
                    const activo = pantallaActual === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, activo && styles.menuItemActivo]}
                            onPress={() => alSeleccionar(item.id)}
                        >
                            <Text style={[styles.menuText, activo && styles.menuTextActivo]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View>
                <View style={styles.userCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{usuario.nombre.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>{usuario.nombre}</Text>
                        <Text style={styles.userRole}>{obtenerEtiquetaRol(usuario.rol)}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={alCerrarSesion}>
                    <Text style={styles.logoutText}>🚪 Cerrar sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        width: 220,
        backgroundColor: '#0F172A', // Azul noche elegante
        paddingVertical: 24,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    brandContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    brandText: {
        color: '#38BDF8', // Celeste tecnológico
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    brandSubText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '900',
    },
    menuContainer: {
        flex: 1,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    menuItemActivo: {
        backgroundColor: '#0284C7', // Azul brillante cuando está seleccionado
    },
    menuText: {
        color: '#94A3B8',
        fontSize: 15,
        fontWeight: '500',
    },
    menuTextActivo: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    logoutButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    logoutText: {
        color: '#F87171', // Rojo suave
        fontSize: 14,
        fontWeight: '600',
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#334155',
        paddingHorizontal: 10,
        paddingVertical: 14,
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#0284C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 9,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '900',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
    },
    userRole: {
        color: '#94A3B8',
        fontSize: 11,
        marginTop: 2,
    },
});
