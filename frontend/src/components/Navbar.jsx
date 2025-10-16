"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../store/auth.jsx"

export default function Navbar() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <Link to="/dashboard" className="font-semibold text-yellow-600 text-2xl">
          Trustify
        </Link>
        <nav className="flex items-center gap-3">
          {!token ? (
            <>
              <Link className="text-yellow-600 hover:underline" to="/login">
                Login
              </Link>
              <Link className="text-yellow-600 hover:underline" to="/register">
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                👤 {user?.name || user?.email || "User"} • {user?.role === "admin" ? "Admin" : "User"}
              </span>
              <button
                onClick={() => {
                  logout()
                  navigate("/login", { replace: true })
                }}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
