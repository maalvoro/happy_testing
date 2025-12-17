import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10, // Número de usuarios virtuales
  duration: '30s', // Duración de la prueba
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de las requests deben ser < 500ms
  },
};

export default function () {
  // Prueba de login
  let loginPayload = JSON.stringify({
    email: 'test@nutriapp.com',
    password: 'nutriapp123',
  });
  let loginResponse = http.post('http://localhost:3000/api/login', loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(loginResponse, { 'login status is 200': (r) => r.status === 200 });

  // Prueba de obtener dishes (usa cookies automáticamente)
  let dishesResponse = http.get('http://localhost:3000/api/dishes');
  check(dishesResponse, { 'dishes status is 200': (r) => r.status === 200 });

  sleep(1); // Pausa entre iteraciones
}