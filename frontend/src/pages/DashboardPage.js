import React, { useEffect, useState } from 'react';

export default function DashboardPage({ setAuth }) {
  const [message, setMessage] = useState('A carregar...');

  useEffect(() => {
    fetch('http://localhost:8080/dashboard', {
      method: 'GET',
      credentials: 'include', // CRÍTICO: Envia o cookie JSESSIONID
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(res => {
      if (res.ok) return res.text();
      if (res.status === 403 || res.status === 401) {
        throw new Error('Sessão expirada ou acesso negado (403)');
      }
      throw new Error('Erro desconhecido');
    })
    .then(data => setMessage(data))
    .catch(err => {
      setMessage(err.message);
      // Se quiseres expulsar o user para o login:
      // setAuth(false); 
    });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ color: message.includes('Erro') ? 'red' : 'black' }}>
        {message}
      </p>
    </div>
  );
}