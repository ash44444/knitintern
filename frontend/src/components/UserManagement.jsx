import { useState, useEffect } from "react"
import api from "../api/client.js"
import { useAuth } from "../store/auth.jsx"

export default function UserManagement() {
  const { setMessage } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadUsers() {
    setLoading(true)
    setError("")
    try {
      const { data } = await api.get("/admin/users")
      // Properly extract users from the response
      setUsers(data.data.users || [])
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  async function updateUserRole(userId, newRole) {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      // Reload all users to ensure complete data is displayed
      await loadUsers()
      setMessage({ type: "success", text: "User role updated" })
    } catch (err) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Failed to update role" })
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  if (loading) return <div>Loading users...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="bg-white border rounded p-4">
      <h2 className="font-semibold mb-4">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Role</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {Array.isArray(users) && users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2">
                    <select
                      className="border rounded px-2 py-1"
                      value={user.role}
                      onChange={(e) => updateUserRole(user._id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-4 py-2 text-center text-gray-500">No users available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}