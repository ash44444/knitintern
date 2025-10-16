"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import api from "../api/client.js"

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "")
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user")
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [message, setMessage] = useState(null)

  // Validate token on mount and set user
  useEffect(() => {
    if (token) {
      // Attempt to fetch user profile to validate token
      api.get("/users/me")
        .then(response => {
          if (response.data?.data?.user) {
            setUser(response.data.data.user);
          }
        })
        .catch(error => {
          console.error("Token validation failed:", error);
          // Clear invalid token
          setToken("");
          setUser(null);
        });
    }
  }, []);

  useEffect(() => {
    if (token) localStorage.setItem("token", token)
    else localStorage.removeItem("token")
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user))
    else localStorage.removeItem("user")
  }, [user])

  const value = useMemo(
    () => ({
      token,
      user,
      message,
      setToken,
      setUser,
      setMessage,
      logout: () => {
        setToken("")
        setUser(null)
        setMessage({ type: "success", text: "Logged out" })
      },
    }),
    [token, user, message],
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
