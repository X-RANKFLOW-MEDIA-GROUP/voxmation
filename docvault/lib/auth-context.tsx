"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("docvault_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newUser: User = {
      id: "1",
      email,
      name: email.split("@")[0],
    }
    setUser(newUser)
    localStorage.setItem("docvault_user", JSON.stringify(newUser))
  }

  const loginWithGoogle = async () => {
    // Simulate Google OAuth
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newUser: User = {
      id: "1",
      email: "user@gmail.com",
      name: "Google User",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
    }
    setUser(newUser)
    localStorage.setItem("docvault_user", JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("docvault_user")
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
