import ky from 'ky';
const API_URL = import.meta.env.VITE_API_URL;
const api = ky.create({
  prefix: API_URL+'/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  retry: { limit: 2 },
});

export default api;
