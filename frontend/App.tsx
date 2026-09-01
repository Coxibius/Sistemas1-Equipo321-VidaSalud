import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  initialWindowMetrics,
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { Sidebar } from './components/Sidebar';
import { MobileHeader, MobileNavigation } from './components/MobileNavigation';
import { RegistrarProductoScreen } from './screens/RegistrarProductoScreen';
import { ConsultarProductosScreen } from './screens/ConsultarProductosScreen';
import { RegistrarMovimientoScreen } from './screens/RegistrarMovimientoScreen';
import { VencimientosScreen } from './screens/VencimientosScreen';
import { LoginScreen } from './screens/LoginScreen';
import { UsuarioSesion } from './types/usuario';
import { GestionUsuariosScreen } from './screens/GestionUsuariosScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { MiPerfilScreen } from './screens/MiPerfilScreen';

const ANCHO_NAVEGACION_MOVIL = 820;

function VidaSaludApp() {
  // Guardamos en el estado qué pantalla está viendo el usuario
  const [pantallaActual, setPantallaActual] = useState('dashboard');
  const [usuarioActivo, setUsuarioActivo] = useState<UsuarioSesion | null>(null);
  const { width } = useWindowDimensions();
  const esMovil = width < ANCHO_NAVEGACION_MOVIL;

  const iniciarSesion = (usuario: UsuarioSesion) => {
    setUsuarioActivo(usuario);
    setPantallaActual('dashboard');
  };

  const cerrarSesion = () => {
    setUsuarioActivo(null);
    setPantallaActual('dashboard');
  };

  const actualizarUsuarioActivo = (usuario: UsuarioSesion) => {
    setUsuarioActivo(usuario);
  };

  if (!usuarioActivo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" backgroundColor="#0F172A" />
        <LoginScreen alIniciarSesion={iniciarSesion} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="#0F172A" />
      <View style={[styles.mainLayout, esMovil && styles.mainLayoutMobile]}>
        {/* 1. Menú lateral a la izquierda */}
        {esMovil ? (
          <MobileHeader
            usuario={usuarioActivo}
            alCerrarSesion={cerrarSesion}
            alVerPerfil={() => setPantallaActual('perfil')}
          />
        ) : (
          <Sidebar
            pantallaActual={pantallaActual === 'registrar-producto' ? 'productos' : pantallaActual}
            alSeleccionar={setPantallaActual}
            usuario={usuarioActivo}
            alCerrarSesion={cerrarSesion}
            alVerPerfil={() => setPantallaActual('perfil')}
          />
        )}

        {/* 2. Área principal de contenido a la derecha */}
        <View style={styles.contentArea}>
          {pantallaActual === 'dashboard' && (
            <DashboardScreen usuario={usuarioActivo} alSeleccionar={setPantallaActual} />
          )}
          {pantallaActual === 'productos' && (
            <ConsultarProductosScreen
              alRegistrarProducto={() => setPantallaActual('registrar-producto')}
              usuario={usuarioActivo}
            />
          )}
          {pantallaActual === 'registrar-producto' && (
            <RegistrarProductoScreen
              alCancelar={() => setPantallaActual('productos')}
              alGuardarExitoso={() => setPantallaActual('productos')}
              usuario={usuarioActivo}
            />
          )}
          {pantallaActual === 'inventario' && <RegistrarMovimientoScreen usuario={usuarioActivo} />}
          {pantallaActual === 'vencimientos' && <VencimientosScreen />}
          {pantallaActual === 'usuarios' && usuarioActivo.rol === 'ADMINISTRADOR' && (
            <GestionUsuariosScreen usuarioAdministrador={usuarioActivo} />
          )}
          {pantallaActual === 'perfil' && (
            <MiPerfilScreen
              usuario={usuarioActivo}
              alActualizarUsuario={actualizarUsuarioActivo}
            />
          )}
        </View>
        {esMovil && (
          <MobileNavigation
            pantallaActual={pantallaActual === 'registrar-producto' ? 'productos' : pantallaActual}
            alSeleccionar={setPantallaActual}
            usuario={usuarioActivo}
            alCerrarSesion={cerrarSesion}
            alVerPerfil={() => setPantallaActual('perfil')}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <VidaSaludApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row', // Esto hace que el Sidebar y el Contenido estén lado a lado
    backgroundColor: '#F8FAFC',
  },
  mainLayoutMobile: {
    flexDirection: 'column',
  },
  contentArea: {
    flex: 1, // Ocupa todo el espacio restante a la derecha
  },
});
