import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { ProductoService } from '../services/productoService';
import { ProductoResponse } from '../types/producto';
import { obtenerEtiquetaRol, UsuarioSesion } from '../types/usuario';
import { AlertaVencimiento } from '../types/vencimiento';

interface Props {
    usuario: UsuarioSesion;
    alSeleccionar: (pantalla: string) => void;
}

export const DashboardScreen: React.FC<Props> = ({ usuario, alSeleccionar }) => {
    const [productos, setProductos] = useState<ProductoResponse[]>([]);
    const [alertas, setAlertas] = useState<AlertaVencimiento[]>([]);
    const [cargando, setCargando] = useState(true);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const { width } = useWindowDimensions();
    const esMovil = width < 700;

    const cargarDashboard = useCallback(async () => {
        try {
            setCargando(true);
            setMensajeError(null);
            const [productosRegistrados, alertasRegistradas] = await Promise.all([
                ProductoService.buscarProductos(),
                ProductoService.obtenerAlertasVencimiento(),
            ]);
            setProductos(productosRegistrados);
            setAlertas(alertasRegistradas);
        } catch {
            setProductos([]);
            setAlertas([]);
            setMensajeError('No fue posible cargar el resumen. Verifica que la API esté disponible.');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        void cargarDashboard();
    }, [cargarDashboard]);

    const resumen = useMemo(() => {
        const totalUnidades = productos.reduce((total, producto) => total + producto.cantidad, 0);
        const stockBajo = productos.filter(
            (producto) => producto.cantidad > 0 && producto.cantidad <= 20,
        ).length;
        const vencidos = alertas.filter(
            (alerta) => alerta.estadoVencimiento === 'VENCIDO',
        ).length;
        const proximos = alertas.filter(
            (alerta) => alerta.estadoVencimiento === 'PROXIMO_A_VENCER',
        ).length;

        return { totalUnidades, stockBajo, vencidos, proximos };
    }, [alertas, productos]);

    const productosDestacados = useMemo(
        () => [...productos]
            .sort((productoA, productoB) => productoA.cantidad - productoB.cantidad)
            .slice(0, 5),
        [productos],
    );

    return (
        <ScrollView contentContainerStyle={[styles.container, esMovil && styles.containerMobile]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.eyebrow}>RESUMEN DEL INVENTARIO</Text>
                    <Text style={styles.title}>Hola, {usuario.nombre.split(' ')[0]}</Text>
                    <Text style={styles.subtitle}>
                        Vista general para el rol {obtenerEtiquetaRol(usuario.rol).toLowerCase()}.
                    </Text>
                </View>
                <TouchableOpacity style={styles.refreshButton} onPress={cargarDashboard} disabled={cargando}>
                    <Text style={styles.refreshText}>Actualizar datos</Text>
                </TouchableOpacity>
            </View>

            {cargando ? (
                <View style={styles.feedback}>
                    <ActivityIndicator size="large" color="#0284C7" />
                    <Text style={styles.feedbackText}>Preparando el dashboard...</Text>
                </View>
            ) : mensajeError ? (
                <View style={[styles.feedback, styles.errorPanel]}>
                    <Text style={styles.errorTitle}>No pudimos obtener los datos</Text>
                    <Text style={styles.feedbackText}>{mensajeError}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={cargarDashboard}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View style={styles.metricsGrid}>
                        <MetricCard
                            icono="💊"
                            etiqueta="Productos registrados"
                            valor={productos.length.toLocaleString('es-BO')}
                            color="#0284C7"
                            fondo="#E0F2FE"
                        />
                        <MetricCard
                            icono="📦"
                            etiqueta="Unidades en inventario"
                            valor={resumen.totalUnidades.toLocaleString('es-BO')}
                            color="#15803D"
                            fondo="#DCFCE7"
                        />
                        <MetricCard
                            icono="📉"
                            etiqueta="Productos con stock bajo"
                            valor={resumen.stockBajo.toLocaleString('es-BO')}
                            color="#B45309"
                            fondo="#FEF3C7"
                        />
                        <MetricCard
                            icono="⏰"
                            etiqueta="Alertas de vencimiento"
                            valor={alertas.length.toLocaleString('es-BO')}
                            detalle={`${resumen.proximos} próximos · ${resumen.vencidos} vencidos`}
                            color="#B91C1C"
                            fondo="#FEE2E2"
                        />
                    </View>

                    <View style={styles.contentGrid}>
                        <View style={[styles.panel, styles.alertPanel, esMovil && styles.panelMobile]}>
                            <View style={styles.panelHeader}>
                                <View>
                                    <Text style={styles.panelTitle}>Vencimientos que requieren atención</Text>
                                    <Text style={styles.panelSubtitle}>Ordenados por la fecha más próxima.</Text>
                                </View>
                                <TouchableOpacity onPress={() => alSeleccionar('vencimientos')}>
                                    <Text style={styles.linkText}>Ver todas</Text>
                                </TouchableOpacity>
                            </View>

                            {alertas.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyTitle}>Todo en orden</Text>
                                    <Text style={styles.panelSubtitle}>No hay lotes vencidos ni próximos a vencer.</Text>
                                </View>
                            ) : (
                                alertas.slice(0, 5).map((alerta) => {
                                    const vencido = alerta.estadoVencimiento === 'VENCIDO';
                                    return (
                                        <View key={alerta.loteId} style={styles.alertRow}>
                                            <View style={[styles.alertDot, vencido ? styles.expiredDot : styles.warningDot]} />
                                            <View style={styles.alertInfo}>
                                                <Text style={styles.itemName}>{alerta.producto}</Text>
                                                <Text style={styles.itemMeta}>
                                                    Lote #{alerta.loteId} · {alerta.cantidad} unidades · {alerta.fechaVencimiento}
                                                </Text>
                                            </View>
                                            <Text style={[styles.statusBadge, vencido ? styles.expiredBadge : styles.warningBadge]}>
                                                {vencido ? 'Vencido' : `${alerta.diasRestantes} días`}
                                            </Text>
                                        </View>
                                    );
                                })
                            )}
                        </View>

                        <View style={[styles.panel, styles.stockPanel, esMovil && styles.panelMobile]}>
                            <View style={styles.panelHeader}>
                                <View>
                                    <Text style={styles.panelTitle}>Stock más bajo</Text>
                                    <Text style={styles.panelSubtitle}>Productos que conviene revisar primero.</Text>
                                </View>
                                <TouchableOpacity onPress={() => alSeleccionar('productos')}>
                                    <Text style={styles.linkText}>Ver productos</Text>
                                </TouchableOpacity>
                            </View>

                            {productosDestacados.map((producto) => (
                                <View key={producto.id} style={styles.stockRow}>
                                    <View style={styles.stockInfo}>
                                        <Text style={styles.itemName}>{producto.nombre}</Text>
                                        <Text style={styles.itemMeta}>{producto.categoria}</Text>
                                    </View>
                                    <Text style={[
                                        styles.stockBadge,
                                        producto.cantidad <= 20 ? styles.lowStockBadge : styles.okStockBadge,
                                    ]}>
                                        {producto.cantidad} unidades
                                    </Text>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={styles.movementButton}
                                onPress={() => alSeleccionar('inventario')}
                            >
                                <Text style={styles.movementButtonText}>Registrar entrada o salida</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </ScrollView>
    );
};

interface MetricCardProps {
    icono: string;
    etiqueta: string;
    valor: string;
    detalle?: string;
    color: string;
    fondo: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icono, etiqueta, valor, detalle, color, fondo }) => (
    <View style={styles.metricCard}>
        <View style={[styles.metricIcon, { backgroundColor: fondo }]}>
            <Text style={styles.metricIconText}>{icono}</Text>
        </View>
        <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>{etiqueta}</Text>
            <Text style={[styles.metricValue, { color }]}>{valor}</Text>
            {detalle && <Text style={styles.metricDetail}>{detalle}</Text>}
        </View>
    </View>
);

const styles = StyleSheet.create({
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
        flexWrap: 'wrap',
        gap: 18,
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
    refreshButton: {
        backgroundColor: '#0F172A',
        borderRadius: 8,
        paddingHorizontal: 18,
        paddingVertical: 11,
    },
    refreshText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    feedback: {
        minHeight: 360,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 28,
    },
    feedbackText: {
        color: '#64748B',
        marginTop: 10,
        textAlign: 'center',
    },
    errorPanel: {
        borderColor: '#FECACA',
    },
    errorTitle: {
        color: '#B91C1C',
        fontSize: 18,
        fontWeight: '800',
    },
    retryButton: {
        backgroundColor: '#E0F2FE',
        borderRadius: 8,
        marginTop: 14,
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    retryText: {
        color: '#0369A1',
        fontWeight: '700',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 18,
    },
    metricCard: {
        flexGrow: 1,
        flexBasis: 230,
        minWidth: 220,
        minHeight: 126,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 18,
    },
    metricIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    metricIconText: {
        fontSize: 22,
    },
    metricContent: {
        flex: 1,
    },
    metricLabel: {
        color: '#64748B',
        fontSize: 12,
        fontWeight: '700',
    },
    metricValue: {
        fontSize: 27,
        fontWeight: '900',
        marginTop: 3,
    },
    metricDetail: {
        color: '#64748B',
        fontSize: 11,
        marginTop: 2,
    },
    contentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: 18,
    },
    panel: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 20,
    },
    alertPanel: {
        flexGrow: 2,
        flexBasis: 590,
        minWidth: 330,
    },
    stockPanel: {
        flexGrow: 1,
        flexBasis: 340,
        minWidth: 300,
    },
    panelMobile: {
        flexBasis: '100%',
        minWidth: 0,
        width: '100%',
    },
    panelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 14,
        marginBottom: 12,
    },
    panelTitle: {
        color: '#0F172A',
        fontSize: 17,
        fontWeight: '800',
    },
    panelSubtitle: {
        color: '#64748B',
        fontSize: 12,
        marginTop: 3,
    },
    linkText: {
        color: '#0284C7',
        fontSize: 12,
        fontWeight: '800',
    },
    alertRow: {
        minHeight: 65,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingVertical: 10,
    },
    alertDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        marginRight: 12,
    },
    expiredDot: {
        backgroundColor: '#DC2626',
    },
    warningDot: {
        backgroundColor: '#F59E0B',
    },
    alertInfo: {
        flex: 1,
        paddingRight: 10,
    },
    itemName: {
        color: '#0F172A',
        fontSize: 13,
        fontWeight: '800',
    },
    itemMeta: {
        color: '#64748B',
        fontSize: 11,
        marginTop: 3,
    },
    statusBadge: {
        borderRadius: 999,
        fontSize: 11,
        fontWeight: '800',
        overflow: 'hidden',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    expiredBadge: {
        backgroundColor: '#FEE2E2',
        color: '#B91C1C',
    },
    warningBadge: {
        backgroundColor: '#FEF3C7',
        color: '#B45309',
    },
    emptyState: {
        minHeight: 225,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        color: '#15803D',
        fontSize: 18,
        fontWeight: '800',
    },
    stockRow: {
        minHeight: 59,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingVertical: 9,
    },
    stockInfo: {
        flex: 1,
        paddingRight: 10,
    },
    stockBadge: {
        borderRadius: 999,
        fontSize: 11,
        fontWeight: '800',
        overflow: 'hidden',
        paddingHorizontal: 9,
        paddingVertical: 5,
    },
    lowStockBadge: {
        backgroundColor: '#FEF3C7',
        color: '#B45309',
    },
    okStockBadge: {
        backgroundColor: '#DCFCE7',
        color: '#166534',
    },
    movementButton: {
        backgroundColor: '#0284C7',
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 14,
        paddingHorizontal: 16,
        paddingVertical: 11,
    },
    movementButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
});
