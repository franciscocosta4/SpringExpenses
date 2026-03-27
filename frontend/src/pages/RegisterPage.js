import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:8080/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (res.ok) {
        setMessage("Registro feito com sucesso!");
        navigate("/login");
      } else {
        const msg = await res.text();
        setMessage(msg || "Erro no registo");
      }
    } catch (err) {
      setMessage("Erro de conexão");
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
