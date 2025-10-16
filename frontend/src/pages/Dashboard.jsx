"use client"

import { useEffect, useState } from "react"
import api from "../api/client.js"
import { useAuth } from "../store/auth.jsx"
import ProductForm from "../components/ProductForm.jsx"
import UserManagement from "../components/UserManagement.jsx"

export default function Dashboard() {
  const { user, message, setMessage } = useAuth()
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const username = profile?.name || user?.name || "User"

  async function load() {
    setLoading(true)
    setError("")
    try {
      const [me, list] = await Promise.all([api.get("/users/me"), api.get("/products")])
      setProfile(me.data.data)
      // Handle both data formats - direct array or nested in products property
      const productData = list.data.data;
      setProducts(Array.isArray(productData) ? productData : (productData?.products || []))
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function createProduct(payload) {
    try {
      await api.post("/products", payload)
      setMessage({ type: "success", text: "Product created" })
      setShowForm(false)
      await load()
    } catch (err) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Create failed" })
    }
  }

  async function updateProduct(id, payload) {
    try {
      await api.patch(`/products/${id}`, payload)
      setMessage({ type: "success", text: "Product updated" })
      setEditing(null)
      await load()
    } catch (err) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Update failed" })
    }
  }

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return
    try {
      await api.delete(`/products/${id}`)
      setMessage({ type: "success", text: "Product deleted" })
      await load()
    } catch (err) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Delete failed" })
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
      {message && (
        <div
          className={`mb-3 px-3 py-2 rounded ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}
      {error && <div className="mb-3 text-red-600">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <section className="mb-6 bg-white border rounded p-4">
            <h2 className="font-semibold mb-2">Profile</h2>
            <div className="text-sm text-gray-700">
              <div>Name: {profile?.name}</div>
              <div>Email: {profile?.email}</div>
              <div>Role: {profile?.role}</div>
            </div>
          </section>

          {user?.role === "admin" && (
            <section className="mb-6">
              <UserManagement />
            </section>
          )}

          <section className="bg-white border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Products</h2>
              {user?.role === "admin" && (
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={() => {
                    setShowForm(true)
                    setEditing(null)
                  }}
                >
                  Add Product
                </button>
              )}
            </div>

            {showForm && user?.role === "admin" && (
              <div className="mb-4 border rounded p-3">
                <h3 className="font-medium mb-2">New Product</h3>
                <ProductForm onSubmit={createProduct} onCancel={() => setShowForm(false)} />
              </div>
            )}

            <ul className="divide-y">
              {Array.isArray(products) && products.length > 0 ? (
                products.map((p) => (
                  <li key={p._id} className="py-3">
                    {editing === p._id ? (
                    <div className="border rounded p-3">
                      <h3 className="font-medium mb-2">Edit Product</h3>
                      <ProductForm
                        initial={{ name: p.name, price: p.price, description: p.description }}
                        onSubmit={(payload) => updateProduct(p._id, payload)}
                        onCancel={() => setEditing(null)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-600">${p.price.toFixed(2)}</div>
                        {p.description && <div className="text-sm text-gray-700">{p.description}</div>}
                      </div>
                      {user?.role === "admin" && (
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => setEditing(p._id)}>
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 bg-red-600 text-white rounded"
                            onClick={() => deleteProduct(p._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))
              ) : (
                <li className="py-3 text-gray-500">No products available</li>
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}

