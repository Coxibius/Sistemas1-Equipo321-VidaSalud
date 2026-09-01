import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { ProductoService } from '../services/productoService';
import { ProductoResponse } from '../types/producto';
import { obtenerEtiquetaRol, UsuarioSesion } from '../types/usuario';

interface Props {
    alRegistrarProducto: () => void;
    usuario: UsuarioSesion;
}

export const ConsultarProductosScreen: React.FC<Props> = ({ alRegistrarProducto, usuario }) => {
    const [criterio, setCriterio] = useState('');
    const [productos, setProductos] = useState<ProductoResponse[]>([]);
    const [cargando, setCargando] = useState(true);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const { width } = useWindowDimensions();
    const esMovil = width < 700;

    const consultarProductos = useCallback(async (texto?: string) => {
        try {
            setCargando(true);
            setMensajeError(null);
            const resultado = await ProductoService.buscarProductos(texto);
            setProductos(resultado);
        } catch {
            setProductos([]);
            setMensajeError('No fue posible consultar el inventario. Verifica que la API esté disponible.');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        void consultarProductos();
    }, [consultarProductos]);

    const manejarBusqueda = () => {
        void consultarProductos(criterio);
    };

    const limpiarBusqueda = () => {
        setCriterio('');
        void consultarProductos();
    };

    return (
        <ScrollView
            contentContainerStyle={[styles.container, esMovil && styles.containerMobile]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
        >
            <View style={styles.topHeader}>
                <View>
                    <Text style={styles.eyebrow}>INVENTARIO FARMACÉUTICO</Text>
                    <Text style={styles.title}>Productos</Text>
                    <Text style={styles.subtitle}>Consulta existencias, precios y próximos vencimientos.</Text>
                </View>
                <Text style={styles.userBadge}>
                    Usuario: {usuario.nombre} ({obtenerEtiquetaRol(usuario.rol)})
                </Text>
            </View>

            <View style={styles.toolbar}>
                <View style={styles.searchGroup}>
                    <TextInput
                        accessibilityLabel="Buscar producto por nombre"
                        style={styles.searchInput}
                        placeholder="Buscar producto por nombre"
                        placeholderTextColor="#94A3B8"
                        value={criterio}
                        onChangeText={setCriterio}
                        onSubmitEditing={manejarBusqueda}
                        returnKeyType="search"
                        maxLength={100}
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={manejarBusqueda} disabled={cargando}>
                        <Text style={styles.searchButtonText}>Buscar</Text>
                    </TouchableOpacity>
                    {criterio.length > 0 && (
                        <TouchableOpacity style={styles.clearButton} onPress={limpiarBusqueda} disabled={cargando}>
                            <Text style={styles.clearButtonText}>Limpiar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity style={styles.registerButton} onPress={alRegistrarProducto}>
                    <Text style={styles.registerButtonText}>+ Registrar producto</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Listado de productos</Text>
                    {!cargando && !mensajeError && (
                        <Text style={styles.resultCount}>
                            {productos.length} {productos.length === 1 ? 'resultado' : 'resultados'}
                        </Text>
                    )}
                </View>

                {cargando ? (
                    <View style={styles.feedbackContainer}>
                        <ActivityIndicator size="large" color="#0284C7" />
                        <Text style={styles.feedbackText}>Consultando inventario...</Text>
                    </View>
                ) : mensajeError ? (
                    <View style={styles.feedbackContainer}>
                        <Text style={styles.errorText}>{mensajeError}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => consultarProductos(criterio)}>
                            <Text style={styles.retryButtonText}>Reintentar</Text>
                        </TouchableOpacity>
                    </View>
                ) : productos.length === 0 ? (
                    <View style={styles.feedbackContainer}>
                        <Text style={styles.emptyTitle}>Sin resultados encontrados</Text>
                        <Text style={styles.feedbackText}>Prueba con otro nombre o limpia la búsqueda.</Text>
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.headerCell, styles.nameCell]}>Nombre</Text>
                                <Text style={[styles.headerCell, styles.categoryCell]}>Categoría</Text>
                                <Text style={[styles.headerCell, styles.stockCell]}>Stock</Text>
                                <Text style={[styles.headerCell, styles.priceCell]}>Precio</Text>
                                <Text style={[styles.headerCell, styles.dateCell]}>Vence</Text>
                            </View>

                            {productos.map((producto) => {
                                const sinStock = producto.cantidad === 0;

                                return (
                                    <View key={producto.id} style={styles.tableRow}>
                                        <Text style={[styles.bodyCell, styles.nameCell, styles.productName]}>
                                            {producto.nombre}
                                        </Text>
                                        <Text style={[styles.bodyCell, styles.categoryCell]}>{producto.categoria}</Text>
                                        <View style={[styles.bodyCellContainer, styles.stockCell]}>
                                            {sinStock ? (
                                                <Text style={styles.outOfStockBadge}>Sin stock</Text>
                                            ) : (
                                                <Text style={styles.stockValue}>{producto.cantidad}</Text>
                                            )}
                                        </View>
                                        <Text style={[styles.bodyCell, styles.priceCell]}>Bs {producto.precio.toFixed(2)}</Text>
                                        <Text style={[styles.bodyCell, styles.dateCell]}>
                                            {producto.fechaVencimiento || '—'}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#F8FAFC',
        padding: 32,
    },
    containerMobile: {
        padding: 16,
    },
    topHeader: {
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
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 18,
    },
    searchGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 300,
        maxWidth: 650,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        minWidth: 180,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        color: '#0F172A',
        fontSize: 15,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    searchButton: {
        backgroundColor: '#0284C7',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    clearButton: {
        backgroundColor: '#E2E8F0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    clearButtonText: {
        color: '#475569',
        fontWeight: '700',
    },
    registerButton: {
        backgroundColor: '#0F172A',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    cardTitle: {
        color: '#0F172A',
        fontSize: 17,
        fontWeight: '800',
    },
    resultCount: {
        color: '#64748B',
        fontSize: 13,
        fontWeight: '600',
    },
    feedbackContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 260,
        padding: 28,
    },
    feedbackText: {
        color: '#64748B',
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
    },
    emptyTitle: {
        color: '#0F172A',
        fontSize: 18,
        fontWeight: '800',
    },
    errorText: {
        color: '#B91C1C',
        fontSize: 14,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#E0F2FE',
        borderRadius: 8,
        marginTop: 14,
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    retryButtonText: {
        color: '#0369A1',
        fontWeight: '700',
    },
    table: {
        minWidth: 850,
        width: '100%',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 62,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingHorizontal: 20,
    },
    tableHeader: {
        minHeight: 48,
        backgroundColor: '#F8FAFC',
    },
    headerCell: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    bodyCell: {
        color: '#475569',
        fontSize: 14,
        paddingRight: 12,
    },
    bodyCellContainer: {
        justifyContent: 'center',
        paddingRight: 12,
    },
    productName: {
        color: '#0F172A',
        fontWeight: '700',
    },
    nameCell: {
        width: 240,
    },
    categoryCell: {
        width: 210,
    },
    stockCell: {
        width: 130,
    },
    priceCell: {
        width: 130,
    },
    dateCell: {
        width: 140,
    },
    stockValue: {
        color: '#166534',
        fontWeight: '800',
    },
    outOfStockBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#FEE2E2',
        borderRadius: 999,
        color: '#B91C1C',
        fontSize: 12,
        fontWeight: '800',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
});
