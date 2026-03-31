import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import IncomesPage from "./pages/IncomesPage";

export default function App() {
  const [auth, setAuth] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage setAuth={setAuth} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={auth ? <DashboardPage setAuth={setAuth} /> : <Navigate to="/login" />}
        />
        <Route
          path="/expenses"
          element={auth ? <ExpensesPage setAuth={setAuth} /> : <Navigate to="/login" />}
        />
        <Route
          path="/incomes"
          element={auth ? <IncomesPage setAuth={setAuth} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={auth ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}