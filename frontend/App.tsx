import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Sidebar } from './components/Sidebar';
import { RegistrarProductoScreen } from './screens/RegistrarProductoScreen';
import { ConsultarProductosScreen } from './screens/ConsultarProductosScreen';
import { RegistrarMovimientoScreen } from './screens/RegistrarMovimientoScreen';
import { VencimientosScreen } from './screens/VencimientosScreen';
import { LoginScreen } from './screens/LoginScreen';
import { UsuarioSesion } from './types/usuario';
import { GestionUsuariosScreen } from './screens/GestionUsuariosScreen';

export default function App() {
  // Guardamos en el estado qué pantalla está viendo el usuario
  const [pantallaActual, setPantallaActual] = useState('productos');
  const [usuarioActivo, setUsuarioActivo] = useState<UsuarioSesion | null>(null);

  const iniciarSesion = (usuario: UsuarioSesion) => {
    setUsuarioActivo(usuario);
    setPantallaActual('productos');
  };

  const cerrarSesion = () => {
    setUsuarioActivo(null);
    setPantallaActual('productos');
  };

  if (!usuarioActivo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <LoginScreen alIniciarSesion={iniciarSesion} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.mainLayout}>
        {/* 1. Menú lateral a la izquierda */}
        <Sidebar
          pantallaActual={pantallaActual === 'registrar-producto' ? 'productos' : pantallaActual}
          alSeleccionar={(pantalla) => setPantallaActual(pantalla)}
          usuario={usuarioActivo}
          alCerrarSesion={cerrarSesion}
        />

        {/* 2. Área principal de contenido a la derecha */}
        <View style={styles.contentArea}>
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
            <GestionUsuariosScreen />
          )}
        </View>
      </View>
    </SafeAreaView>
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
  contentArea: {
    flex: 1, // Ocupa todo el espacio restante a la derecha
  },
});
