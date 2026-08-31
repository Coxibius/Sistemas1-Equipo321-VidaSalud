import axios from 'axios';
import { Platform } from 'react-native';

export const API_BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:5237/api'
    : 'http://172.30.16.128:5237/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});
