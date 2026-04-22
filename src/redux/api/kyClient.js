import ky from 'ky';

const api = ky.create({
  prefix: 'https://nerdware-backend-eqil.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  retry: { limit: 2 },
});

export default api;
