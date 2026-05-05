"use client"

import { AuthProvider } from "@/lib/auth-context"
import { FileProvider } from "@/lib/file-context"
import { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <FileProvider>{children}</FileProvider>
    </AuthProvider>
  )
}
