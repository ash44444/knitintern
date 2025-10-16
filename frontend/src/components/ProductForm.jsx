"use client"

import { useEffect, useState } from "react"

export default function ProductForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (initial) {
      setName(initial.name || "")
      setPrice(String(initial.price ?? ""))
      setDescription(initial.description || "")
    }
  }, [initial])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ name, description, price: Number(price) })
      }}
      className="space-y-3"
    >
      <div>
        <label className="block text-sm text-gray-700">Name</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700">Price</label>
        <input
          className="w-full border rounded px-3 py-2"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700">Description</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Save
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded">
          Cancel
        </button>
      </div>
    </form>
  )
}
