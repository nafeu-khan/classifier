import axios from 'axios';
import Cookies from 'js-cookie';

export function isLoggedIn() {
    const token = Cookies.get('token'); 
    return !!token; 
}

export function logout() {
    Cookies.remove('token');
    Cookies.remove('refresh');
    window.location.reload();
}

export function getToken() {
    return Cookies.get('token');
}