import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Point to our Express backend
  withCredentials: true, // Important for sending/receiving cookies!
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
