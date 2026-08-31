import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { UsuarioService } from '../services/usuarioService';
import {
    obtenerEtiquetaRol,
    RolUsuario,
    UsuarioSesion,
} from '../types/usuario';

const rolesEditables: Array<Exclude<RolUsuario, 'ADMINISTRADOR'>> = ['ENCARGADO', 'AUXILIAR'];

export const GestionUsuariosScreen: React.FC = () => {
    const [usuarios, setUsuarios] = useState<UsuarioSesion[]>([]);
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

    const cargarUsuarios = useCallback(async () => {
        try {
            setCargando(true);
            setUsuarios(await UsuarioService.listar());
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
                });
                setMensaje('Usuario actualizado correctamente.');
            } else {
                await UsuarioService.crear({
                    nombre: nombre.trim(),
                    usuario: nombreUsuario.trim(),
                    email: email.trim() || undefined,
                    rol,
                    contrasena,
                });
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
            await UsuarioService.eliminar(confirmandoEliminar.id);
            setConfirmandoEliminar(null);
            setEsError(false);
            setMensaje('Usuario eliminado correctamente.');
            await cargarUsuarios();
        } catch (error) {
            mostrarErrorApi(error, 'No fue posible eliminar el usuario.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
                        ¿Eliminar definitivamente a {confirmandoEliminar.nombre}?
                    </Text>
                    <View style={styles.confirmActions}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={() => setConfirmandoEliminar(null)}>
                            <Text style={styles.secondaryButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteConfirmButton} onPress={eliminar}>
                            <Text style={styles.deleteConfirmText}>Sí, eliminar</Text>
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
                                    <View style={[styles.actionsCell, styles.actionRow]}>
                                        <TouchableOpacity style={styles.editButton} onPress={() => comenzarEdicion(usuario)}>
                                            <Text style={styles.editButtonText}>Editar</Text>
                                        </TouchableOpacity>
                                        {usuario.rol !== 'ADMINISTRADOR' && (
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => setConfirmandoEliminar(usuario)}
                                            >
                                                <Text style={styles.deleteButtonText}>Eliminar</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#F8FAFC', padding: 32 },
    header: { flexDirection: 'row', justifyContent: 'space-between', gap: 20, marginBottom: 20 },
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
    table: { minWidth: 960, width: '100%' },
    row: { minHeight: 62, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingHorizontal: 20 },
    tableHeader: { minHeight: 46, backgroundColor: '#F8FAFC' },
    headerCell: { color: '#475569', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    bodyCell: { color: '#475569', fontSize: 14, paddingRight: 10 },
    userName: { color: '#0F172A', fontWeight: '800' },
    nameCell: { width: 220 },
    userCell: { width: 150 },
    emailCell: { width: 230 },
    roleCell: { width: 150 },
    actionsCell: { width: 180 },
    roleBadge: { alignSelf: 'flex-start', backgroundColor: '#E0F2FE', borderRadius: 999, color: '#0369A1', fontSize: 11, fontWeight: '800', paddingHorizontal: 9, paddingVertical: 5 },
    adminRoleBadge: { backgroundColor: '#EDE9FE', color: '#6D28D9' },
    actionRow: { flexDirection: 'row', gap: 8 },
    editButton: { backgroundColor: '#E0F2FE', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 8 },
    editButtonText: { color: '#0369A1', fontSize: 12, fontWeight: '800' },
    deleteButton: { backgroundColor: '#FEE2E2', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 8 },
    deleteButtonText: { color: '#B91C1C', fontSize: 12, fontWeight: '800' },
});
