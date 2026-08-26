import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Sidebar } from './components/Sidebar';
import { RegistrarProductoScreen } from './screens/RegistrarProductoScreen';

export default function App() {
  // Guardamos en el estado qué pantalla está viendo el usuario
  const [pantallaActual, setPantallaActual] = useState('productos');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.mainLayout}>
        {/* 1. Menú lateral a la izquierda */}
        <Sidebar
          pantallaActual={pantallaActual}
          alSeleccionar={(pantalla) => setPantallaActual(pantalla)}
        />

        {/* 2. Área principal de contenido a la derecha */}
        <View style={styles.contentArea}>
          {pantallaActual === 'productos' && (
            <RegistrarProductoScreen
              alCancelar={() => alert('Operación cancelada')}
              alGuardarExitoso={() => alert('¡Producto guardado!')}
            />
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