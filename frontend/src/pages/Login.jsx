"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../api/client.js"
import { useAuth } from "../store/auth.jsx"

export default function Login() {
  const navigate = useNavigate()
  const { setToken, setUser, setMessage } = useAuth()
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { data } = await api.post("/auth/login", form)
      setToken(data.data.token)
      setUser(data.data.user)
      setMessage({ type: "success", text: "Logged in" })
      navigate("/dashboard", { replace: true })
    } catch (err) {
      const errorData = err?.response?.data
      if (errorData?.details) {
        setError(errorData.details.map(d => d.message).join('\n'))
      } else {
        setError(errorData?.message || "Login failed")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin(credentials) {
    setForm(credentials)
    setError("")
    setLoading(true)

    try {
      const { data } = await api.post("/auth/login", credentials)
      setToken(data.data.token)
      setUser(data.data.user)
      setMessage({ type: "success", text: "Logged in" })
      navigate("/dashboard", { replace: true })
    } catch (err) {
      const errorData = err?.response?.data
      if (errorData?.details) {
        setError(errorData.details.map(d => d.message).join('\n'))
      } else {
        setError(errorData?.message || "Login failed")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      {/* Main Login Form */}
      <div className="bg-white border rounded p-6 mb-6">
        <h1 className="text-xl font-semibold mb-4">Login to SecureGate</h1>
        {error && <div className="mb-3 text-red-600 whitespace-pre-line">{error}</div>}
        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            className="w-full border rounded px-3 py-2"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="w-full border rounded px-3 py-2"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button disabled={loading} className="w-full bg-blue-600 text-white rounded py-2">
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          No account?{" "}
          <Link to="/register" className="text-blue-600">
            Register
          </Link>
        </p>
      </div>

      {/* Demo Access Section */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded p-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <span className="mr-2">🔑</span>
          Demo Access
        </h2>

        <div className="space-y-4">
          {/* Admin Account */}
          <div className="bg-white border rounded p-4">
            <h3 className="font-medium mb-2 text-blue-800">Demo Admin Account</h3>
            <div className="space-y-1 text-sm mb-3">
              <p><span className="text-gray-600">Name:</span> Admin User</p>
              <p><span className="text-gray-600">Email:</span> admin@example.com</p>
              <p><span className="text-gray-600">Password:</span> admin123</p>
              <p><span className="text-gray-600">Role:</span> <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">admin</span></p>
            </div>
            <button
              onClick={() => handleDemoLogin({ email: "admin@example.com", password: "admin123" })}
              className="w-full bg-blue-100 text-blue-800 rounded py-1.5 text-sm hover:bg-blue-200 transition-colors"
            >
              Login as Admin
            </button>
          </div>

          {/* Regular User Account */}
          <div className="bg-white border rounded p-4">
            <h3 className="font-medium mb-2 text-green-800">Demo User Account</h3>
            <div className="space-y-1 text-sm mb-3">
              <p><span className="text-gray-600">Name:</span> Regular User</p>
              <p><span className="text-gray-600">Email:</span> user@example.com</p>
              <p><span className="text-gray-600">Password:</span> user123</p>
              <p><span className="text-gray-600">Role:</span> <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">user</span></p>
            </div>
            <button
              onClick={() => handleDemoLogin({ email: "user@example.com", password: "user123" })}
              className="w-full bg-green-100 text-green-800 rounded py-1.5 text-sm hover:bg-green-200 transition-colors"
            >
              Login as User
            </button>
          </div>
        </div>


      </div>
    </div>
  )
}
