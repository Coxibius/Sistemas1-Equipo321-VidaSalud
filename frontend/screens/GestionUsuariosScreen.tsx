import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
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
import { UsuarioService } from '../services/usuarioService';
import { SeguridadService } from '../services/seguridadService';
import { LogAuditoria, SolicitudBaja } from '../types/seguridad';
import {
    obtenerEtiquetaRol,
    RolUsuario,
    UsuarioSesion,
} from '../types/usuario';

const rolesEditables: Array<Exclude<RolUsuario, 'ADMINISTRADOR'>> = ['ENCARGADO', 'AUXILIAR'];

interface Props {
    usuarioAdministrador: UsuarioSesion;
}

export const GestionUsuariosScreen: React.FC<Props> = ({ usuarioAdministrador }) => {
    const [usuarios, setUsuarios] = useState<UsuarioSesion[]>([]);
    const [solicitudes, setSolicitudes] = useState<SolicitudBaja[]>([]);
    const [auditoria, setAuditoria] = useState<LogAuditoria[]>([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [editando, setEditando] = useState<UsuarioSesion | null>(null);
    const [confirmandoEliminar, setConfirmandoEliminar] = useState<UsuarioSesion | null>(null);
    const [nombre, setNombre] = useState('');
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [rol, setRol] = useState<Exclude<RolUsuario, 'ADMINISTRADOR'>>('ENCARGADO');
    const [contrasena, setContrasena] = useState('');
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [esError, setEsError] = useState(false);
    const { width } = useWindowDimensions();
    const esMovil = width < 700;

    const cargarUsuarios = useCallback(async () => {
        try {
            setCargando(true);
            const [usuariosRegistrados, solicitudesRegistradas, logsRegistrados] = await Promise.all([
                UsuarioService.listar(),
                SeguridadService.listarSolicitudes(),
                SeguridadService.listarAuditoria(50),
            ]);
            setUsuarios(usuariosRegistrados);
            setSolicitudes(solicitudesRegistradas);
            setAuditoria(logsRegistrados);
        } catch {
            setEsError(true);
            setMensaje('No fue posible consultar los usuarios.');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        void cargarUsuarios();
    }, [cargarUsuarios]);

    const limpiarFormulario = () => {
        setEditando(null);
        setNombre('');
        setNombreUsuario('');
        setEmail('');
        setRol('ENCARGADO');
        setContrasena('');
    };

    const mostrarErrorApi = (error: unknown, mensajePredeterminado: string) => {
        const mensajeApi = axios.isAxiosError(error)
            ? error.response?.data?.message
            : undefined;
        setEsError(true);
        setMensaje(mensajeApi ?? mensajePredeterminado);
    };

    const guardar = async () => {
        if (!nombre.trim() || !nombreUsuario.trim()) {
            setEsError(true);
            setMensaje('El nombre y el usuario son obligatorios.');
            return;
        }

        if (!editando && contrasena.length < 6) {
            setEsError(true);
            setMensaje('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            setGuardando(true);
            setMensaje(null);

            if (editando) {
                await UsuarioService.actualizar(editando.id, {
                    nombre: nombre.trim(),
                    usuario: nombreUsuario.trim(),
                    email: email.trim() || undefined,
                    rol: editando.rol === 'ADMINISTRADOR' ? 'ADMINISTRADOR' : rol,
                    contrasena: contrasena || undefined,
                }, usuarioAdministrador.usuario);
                setMensaje('Usuario actualizado correctamente.');
            } else {
                await UsuarioService.crear({
                    nombre: nombre.trim(),
                    usuario: nombreUsuario.trim(),
                    email: email.trim() || undefined,
                    rol,
                    contrasena,
                }, usuarioAdministrador.usuario);
                setMensaje('Usuario registrado correctamente.');
            }

            setEsError(false);
            limpiarFormulario();
            await cargarUsuarios();
        } catch (error) {
            mostrarErrorApi(error, 'No fue posible guardar el usuario.');
        } finally {
            setGuardando(false);
        }
    };

    const comenzarEdicion = (usuario: UsuarioSesion) => {
        setEditando(usuario);
        setNombre(usuario.nombre);
        setNombreUsuario(usuario.usuario);
        setEmail(usuario.email ?? '');
        if (usuario.rol !== 'ADMINISTRADOR') {
            setRol(usuario.rol);
        }
        setContrasena('');
        setMensaje(null);
    };

    const eliminar = async () => {
        if (!confirmandoEliminar) {
            return;
        }

        try {
            await UsuarioService.eliminar(confirmandoEliminar.id, usuarioAdministrador.usuario);
            setConfirmandoEliminar(null);
            setEsError(false);
            setMensaje('Usuario dado de baja y ocultado correctamente.');
            await cargarUsuarios();
        } catch (error) {
            mostrarErrorApi(error, 'No fue posible dar de baja al usuario.');
        }
    };

    const resolverSolicitud = async (solicitud: SolicitudBaja, aprobar: boolean) => {
        try {
            setMensaje(null);
            await SeguridadService.resolverSolicitud(
                solicitud.id,
                aprobar ? 'APROBADA' : 'RECHAZADA',
                usuarioAdministrador.usuario,
            );
            setEsError(false);
            setMensaje(aprobar
                ? `La cuenta @${solicitud.usuario} fue desactivada.`
                : `La solicitud de @${solicitud.usuario} fue rechazada.`);
            await cargarUsuarios();
        } catch (error) {
            mostrarErrorApi(error, 'No fue posible procesar la solicitud.');
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
                    <Text style={styles.eyebrow}>ADMINISTRACIÓN</Text>
                    <Text style={styles.title}>Gestión de usuarios</Text>
                    <Text style={styles.subtitle}>Registra y administra encargados y auxiliares.</Text>
                </View>
                <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Acceso de administrador</Text>
                </View>
            </View>

            <View style={styles.formCard}>
                <View style={styles.formHeader}>
                    <Text style={styles.formTitle}>
                        {editando ? `Editar a ${editando.nombre}` : 'Registrar usuario'}
                    </Text>
                    {editando && (
                        <TouchableOpacity onPress={limpiarFormulario}>
                            <Text style={styles.cancelText}>Cancelar edición</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.formGrid}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Nombre completo *</Text>
                        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} maxLength={80} />
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.label}>Usuario *</Text>
                        <TextInput
                            style={styles.input}
                            value={nombreUsuario}
                            onChangeText={setNombreUsuario}
                            autoCapitalize="none"
                            maxLength={50}
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
                    <View style={styles.field}>
                        <Text style={styles.label}>
                            Contraseña {editando ? '(vacía para conservarla)' : '*'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={contrasena}
                            onChangeText={setContrasena}
                            secureTextEntry
                            maxLength={80}
                        />
                    </View>
                </View>

                <Text style={styles.label}>Rol</Text>
                {editando?.rol === 'ADMINISTRADOR' ? (
                    <View style={styles.protectedRole}>
                        <Text style={styles.protectedRoleText}>Administrador · rol protegido</Text>
                    </View>
                ) : (
                    <View style={styles.roleRow}>
                        {rolesEditables.map((opcion) => (
                            <TouchableOpacity
                                key={opcion}
                                style={[styles.roleButton, rol === opcion && styles.roleButtonActive]}
                                onPress={() => setRol(opcion)}
                            >
                                <Text style={[styles.roleText, rol === opcion && styles.roleTextActive]}>
                                    {obtenerEtiquetaRol(opcion)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {mensaje && (
                    <Text style={[styles.message, esError ? styles.errorMessage : styles.successMessage]}>
                        {mensaje}
                    </Text>
                )}

                <TouchableOpacity
                    style={[styles.saveButton, guardando && styles.buttonDisabled]}
                    onPress={guardar}
                    disabled={guardando}
                >
                    <Text style={styles.saveButtonText}>
                        {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar usuario'}
                    </Text>
                </TouchableOpacity>
            </View>

            {confirmandoEliminar && (
                <View style={styles.confirmBox}>
                    <Text style={styles.confirmText}>
                        ¿Dar de baja a {confirmandoEliminar.nombre}? La cuenta se ocultará,
                        no podrá iniciar sesión y sus registros históricos se conservarán.
                    </Text>
                    <View style={styles.confirmActions}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={() => setConfirmandoEliminar(null)}>
                            <Text style={styles.secondaryButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteConfirmButton} onPress={eliminar}>
                            <Text style={styles.deleteConfirmText}>Sí, dar de baja</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={styles.listCard}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Usuarios registrados</Text>
                    <Text style={styles.resultCount}>{usuarios.length} usuarios</Text>
                </View>

                {cargando ? (
                    <View style={styles.feedback}>
                        <ActivityIndicator size="large" color="#0284C7" />
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator>
                        <View style={styles.table}>
                            <View style={[styles.row, styles.tableHeader]}>
                                <Text style={[styles.headerCell, styles.nameCell]}>Nombre</Text>
                                <Text style={[styles.headerCell, styles.userCell]}>Usuario</Text>
                                <Text style={[styles.headerCell, styles.emailCell]}>Correo</Text>
                                <Text style={[styles.headerCell, styles.roleCell]}>Rol</Text>
                                <Text style={[styles.headerCell, styles.statusCell]}>Estado</Text>
                                <Text style={[styles.headerCell, styles.actionsCell]}>Acciones</Text>
                            </View>
                            {usuarios.map((usuario) => (
                                <View key={usuario.id} style={styles.row}>
                                    <Text style={[styles.bodyCell, styles.nameCell, styles.userName]}>{usuario.nombre}</Text>
                                    <Text style={[styles.bodyCell, styles.userCell]}>@{usuario.usuario}</Text>
                                    <Text style={[styles.bodyCell, styles.emailCell]}>{usuario.email ?? '—'}</Text>
                                    <View style={styles.roleCell}>
                                        <Text style={[
                                            styles.roleBadge,
                                            usuario.rol === 'ADMINISTRADOR' && styles.adminRoleBadge,
                                        ]}>
                                            {obtenerEtiquetaRol(usuario.rol)}
                                        </Text>
                                    </View>
                                    <View style={styles.statusCell}>
                                        <Text style={[
                                            styles.accountStatus,
                                            usuario.activo ? styles.accountActive : styles.accountInactive,
                                        ]}>
                                            {usuario.activo ? 'ACTIVO' : 'INACTIVO'}
                                        </Text>
                                    </View>
                                    <View style={[styles.actionsCell, styles.actionRow]}>
                                        <TouchableOpacity style={styles.editButton} onPress={() => comenzarEdicion(usuario)}>
                                            <Text style={styles.editButtonText}>Editar</Text>
                                        </TouchableOpacity>
                                        {usuario.rol !== 'ADMINISTRADOR' && (
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => setConfirmandoEliminar(usuario)}
                                            >
                                                <Text style={styles.deleteButtonText}>Dar de baja</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                )}
            </View>

            <View style={styles.securityGrid}>
                <View style={[styles.securityCard, esMovil && styles.securityCardMobile]}>
                    <View style={styles.listHeader}>
                        <View>
                            <Text style={styles.listTitle}>Solicitudes de baja</Text>
                            <Text style={styles.sectionSubtitle}>Revisión administrativa de Habeas Data</Text>
                        </View>
                        <Text style={styles.resultCount}>
                            {solicitudes.filter((solicitud) => solicitud.estado === 'PENDIENTE').length} pendientes
                        </Text>
                    </View>
                    {solicitudes.length === 0 ? (
                        <Text style={styles.emptyText}>No existen solicitudes registradas.</Text>
                    ) : solicitudes.slice(0, 10).map((solicitud) => (
                        <View key={solicitud.id} style={styles.securityRow}>
                            <View style={styles.securityInfo}>
                                <Text style={styles.securityTitle}>{solicitud.nombre} · @{solicitud.usuario}</Text>
                                <Text style={styles.securityMeta}>
                                    {new Date(solicitud.fechaSolicitud).toLocaleString('es-BO')}
                                    {solicitud.motivo ? ` · ${solicitud.motivo}` : ''}
                                </Text>
                            </View>
                            {solicitud.estado === 'PENDIENTE' ? (
                                <View style={styles.requestActions}>
                                    <TouchableOpacity
                                        style={styles.approveButton}
                                        onPress={() => resolverSolicitud(solicitud, true)}
                                    >
                                        <Text style={styles.approveButtonText}>Aprobar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.rejectButton}
                                        onPress={() => resolverSolicitud(solicitud, false)}
                                    >
                                        <Text style={styles.rejectButtonText}>Rechazar</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Text style={[
                                    styles.requestStatus,
                                    solicitud.estado === 'APROBADA' ? styles.approvedStatus : styles.rejectedStatus,
                                ]}>
                                    {solicitud.estado}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>

                <View style={[styles.securityCard, esMovil && styles.securityCardMobile]}>
                    <View style={styles.listHeader}>
                        <View>
                            <Text style={styles.listTitle}>Actividad reciente</Text>
                            <Text style={styles.sectionSubtitle}>Logs persistentes de operaciones críticas</Text>
                        </View>
                        <Text style={styles.resultCount}>{auditoria.length} eventos</Text>
                    </View>
                    {auditoria.length === 0 ? (
                        <Text style={styles.emptyText}>Los eventos aparecerán después de usar el sistema.</Text>
                    ) : auditoria.slice(0, 12).map((log) => (
                        <View key={log.id} style={styles.securityRow}>
                            <View style={styles.securityInfo}>
                                <Text style={styles.securityTitle}>{log.accion.replaceAll('_', ' ')}</Text>
                                <Text style={styles.securityMeta}>
                                    {log.actor} · {log.entidad}{log.entidadId ? ` #${log.entidadId}` : ''} ·{' '}
                                    {new Date(log.fechaUtc).toLocaleString('es-BO')}
                                </Text>
                                {log.detalle && <Text style={styles.auditDetail}>{log.detalle}</Text>}
                            </View>
                            <Text style={[
                                styles.auditResult,
                                log.resultado === 'EXITOSO' ? styles.successResult : styles.failureResult,
                            ]}>
                                {log.resultado}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    page: { flex: 1 },
    container: { flexGrow: 1, backgroundColor: '#F8FAFC', padding: 32 },
    containerMobile: { padding: 16 },
    header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20, marginBottom: 20 },
    eyebrow: { color: '#7C3AED', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 },
    title: { color: '#0F172A', fontSize: 28, fontWeight: '900' },
    subtitle: { color: '#64748B', fontSize: 14, marginTop: 5 },
    adminBadge: { backgroundColor: '#EDE9FE', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
    adminBadgeText: { color: '#6D28D9', fontSize: 12, fontWeight: '800' },
    formCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 22, gap: 14, marginBottom: 18 },
    formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    formTitle: { color: '#0F172A', fontSize: 18, fontWeight: '900' },
    cancelText: { color: '#0284C7', fontSize: 13, fontWeight: '700' },
    formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
    field: { flex: 1, minWidth: 220 },
    label: { color: '#334155', fontSize: 13, fontWeight: '700', marginBottom: 7 },
    input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, color: '#0F172A', fontSize: 14, paddingHorizontal: 13, paddingVertical: 11 },
    roleRow: { flexDirection: 'row', gap: 10 },
    roleButton: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
    roleButtonActive: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
    roleText: { color: '#475569', fontWeight: '700' },
    roleTextActive: { color: '#FFFFFF' },
    protectedRole: { alignSelf: 'flex-start', backgroundColor: '#EDE9FE', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
    protectedRoleText: { color: '#6D28D9', fontWeight: '800' },
    message: { borderRadius: 8, fontSize: 13, fontWeight: '700', padding: 11 },
    errorMessage: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
    successMessage: { backgroundColor: '#DCFCE7', color: '#166534' },
    saveButton: { alignSelf: 'flex-start', minWidth: 190, backgroundColor: '#0F172A', borderRadius: 8, alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
    saveButtonText: { color: '#FFFFFF', fontWeight: '800' },
    buttonDisabled: { opacity: 0.6 },
    confirmBox: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', borderRadius: 10, padding: 16, marginBottom: 18 },
    confirmText: { color: '#9A3412', fontWeight: '800' },
    confirmActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
    secondaryButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 7, paddingHorizontal: 15, paddingVertical: 9 },
    secondaryButtonText: { color: '#475569', fontWeight: '700' },
    deleteConfirmButton: { backgroundColor: '#B91C1C', borderRadius: 7, paddingHorizontal: 15, paddingVertical: 9 },
    deleteConfirmText: { color: '#FFFFFF', fontWeight: '800' },
    listCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden' },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    listTitle: { color: '#0F172A', fontSize: 17, fontWeight: '800' },
    resultCount: { color: '#64748B', fontSize: 13, fontWeight: '600' },
    feedback: { minHeight: 180, alignItems: 'center', justifyContent: 'center' },
    table: { minWidth: 1060, width: '100%' },
    row: { minHeight: 62, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingHorizontal: 20 },
    tableHeader: { minHeight: 46, backgroundColor: '#F8FAFC' },
    headerCell: { color: '#475569', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    bodyCell: { color: '#475569', fontSize: 14, paddingRight: 10 },
    userName: { color: '#0F172A', fontWeight: '800' },
    nameCell: { width: 220 },
    userCell: { width: 150 },
    emailCell: { width: 230 },
    roleCell: { width: 150 },
    statusCell: { width: 110 },
    actionsCell: { width: 180 },
    roleBadge: { alignSelf: 'flex-start', backgroundColor: '#E0F2FE', borderRadius: 999, color: '#0369A1', fontSize: 11, fontWeight: '800', paddingHorizontal: 9, paddingVertical: 5 },
    adminRoleBadge: { backgroundColor: '#EDE9FE', color: '#6D28D9' },
    accountStatus: { alignSelf: 'flex-start', borderRadius: 999, overflow: 'hidden', fontSize: 10, fontWeight: '900', paddingHorizontal: 9, paddingVertical: 5 },
    accountActive: { backgroundColor: '#DCFCE7', color: '#166534' },
    accountInactive: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
    actionRow: { flexDirection: 'row', gap: 8 },
    editButton: { backgroundColor: '#E0F2FE', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 8 },
    editButtonText: { color: '#0369A1', fontSize: 12, fontWeight: '800' },
    deleteButton: { backgroundColor: '#FEE2E2', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 8 },
    deleteButtonText: { color: '#B91C1C', fontSize: 12, fontWeight: '800' },
    securityGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 18, marginTop: 18 },
    securityCard: { flexGrow: 1, flexBasis: 470, minWidth: 340, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden' },
    securityCardMobile: { flexBasis: '100%', minWidth: 0, width: '100%' },
    sectionSubtitle: { color: '#64748B', fontSize: 11, marginTop: 3 },
    emptyText: { color: '#64748B', fontSize: 13, padding: 20 },
    securityRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingHorizontal: 18, paddingVertical: 13 },
    securityInfo: { flex: 1, minWidth: 210 },
    securityTitle: { color: '#0F172A', fontSize: 13, fontWeight: '800' },
    securityMeta: { color: '#64748B', fontSize: 11, marginTop: 3 },
    auditDetail: { color: '#475569', fontSize: 11, marginTop: 3 },
    requestActions: { flexDirection: 'row', gap: 7 },
    approveButton: { backgroundColor: '#DCFCE7', borderRadius: 7, paddingHorizontal: 11, paddingVertical: 8 },
    approveButtonText: { color: '#166534', fontSize: 11, fontWeight: '800' },
    rejectButton: { backgroundColor: '#FEE2E2', borderRadius: 7, paddingHorizontal: 11, paddingVertical: 8 },
    rejectButtonText: { color: '#B91C1C', fontSize: 11, fontWeight: '800' },
    requestStatus: { borderRadius: 999, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5, fontSize: 10, fontWeight: '900' },
    approvedStatus: { backgroundColor: '#DCFCE7', color: '#166534' },
    rejectedStatus: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
    auditResult: { borderRadius: 999, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5, fontSize: 10, fontWeight: '900' },
    successResult: { backgroundColor: '#DCFCE7', color: '#166534' },
    failureResult: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
});
