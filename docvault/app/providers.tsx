"use client"

import { AuthProvider } from "@/lib/auth-context"
import { FileProvider } from "@/lib/file-context"
import { ReactNode, useEffect } from "react"
import { initSentryClient, setUserContext, clearUserContext } from "@/sentry.client.config"

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize Sentry on client side
    initSentryClient()
  }, [])

  return (
    <AuthProvider>
      <FileProvider>{children}</FileProvider>
    </AuthProvider>
  )
}
