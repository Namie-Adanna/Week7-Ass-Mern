import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              Naly Blog
            </Link>
            <nav className="nav">
              <Link to="/">Home</Link>
              {user ? (
                <>
                  <Link to="/create-post">Create Post</Link>
                  <span>Welcome, {user.name}</span>
                  <button onClick={logout} className="btn btn-secondary">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="container">
        {children}
      </main>
    </div>
  )
}

export default Layout