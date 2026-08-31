import axios from 'axios';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { AutenticacionService } from '../services/autenticacionService';
import { UsuarioSesion } from '../types/usuario';

interface Props {
    alIniciarSesion: (usuario: UsuarioSesion) => void;
}

export const LoginScreen: React.FC<Props> = ({ alIniciarSesion }) => {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const iniciarSesion = async () => {
        if (!usuario.trim() || !contrasena) {
            setMensajeError('Completa el usuario y la contraseña.');
            return;
        }

        try {
            setCargando(true);
            setMensajeError(null);
            const sesion = await AutenticacionService.iniciarSesion(usuario, contrasena);
            alIniciarSesion(sesion);
        } catch (error) {
            const mensajeApi = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;
            setMensajeError(mensajeApi ?? 'No fue posible iniciar sesión. Verifica que la API esté disponible.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.page}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.decorativeCircleTop} />
            <View style={styles.decorativeCircleBottom} />

            <View style={styles.loginCard}>
                <View style={styles.brandIcon}>
                    <Text style={styles.brandIconText}>+</Text>
                </View>
                <Text style={styles.brand}>FARMACIA</Text>
                <Text style={styles.brandName}>VIDASALUD</Text>
                <Text style={styles.title}>Bienvenido</Text>
                <Text style={styles.subtitle}>Ingresa con una cuenta de demostración.</Text>

                <View style={styles.form}>
                    <View>
                        <Text style={styles.label}>Usuario</Text>
                        <TextInput
                            style={styles.input}
                            value={usuario}
                            onChangeText={setUsuario}
                            placeholder="victor o maria"
                            placeholderTextColor="#94A3B8"
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="next"
                            maxLength={30}
                        />
                    </View>

                    <View>
                        <Text style={styles.label}>Contraseña</Text>
                        <TextInput
                            style={styles.input}
                            value={contrasena}
                            onChangeText={setContrasena}
                            placeholder="Contraseña"
                            placeholderTextColor="#94A3B8"
                            secureTextEntry
                            onSubmitEditing={iniciarSesion}
                            returnKeyType="done"
                            maxLength={40}
                        />
                    </View>

                    {mensajeError && <Text style={styles.errorMessage}>{mensajeError}</Text>}

                    <TouchableOpacity
                        style={[styles.loginButton, cargando && styles.loginButtonDisabled]}
                        onPress={iniciarSesion}
                        disabled={cargando}
                    >
                        <Text style={styles.loginButtonText}>
                            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.demoBox}>
                    <Text style={styles.demoTitle}>Accesos para la presentación</Text>
                    <Text style={styles.demoText}>Admin: admin / admin123</Text>
                    <Text style={styles.demoText}>Víctor: victor / victor123</Text>
                    <Text style={styles.demoText}>María: maria / maria123</Text>
                </View>

                <Text style={styles.disclaimer}>Acceso simulado para fines académicos.</Text>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    page: {
        flex: 1,
        minHeight: 620,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: 24,
    },
    decorativeCircleTop: {
        position: 'absolute',
        top: -150,
        right: -100,
        width: 360,
        height: 360,
        borderRadius: 180,
        backgroundColor: '#0284C7',
        opacity: 0.22,
    },
    decorativeCircleBottom: {
        position: 'absolute',
        bottom: -190,
        left: -110,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#38BDF8',
        opacity: 0.12,
    },
    loginCard: {
        width: '100%',
        maxWidth: 430,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        alignItems: 'center',
        paddingHorizontal: 34,
        paddingVertical: 32,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
        elevation: 8,
    },
    brandIcon: {
        width: 54,
        height: 54,
        borderRadius: 14,
        backgroundColor: '#0284C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    brandIconText: {
        color: '#FFFFFF',
        fontSize: 38,
        fontWeight: '400',
        lineHeight: 42,
    },
    brand: {
        color: '#0284C7',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2.2,
    },
    brandName: {
        color: '#0F172A',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    title: {
        color: '#0F172A',
        fontSize: 26,
        fontWeight: '900',
        marginTop: 20,
    },
    subtitle: {
        color: '#64748B',
        fontSize: 14,
        marginTop: 5,
        textAlign: 'center',
    },
    form: {
        width: '100%',
        gap: 14,
        marginTop: 24,
    },
    label: {
        color: '#334155',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 7,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 9,
        color: '#0F172A',
        fontSize: 15,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    errorMessage: {
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
        color: '#B91C1C',
        fontSize: 13,
        fontWeight: '700',
        padding: 11,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: '#0284C7',
        borderRadius: 9,
        alignItems: 'center',
        marginTop: 2,
        paddingVertical: 13,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
    loginButtonDisabled: {
        opacity: 0.65,
    },
    demoBox: {
        width: '100%',
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: '#BAE6FD',
        borderRadius: 9,
        marginTop: 20,
        padding: 13,
    },
    demoTitle: {
        color: '#0369A1',
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 5,
    },
    demoText: {
        color: '#334155',
        fontSize: 12,
        marginTop: 2,
    },
    disclaimer: {
        color: '#94A3B8',
        fontSize: 11,
        marginTop: 16,
        textAlign: 'center',
    },
});
