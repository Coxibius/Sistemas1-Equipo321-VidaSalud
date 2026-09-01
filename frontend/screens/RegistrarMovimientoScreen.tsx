import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { ProductoService } from '../services/productoService';
import { TipoMovimiento } from '../types/movimiento';
import { ProductoResponse } from '../types/producto';
import { obtenerEtiquetaRol, UsuarioSesion } from '../types/usuario';

interface Props {
    usuario: UsuarioSesion;
}

export const RegistrarMovimientoScreen: React.FC<Props> = ({ usuario }) => {
    const [productos, setProductos] = useState<ProductoResponse[]>([]);
    const [productoId, setProductoId] = useState<number | null>(null);
    const [tipo, setTipo] = useState<TipoMovimiento>('ENTRADA');
    const [cantidad, setCantidad] = useState('');
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [esError, setEsError] = useState(false);
    const { width } = useWindowDimensions();
    const esMovil = width < 700;

    const cargarProductos = useCallback(async () => {
        try {
            setCargando(true);
            const resultado = await ProductoService.buscarProductos();
            setProductos(resultado);
            setProductoId((actual) => actual ?? resultado[0]?.id ?? null);
        } catch {
            setEsError(true);
            setMensaje('No fue posible cargar los productos.');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        void cargarProductos();
    }, [cargarProductos]);

    const productoSeleccionado = useMemo(
        () => productos.find((producto) => producto.id === productoId),
        [productoId, productos],
    );

    const registrar = async () => {
        const cantidadNumerica = Number(cantidad);

        if (!productoId) {
            setEsError(true);
            setMensaje('Selecciona un producto.');
            return;
        }

        if (!Number.isInteger(cantidadNumerica) || cantidadNumerica <= 0) {
            setEsError(true);
            setMensaje('La cantidad debe ser un número entero mayor a cero.');
            return;
        }

        try {
            setGuardando(true);
            setMensaje(null);
            const resultado = await ProductoService.registrarMovimiento({
                productoId,
                tipo,
                cantidad: cantidadNumerica,
                responsable: usuario.nombre,
            });

            setEsError(false);
            setMensaje(
                `${resultado.tipo} registrada correctamente. Stock actual: ${resultado.stockActual}.`,
            );
            setCantidad('');
            await cargarProductos();
        } catch (error) {
            const mensajeApi = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;
            setEsError(true);
            setMensaje(mensajeApi ?? 'No fue posible registrar el movimiento.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.page}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <ScrollView
            contentContainerStyle={[styles.container, esMovil && styles.containerMobile]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.eyebrow}>CONTROL DE STOCK</Text>
                    <Text style={styles.title}>Entradas y salidas</Text>
                    <Text style={styles.subtitle}>Registra un movimiento y actualiza las existencias.</Text>
                </View>
                <Text style={styles.userBadge}>Responsable: {usuario.nombre}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>1. Selecciona un producto</Text>
                {cargando ? (
                    <ActivityIndicator size="large" color="#0284C7" />
                ) : productos.length === 0 ? (
                    <Text style={styles.emptyText}>No hay productos registrados.</Text>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator>
                        <View style={styles.productList}>
                            {productos.map((producto) => {
                                const seleccionado = producto.id === productoId;
                                return (
                                    <TouchableOpacity
                                        key={producto.id}
                                        style={[styles.productButton, seleccionado && styles.productButtonActive]}
                                        onPress={() => setProductoId(producto.id)}
                                    >
                                        <Text style={[styles.productName, seleccionado && styles.productTextActive]}>
                                            {producto.nombre}
                                        </Text>
                                        <Text style={[styles.productStock, seleccionado && styles.productTextActive]}>
                                            Stock: {producto.cantidad}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
                )}

                <Text style={styles.sectionTitle}>2. Tipo de movimiento</Text>
                <View style={styles.typeRow}>
                    {(['ENTRADA', 'SALIDA'] as TipoMovimiento[]).map((opcion) => (
                        <TouchableOpacity
                            key={opcion}
                            style={[
                                styles.typeButton,
                                tipo === opcion &&
                                    (opcion === 'ENTRADA' ? styles.entryActive : styles.exitActive),
                            ]}
                            onPress={() => setTipo(opcion)}
                        >
                            <Text style={[styles.typeText, tipo === opcion && styles.typeTextActive]}>
                                {opcion === 'ENTRADA' ? '+ Entrada' : '− Salida'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.formRow}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Cantidad</Text>
                        <TextInput
                            style={styles.input}
                            value={cantidad}
                            onChangeText={setCantidad}
                            placeholder="Ej. 10"
                            placeholderTextColor="#94A3B8"
                            keyboardType="number-pad"
                            maxLength={8}
                        />
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.label}>Responsable</Text>
                        <View style={styles.readOnlyInput}>
                            <Text style={styles.readOnlyText}>
                                {usuario.nombre} · {obtenerEtiquetaRol(usuario.rol)}
                            </Text>
                        </View>
                    </View>
                </View>

                {productoSeleccionado && (
                    <Text style={styles.summary}>
                        {tipo === 'ENTRADA' ? 'Se añadirán' : 'Se descontarán'} {cantidad || '0'} unidades de{' '}
                        {productoSeleccionado.nombre}. Stock disponible: {productoSeleccionado.cantidad}.
                    </Text>
                )}

                {mensaje && (
                    <Text style={[styles.message, esError ? styles.errorMessage : styles.successMessage]}>
                        {mensaje}
                    </Text>
                )}

                <TouchableOpacity
                    style={[styles.submitButton, (guardando || cargando) && styles.buttonDisabled]}
                    onPress={registrar}
                    disabled={guardando || cargando}
                >
                    {guardando ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.submitText}>Registrar movimiento</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        backgroundColor: '#F8FAFC',
        padding: 32,
    },
    containerMobile: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 20,
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    eyebrow: {
        color: '#0284C7',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.2,
        marginBottom: 5,
    },
    title: {
        color: '#0F172A',
        fontSize: 28,
        fontWeight: '900',
    },
    subtitle: {
        color: '#64748B',
        fontSize: 14,
        marginTop: 5,
    },
    userBadge: {
        backgroundColor: '#E2E8F0',
        borderRadius: 20,
        color: '#334155',
        fontSize: 13,
        fontWeight: '600',
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    card: {
        width: '100%',
        maxWidth: 900,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 24,
        gap: 18,
    },
    sectionTitle: {
        color: '#0F172A',
        fontSize: 16,
        fontWeight: '800',
    },
    emptyText: {
        color: '#64748B',
        paddingVertical: 18,
    },
    productList: {
        flexDirection: 'row',
        gap: 10,
        paddingBottom: 4,
    },
    productButton: {
        minWidth: 180,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 9,
        padding: 14,
    },
    productButtonActive: {
        backgroundColor: '#0284C7',
        borderColor: '#0284C7',
    },
    productName: {
        color: '#0F172A',
        fontWeight: '800',
    },
    productStock: {
        color: '#64748B',
        fontSize: 13,
        marginTop: 4,
    },
    productTextActive: {
        color: '#FFFFFF',
    },
    typeRow: {
        flexDirection: 'row',
        gap: 10,
    },
    typeButton: {
        minWidth: 130,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignItems: 'center',
    },
    entryActive: {
        backgroundColor: '#15803D',
        borderColor: '#15803D',
    },
    exitActive: {
        backgroundColor: '#B91C1C',
        borderColor: '#B91C1C',
    },
    typeText: {
        color: '#475569',
        fontWeight: '800',
    },
    typeTextActive: {
        color: '#FFFFFF',
    },
    formRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    field: {
        flex: 1,
        minWidth: 220,
    },
    label: {
        color: '#334155',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 7,
    },
    input: {
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        color: '#0F172A',
        fontSize: 15,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    readOnlyInput: {
        minHeight: 44,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    readOnlyText: {
        color: '#475569',
        fontSize: 15,
        fontWeight: '700',
    },
    summary: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        color: '#475569',
        fontSize: 14,
        padding: 13,
    },
    message: {
        borderRadius: 8,
        fontSize: 14,
        fontWeight: '700',
        padding: 13,
    },
    successMessage: {
        backgroundColor: '#DCFCE7',
        color: '#166534',
    },
    errorMessage: {
        backgroundColor: '#FEE2E2',
        color: '#B91C1C',
    },
    submitButton: {
        alignSelf: 'flex-start',
        minWidth: 220,
        backgroundColor: '#0F172A',
        borderRadius: 8,
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingVertical: 13,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    submitText: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
});
