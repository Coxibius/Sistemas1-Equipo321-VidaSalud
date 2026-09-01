import axios from 'axios';
import React, { useState } from 'react';
import {
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
import { SeguridadService } from '../services/seguridadService';
import { UsuarioService } from '../services/usuarioService';
import { obtenerEtiquetaRol, UsuarioSesion } from '../types/usuario';

interface Props {
    usuario: UsuarioSesion;
    alActualizarUsuario: (usuario: UsuarioSesion) => void;
}

export const MiPerfilScreen: React.FC<Props> = ({ usuario, alActualizarUsuario }) => {
    const [nombre, setNombre] = useState(usuario.nombre);
    const [email, setEmail] = useState(usuario.email ?? '');
    const [motivo, setMotivo] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [solicitando, setSolicitando] = useState(false);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [esError, setEsError] = useState(false);
    const [bajaSolicitada, setBajaSolicitada] = useState(false);
    const { width } = useWindowDimensions();
    const esMovil = width < 700;

    const mostrarError = (error: unknown, predeterminado: string) => {
        const mensajeApi = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
        setEsError(true);
        setMensaje(mensajeApi ?? predeterminado);
    };

    const guardarPerfil = async () => {
        if (!nombre.trim()) {
            setEsError(true);
            setMensaje('El nombre es obligatorio.');
            return;
        }

        try {
            setGuardando(true);
            setMensaje(null);
            const actualizado = await UsuarioService.actualizarPerfil(
                usuario.id,
                { nombre: nombre.trim(), email: email.trim() || undefined },
                usuario.usuario,
            );
            alActualizarUsuario(actualizado);
            setEsError(false);
            setMensaje('Tus datos fueron actualizados correctamente.');
        } catch (error) {
            mostrarError(error, 'No fue posible actualizar tus datos.');
        } finally {
            setGuardando(false);
        }
    };

    const solicitarBaja = async () => {
        try {
            setSolicitando(true);
            setMensaje(null);
            await SeguridadService.solicitarBaja(usuario.id, motivo.trim() || undefined);
            setBajaSolicitada(true);
            setEsError(false);
            setMensaje('Solicitud registrada. El administrador debe revisarla antes de desactivar la cuenta.');
        } catch (error) {
            mostrarError(error, 'No fue posible registrar la solicitud de baja.');
        } finally {
            setSolicitando(false);
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
                        <Text style={styles.eyebrow}>PRIVACIDAD Y HABEAS DATA</Text>
                        <Text style={styles.title}>Mi perfil</Text>
                        <Text style={styles.subtitle}>Consulta y corrige los datos asociados a tu cuenta.</Text>
                    </View>
                    <Text style={[styles.statusBadge, usuario.activo ? styles.activeBadge : styles.inactiveBadge]}>
                        {usuario.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
                    </Text>
                </View>

                <View style={styles.notice}>
                    <Text style={styles.noticeTitle}>¿Qué información conserva VidaSalud?</Text>
                    <Text style={styles.noticeText}>
                        Nombre, usuario, correo, rol y fecha de registro. Se utilizan para identificar al
                        responsable de las operaciones de inventario y mantener trazabilidad. La contraseña
                        se almacena mediante hash y nunca se muestra en esta pantalla.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Datos almacenados</Text>
                    <View style={styles.grid}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Nombre completo</Text>
                            <TextInput
                                style={styles.input}
                                value={nombre}
                                onChangeText={setNombre}
                                maxLength={80}
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Correo electrónico</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                maxLength={100}
                            />
                        </View>
                        <DatoSoloLectura etiqueta="Usuario" valor={`@${usuario.usuario}`} />
                        <DatoSoloLectura etiqueta="Rol" valor={obtenerEtiquetaRol(usuario.rol)} />
                        <DatoSoloLectura
                            etiqueta="Fecha de registro"
                            valor={new Date(usuario.fechaRegistro).toLocaleString('es-BO')}
                        />
                    </View>

                    <Text style={styles.readOnlyHint}>El usuario y el rol solamente pueden ser modificados por administración.</Text>
                    <TouchableOpacity
                        style={[styles.primaryButton, guardando && styles.disabledButton]}
                        onPress={guardarPerfil}
                        disabled={guardando}
                    >
                        <Text style={styles.primaryButtonText}>{guardando ? 'Guardando...' : 'Guardar correcciones'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.deactivationCard}>
                    <Text style={styles.deactivationTitle}>Solicitar baja de la cuenta</Text>
                    {usuario.rol === 'ADMINISTRADOR' ? (
                        <Text style={styles.deactivationText}>
                            La única cuenta administradora está protegida para evitar dejar el sistema sin gestión.
                        </Text>
                    ) : (
                        <>
                            <Text style={styles.deactivationText}>
                                La solicitud no elimina inmediatamente tus registros. Administración debe revisarla y,
                                si la aprueba, la cuenta quedará inactiva conservando la trazabilidad histórica.
                            </Text>
                            <TextInput
                                style={[styles.input, styles.reasonInput]}
                                value={motivo}
                                onChangeText={setMotivo}
                                placeholder="Motivo opcional"
                                multiline
                                maxLength={250}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.deactivationButton,
                                    (solicitando || bajaSolicitada) && styles.disabledButton,
                                ]}
                                onPress={solicitarBaja}
                                disabled={solicitando || bajaSolicitada}
                            >
                                <Text style={styles.deactivationButtonText}>
                                    {bajaSolicitada ? 'Solicitud pendiente' : solicitando ? 'Enviando...' : 'Solicitar baja'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {mensaje && (
                    <Text style={[styles.message, esError ? styles.errorMessage : styles.successMessage]}>
                        {mensaje}
                    </Text>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const DatoSoloLectura: React.FC<{ etiqueta: string; valor: string }> = ({ etiqueta, valor }) => (
    <View style={styles.field}>
        <Text style={styles.label}>{etiqueta}</Text>
        <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{valor}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    page: { flex: 1 },
    container: { flexGrow: 1, backgroundColor: '#F8FAFC', padding: 32, gap: 18 },
    containerMobile: { padding: 16 },
    header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
    eyebrow: { color: '#0284C7', fontSize: 12, fontWeight: '800', letterSpacing: 1.1 },
    title: { color: '#0F172A', fontSize: 28, fontWeight: '900', marginTop: 4 },
    subtitle: { color: '#64748B', fontSize: 14, marginTop: 5 },
    statusBadge: { alignSelf: 'flex-start', borderRadius: 999, overflow: 'hidden', paddingHorizontal: 13, paddingVertical: 8, fontSize: 12, fontWeight: '800' },
    activeBadge: { backgroundColor: '#DCFCE7', color: '#166534' },
    inactiveBadge: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
    notice: { backgroundColor: '#E0F2FE', borderWidth: 1, borderColor: '#BAE6FD', borderRadius: 12, padding: 18 },
    noticeTitle: { color: '#075985', fontSize: 16, fontWeight: '900' },
    noticeText: { color: '#0C4A6E', fontSize: 13, lineHeight: 20, marginTop: 6 },
    card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 22 },
    cardTitle: { color: '#0F172A', fontSize: 18, fontWeight: '900', marginBottom: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
    field: { flexGrow: 1, flexBasis: 260, minWidth: 220 },
    label: { color: '#334155', fontSize: 13, fontWeight: '700', marginBottom: 7 },
    input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, color: '#0F172A', backgroundColor: '#FFFFFF', fontSize: 14, paddingHorizontal: 13, paddingVertical: 11 },
    readOnlyField: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, backgroundColor: '#F8FAFC', paddingHorizontal: 13, paddingVertical: 12 },
    readOnlyText: { color: '#475569', fontSize: 14 },
    readOnlyHint: { color: '#64748B', fontSize: 12, marginTop: 14 },
    primaryButton: { alignSelf: 'flex-start', backgroundColor: '#0284C7', borderRadius: 8, marginTop: 16, paddingHorizontal: 20, paddingVertical: 12 },
    primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
    deactivationCard: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', borderRadius: 12, padding: 22 },
    deactivationTitle: { color: '#9A3412', fontSize: 18, fontWeight: '900' },
    deactivationText: { color: '#7C2D12', fontSize: 13, lineHeight: 20, marginTop: 6 },
    reasonInput: { minHeight: 78, marginTop: 14, textAlignVertical: 'top' },
    deactivationButton: { alignSelf: 'flex-start', backgroundColor: '#C2410C', borderRadius: 8, marginTop: 12, paddingHorizontal: 20, paddingVertical: 12 },
    deactivationButtonText: { color: '#FFFFFF', fontWeight: '800' },
    disabledButton: { opacity: 0.55 },
    message: { borderRadius: 8, fontSize: 13, fontWeight: '700', padding: 12 },
    errorMessage: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
    successMessage: { backgroundColor: '#DCFCE7', color: '#166534' },
});
