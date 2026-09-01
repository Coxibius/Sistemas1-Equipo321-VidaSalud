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
import { AlertaVencimiento } from '../types/vencimiento';

export const VencimientosScreen: React.FC = () => {
    const [alertas, setAlertas] = useState<AlertaVencimiento[]>([]);
    const [cargando, setCargando] = useState(true);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const { width } = useWindowDimensions();
    const esMovil = width < 700;

    const cargarAlertas = useCallback(async () => {
        try {
            setCargando(true);
            setMensajeError(null);
            setAlertas(await ProductoService.obtenerAlertasVencimiento());
        } catch {
            setAlertas([]);
            setMensajeError('No fue posible consultar las alertas de vencimiento.');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        void cargarAlertas();
    }, [cargarAlertas]);

    const resumen = useMemo(() => ({
        vencidos: alertas.filter((alerta) => alerta.estadoVencimiento === 'VENCIDO').length,
        proximos: alertas.filter((alerta) => alerta.estadoVencimiento === 'PROXIMO_A_VENCER').length,
    }), [alertas]);

    return (
        <ScrollView contentContainerStyle={[styles.container, esMovil && styles.containerMobile]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.eyebrow}>CONTROL PREVENTIVO</Text>
                    <Text style={styles.title}>Alertas de vencimiento</Text>
                    <Text style={styles.subtitle}>Lotes vencidos o con 30 días o menos de vigencia.</Text>
                </View>
                <TouchableOpacity style={styles.refreshButton} onPress={cargarAlertas} disabled={cargando}>
                    <Text style={styles.refreshText}>Actualizar</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, styles.expiredCard]}>
                    <Text style={styles.summaryLabel}>Vencidos</Text>
                    <Text style={[styles.summaryValue, styles.expiredText]}>{resumen.vencidos}</Text>
                </View>
                <View style={[styles.summaryCard, styles.warningCard]}>
                    <Text style={styles.summaryLabel}>Próximos a vencer</Text>
                    <Text style={[styles.summaryValue, styles.warningText]}>{resumen.proximos}</Text>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Lotes que requieren atención</Text>
                    {!cargando && !mensajeError && <Text style={styles.resultCount}>{alertas.length} alertas</Text>}
                </View>

                {cargando ? (
                    <View style={styles.feedback}>
                        <ActivityIndicator size="large" color="#0284C7" />
                        <Text style={styles.feedbackText}>Evaluando fechas...</Text>
                    </View>
                ) : mensajeError ? (
                    <View style={styles.feedback}>
                        <Text style={styles.errorText}>{mensajeError}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={cargarAlertas}>
                            <Text style={styles.retryText}>Reintentar</Text>
                        </TouchableOpacity>
                    </View>
                ) : alertas.length === 0 ? (
                    <View style={styles.feedback}>
                        <Text style={styles.emptyTitle}>Sin alertas de vencimiento</Text>
                        <Text style={styles.feedbackText}>No existen lotes vencidos ni próximos a vencer.</Text>
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator>
                        <View style={styles.table}>
                            <View style={[styles.row, styles.tableHeader]}>
                                <Text style={[styles.headerCell, styles.productCell]}>Producto</Text>
                                <Text style={[styles.headerCell, styles.dateCell]}>Vencimiento</Text>
                                <Text style={[styles.headerCell, styles.quantityCell]}>Cantidad</Text>
                                <Text style={[styles.headerCell, styles.daysCell]}>Días</Text>
                                <Text style={[styles.headerCell, styles.statusCell]}>Estado</Text>
                            </View>

                            {alertas.map((alerta) => {
                                const vencido = alerta.estadoVencimiento === 'VENCIDO';
                                return (
                                    <View key={alerta.loteId} style={styles.row}>
                                        <View style={styles.productCell}>
                                            <Text style={styles.productName}>{alerta.producto}</Text>
                                            <Text style={styles.lotText}>Lote #{alerta.loteId}</Text>
                                        </View>
                                        <Text style={[styles.bodyCell, styles.dateCell]}>{alerta.fechaVencimiento}</Text>
                                        <Text style={[styles.bodyCell, styles.quantityCell]}>{alerta.cantidad}</Text>
                                        <Text style={[styles.bodyCell, styles.daysCell]}>
                                            {vencido ? '—' : alerta.diasRestantes}
                                        </Text>
                                        <View style={styles.statusCell}>
                                            <Text style={[styles.badge, vencido ? styles.expiredBadge : styles.warningBadge]}>
                                                {vencido ? 'Vencido' : 'Próximo a vencer'}
                                            </Text>
                                        </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 20,
        flexWrap: 'wrap',
        marginBottom: 22,
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
    summaryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 18,
    },
    summaryCard: {
        minWidth: 210,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 10,
        padding: 18,
    },
    expiredCard: {
        borderColor: '#FECACA',
    },
    warningCard: {
        borderColor: '#FDE68A',
    },
    summaryLabel: {
        color: '#64748B',
        fontSize: 13,
        fontWeight: '700',
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: '900',
        marginTop: 5,
    },
    expiredText: {
        color: '#B91C1C',
    },
    warningText: {
        color: '#B45309',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
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
    feedback: {
        minHeight: 250,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
    },
    feedbackText: {
        color: '#64748B',
        marginTop: 10,
        textAlign: 'center',
    },
    errorText: {
        color: '#B91C1C',
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#E0F2FE',
        borderRadius: 8,
        marginTop: 13,
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    retryText: {
        color: '#0369A1',
        fontWeight: '700',
    },
    emptyTitle: {
        color: '#166534',
        fontSize: 18,
        fontWeight: '800',
    },
    table: {
        minWidth: 820,
        width: '100%',
    },
    row: {
        minHeight: 64,
        flexDirection: 'row',
        alignItems: 'center',
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
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    bodyCell: {
        color: '#475569',
        fontSize: 14,
    },
    productCell: {
        width: 260,
    },
    dateCell: {
        width: 150,
    },
    quantityCell: {
        width: 120,
    },
    daysCell: {
        width: 90,
    },
    statusCell: {
        width: 180,
    },
    productName: {
        color: '#0F172A',
        fontSize: 14,
        fontWeight: '800',
    },
    lotText: {
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 2,
    },
    badge: {
        alignSelf: 'flex-start',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: '800',
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
});
