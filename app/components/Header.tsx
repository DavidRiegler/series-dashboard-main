"use client"

import { useAuth } from "./AuthProvider"

interface HeaderProps {
  [key: string]: unknown
}

export default function Header({}: HeaderProps) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">EntertainHub</div>

        <div className="user-menu">
          <span className="user-name">@{user?.username}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
