import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const normalizarUrl = (url: string) => url.replace(/\/$/, '');

const resolverUrlApi = () => {
    const urlConfigurada = process.env.EXPO_PUBLIC_API_URL?.trim();
    if (urlConfigurada) {
        return normalizarUrl(urlConfigurada);
    }

    if (Platform.OS === 'web') {
        return 'http://localhost:5237/api';
    }

    // Expo Go publica la IP de la computadora que sirve Metro en hostUri.
    // Así el teléfono usa la red actual sin editar este archivo en cada Wi-Fi.
    const hostMetro = Constants.expoConfig?.hostUri?.split(':')[0];
    if (hostMetro) {
        return `http://${hostMetro}:5237/api`;
    }

    return 'http://localhost:5237/api';
};

export const API_BASE_URL = resolverUrlApi();

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 8000,
});
