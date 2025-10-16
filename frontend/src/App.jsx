"use client"
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import { AuthProvider, useAuth } from "./store/auth.jsx"
import Navbar from "./components/Navbar.jsx"

function Protected({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Protected>
                  <Dashboard />
                </Protected>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<div className="p-6">Not Found</div>} />
          </Routes>
        </main>
        <footer className="text-center text-sm text-gray-500 py-4">Trustify</footer>
      </div>
    </AuthProvider>
  )
}
