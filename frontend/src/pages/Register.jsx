"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../api/client.js"
import { useAuth } from "../store/auth.jsx"

export default function Register() {
  const navigate = useNavigate()
  const { setToken, setUser, setMessage } = useAuth()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      console.log('Sending registration data:', form)
      const { data } = await api.post("/auth/signup", form)
      setToken(data.data.token)
      setUser(data.data.user)
      setMessage({ type: "success", text: "Registered successfully" })
      navigate("/dashboard", { replace: true })
    } catch (err) {
      const errorData = err?.response?.data
      if (errorData?.details) {
        setError(errorData.details.map(d => d.message).join('\n'))
      } else {
        setError(errorData?.message || "Registration failed")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white border rounded p-6 mt-8">
      <h1 className="text-xl font-semibold mb-4">Register</h1>
      {error && <div className="mb-3 text-red-600 whitespace-pre-line">{error}</div>}
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
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
          {loading ? "Please wait..." : "Create account"}
        </button>
      </form>
      <p className="text-sm text-gray-600 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600">
          Login
        </Link>
      </p>
    </div>
  )
}
