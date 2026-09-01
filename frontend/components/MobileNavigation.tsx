import React, { useEffect, useMemo, useState } from 'react';
import {
    Keyboard,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { obtenerEtiquetaRol, UsuarioSesion } from '../types/usuario';

interface Props {
    pantallaActual: string;
    alSeleccionar: (pantalla: string) => void;
    usuario: UsuarioSesion;
    alCerrarSesion: () => void;
    alVerPerfil: () => void;
}

const crearOpciones = (usuario: UsuarioSesion) => [
    { id: 'dashboard', icono: '▦', etiqueta: 'Inicio' },
    { id: 'productos', icono: '✚', etiqueta: 'Productos' },
    { id: 'inventario', icono: '↕', etiqueta: 'Stock' },
    { id: 'vencimientos', icono: '◷', etiqueta: 'Alertas' },
    ...(usuario.rol === 'ADMINISTRADOR'
        ? [{ id: 'usuarios', icono: '◉', etiqueta: 'Usuarios' }]
        : []),
];

export const MobileHeader: React.FC<Pick<Props, 'usuario' | 'alCerrarSesion' | 'alVerPerfil'>> = ({
    usuario,
    alCerrarSesion,
    alVerPerfil,
}) => (
    <View style={styles.header}>
        <TouchableOpacity style={styles.profileButton} onPress={alVerPerfil}>
            <Text style={styles.brand}>FARMACIA VIDASALUD</Text>
            <Text style={styles.userText} numberOfLines={1}>
                {usuario.nombre} · {obtenerEtiquetaRol(usuario.rol)}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            style={styles.logoutButton}
            onPress={alCerrarSesion}
        >
            <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
    </View>
);

export const MobileNavigation: React.FC<Props> = ({
    pantallaActual,
    alSeleccionar,
    usuario,
}) => {
    const [tecladoVisible, setTecladoVisible] = useState(false);
    const opciones = useMemo(() => crearOpciones(usuario), [usuario]);

    useEffect(() => {
        const mostrar = Keyboard.addListener('keyboardDidShow', () => setTecladoVisible(true));
        const ocultar = Keyboard.addListener('keyboardDidHide', () => setTecladoVisible(false));

        return () => {
            mostrar.remove();
            ocultar.remove();
        };
    }, []);

    if (tecladoVisible) {
        return null;
    }

    return (
        <SafeAreaView edges={['bottom']} style={styles.safeBottom}>
            <View style={styles.navigationBar}>
                {opciones.map((opcion) => {
                    const activa = pantallaActual === opcion.id;
                    return (
                        <TouchableOpacity
                            key={opcion.id}
                            accessibilityRole="button"
                            accessibilityLabel={opcion.etiqueta}
                            accessibilityState={{ selected: activa }}
                            style={[styles.navigationItem, activa && styles.navigationItemActive]}
                            onPress={() => alSeleccionar(opcion.id)}
                        >
                            <Text style={[styles.navigationIcon, activa && styles.navigationTextActive]}>
                                {opcion.icono}
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={[styles.navigationLabel, activa && styles.navigationTextActive]}
                            >
                                {opcion.etiqueta}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        minHeight: 58,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0F172A',
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
        paddingHorizontal: 16,
        paddingVertical: 9,
    },
    brand: {
        color: '#38BDF8',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    userText: {
        maxWidth: 250,
        color: '#CBD5E1',
        fontSize: 11,
        marginTop: 2,
    },
    profileButton: {
        flex: 1,
        minWidth: 0,
        marginRight: 10,
    },
    logoutButton: {
        minWidth: 58,
        minHeight: 38,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    logoutText: {
        color: '#FCA5A5',
        fontSize: 12,
        fontWeight: '800',
    },
    safeBottom: {
        backgroundColor: '#0F172A',
    },
    navigationBar: {
        minHeight: 62,
        flexDirection: 'row',
        alignItems: 'stretch',
        backgroundColor: '#0F172A',
        borderTopWidth: 1,
        borderTopColor: '#334155',
        paddingHorizontal: 4,
        paddingTop: 4,
    },
    navigationItem: {
        flex: 1,
        minWidth: 0,
        minHeight: 56,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingHorizontal: 2,
    },
    navigationItemActive: {
        backgroundColor: '#0369A1',
    },
    navigationIcon: {
        color: '#94A3B8',
        fontSize: 19,
        lineHeight: 21,
        fontWeight: '800',
    },
    navigationLabel: {
        color: '#94A3B8',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
    },
    navigationTextActive: {
        color: '#FFFFFF',
    },
});
