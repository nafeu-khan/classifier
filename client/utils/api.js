import axios from 'axios';
import dotenv from 'dotenv';
import Cookies from 'js-cookie';
dotenv.config(); 

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshAccessToken = async () => {
  try {
    const refreshToken = Cookies.get('refresh');
    console.log("refrs",refreshToken)
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/token/refresh/`, {
      refresh: refreshToken,
    });

    Cookies.set('token', response.data.access);

    return response.data.access;
  } catch (error) {
    console.error('Error refreshing token:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const apiRequest = async (endpoint, method, token = null, data = null) => {
  try {
    const config = {
      url: endpoint,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = data;
    }
    const response = await api(config);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 || error.response.data?.code === 'token_not_valid') {
      try {
        const newAccessToken = await refreshAccessToken();
        return await apiRequest(endpoint, method, newAccessToken, data);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError.message);
        Cookies.remove('token');
        Cookies.remove('refresh');
        window.location.href = '/signin';
        throw refreshError;
      }
    }
    throw error;
  }
};

export default apiRequest;
