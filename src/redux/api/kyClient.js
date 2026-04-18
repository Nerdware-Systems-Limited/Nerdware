import ky from 'ky';

const api = ky.create({
  prefix: 'http://localhost:5000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  retry: { limit: 2 },
});

export default api;