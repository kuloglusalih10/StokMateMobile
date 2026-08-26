import { Platform } from 'react-native';

const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_BASE_URL = `http://${HOST}:5080`;

export { API_BASE_URL };
