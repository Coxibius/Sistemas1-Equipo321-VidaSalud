import axios from 'axios';
import React, { useState } from 'react';
import {
    Alert,
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
import { obtenerEtiquetaRol, UsuarioSesion } from '../types/usuario';

interface Props {
    alCancelar: () => void;
    alGuardarExitoso: () => void;
    usuario: UsuarioSesion;
}

export const RegistrarProductoScreen: React.FC<Props> = ({ alCancelar, alGuardarExitoso, usuario }) => {
    // Estado local para los campos del formulario
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState('');
    const [precio, setPrecio] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [cargando, setCargando] = useState(false);
    const { width } = useWindowDimensions();
    const esMovil = width < 700;

    // Función que se ejecuta al presionar "Guardar"
    const manejarGuardar = async () => {
        // 1. Validaciones básicas según las Reglas de Negocio (HU01)
        if (!nombre.trim() || !categoria.trim() || !precio.trim() || !cantidad.trim() || !fechaVencimiento.trim()) {
            Alert.alert('Campos incompletos', 'Todos los campos marcados son obligatorios.');
            return;
        }

        const precioNum = parseFloat(precio);
        const cantidadNum = parseInt(cantidad, 10);

        if (isNaN(precioNum) || precioNum < 0) {
            Alert.alert('Valor inválido', 'El precio no puede ser negativo.');
            return;
        }

        if (isNaN(cantidadNum) || cantidadNum < 0) {
            Alert.alert('Valor inválido', 'La cantidad no puede ser negativa.');
            return;
        }

        // 2. Enviar datos al servicio
        try {
            setCargando(true);
            await ProductoService.registrarProducto({
                nombre,
                categoria,
                precio: precioNum,
                cantidad: cantidadNum,
                fechaVencimiento,
                responsable: usuario.nombre,
            });

            Alert.alert('¡Éxito!', 'Producto registrado correctamente.');
            alGuardarExitoso();
        } catch (error) {
            const mensajeApi = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;
            Alert.alert(
                'No se pudo registrar',
                mensajeApi ?? 'Verifica la conexión con la API e intenta nuevamente.',
            );
        } finally {
            setCargando(false);
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
            {/* Cabecera superior con Usuario */}
            <View style={styles.topHeader}>
                <Text style={styles.userBadge}>
                    👤 Usuario: {usuario.nombre} ({obtenerEtiquetaRol(usuario.rol)})
                </Text>
            </View>

            {/* Tarjeta principal del Formulario */}
            <View style={[styles.card, esMovil && styles.cardMobile]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>REGISTRAR NUEVO PRODUCTO</Text>
                    <Text style={styles.cardSubtitle}>Ingresa los datos para incorporar el producto al inventario</Text>
                </View>

                {/* Campo: Nombre */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Nombre del Medicamento / Producto *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: Paracetamol 500mg"
                        placeholderTextColor="#94A3B8"
                        value={nombre}
                        onChangeText={setNombre}
                    />
                </View>

                {/* Campo: Categoría */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Categoría *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: Analgésicos, Antibióticos"
                        placeholderTextColor="#94A3B8"
                        value={categoria}
                        onChangeText={setCategoria}
                    />
                </View>

                {/* Fila: Precio y Cantidad juntos */}
                <View style={[styles.row, esMovil && styles.rowMobile]}>
                    <View style={[styles.formGroup, styles.rowField]}>
                        <Text style={styles.label}>Precio (Bs) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            value={precio}
                            onChangeText={setPrecio}
                        />
                    </View>

                    <View style={[styles.formGroup, styles.rowField]}>
                        <Text style={styles.label}>Cantidad / Stock Inicial *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: 50"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            value={cantidad}
                            onChangeText={setCantidad}
                        />
                    </View>
                </View>

                {/* Campo: Fecha de Vencimiento */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Fecha de Vencimiento (AAAA-MM-DD) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="2027-12-31"
                        placeholderTextColor="#94A3B8"
                        value={fechaVencimiento}
                        onChangeText={setFechaVencimiento}
                    />
                </View>

                {/* Botones de Acción (Cancelar y Guardar) */}
                <View style={[styles.buttonRow, esMovil && styles.buttonRowMobile]}>
                    <TouchableOpacity style={styles.cancelButton} onPress={alCancelar}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveButton, cargando && { opacity: 0.7 }]}
                        onPress={manejarGuardar}
                        disabled={cargando}
                    >
                        <Text style={styles.saveButtonText}>
                            {cargando ? 'Guardando...' : 'Guardar Producto'}
                        </Text>
                    </TouchableOpacity>
                </View>
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
        backgroundColor: '#F8FAFC', // Fondo gris clínico
        padding: 32,
    },
    containerMobile: {
        padding: 16,
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    userBadge: {
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        color: '#334155',
        fontWeight: '600',
        fontSize: 13,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 28,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        maxWidth: 700,
        alignSelf: 'center',
        width: '100%',
    },
    cardMobile: {
        padding: 20,
    },
    cardHeader: {
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    formGroup: {
        marginBottom: 18,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    rowMobile: {
        flexWrap: 'wrap',
    },
    rowField: {
        flex: 1,
        minWidth: 180,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 15,
        color: '#0F172A',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 24,
    },
    buttonRowMobile: {
        flexWrap: 'wrap-reverse',
    },
    cancelButton: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    cancelButtonText: {
        color: '#475569',
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#0284C7', // Azul profesional
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});
