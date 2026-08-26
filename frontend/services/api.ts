import axios from 'axios';

// URL de tu API REST .NET C#
export const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Emulador Android (o localhost:5000 en Web)

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});