import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SidebarProps {
    pantallaActual: string;
    alSeleccionar: (pantalla: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ pantallaActual, alSeleccionar }) => {
    const menuItems = [
        { id: 'dashboard', label: '📊 Dashboard' },
        { id: 'productos', label: '💊 Productos' },
        { id: 'inventario', label: '📦 Inventario' },
        { id: 'vencimientos', label: '⏰ Vencimientos' },
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

            {/* Botón Cerrar Sesión al final */}
            <TouchableOpacity style={styles.logoutButton} onPress={() => alert('Cerrando sesión...')}>
                <Text style={styles.logoutText}>🚪 Cerrar sesión</Text>
            </TouchableOpacity>
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
});