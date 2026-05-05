"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { generateId } from "./utils"

export interface FileItem {
  id: string
  name: string
  smartName?: string
  originalName: string
  type: "image" | "document"
  mimeType: string
  size: number
  uploadedAt: Date
  thumbnail?: string
  shared: boolean
  shareLink?: string
}

interface FileContextType {
  files: FileItem[]
  addFile: (file: Omit<FileItem, "id" | "uploadedAt">) => FileItem
  updateFile: (id: string, updates: Partial<FileItem>) => void
  deleteFile: (id: string) => void
  generateSmartName: (file: FileItem) => Promise<string>
  shareFile: (id: string) => string
  unshareFile: (id: string) => void
}

const FileContext = createContext<FileContextType | undefined>(undefined)

// Smart name generation patterns based on file type
const smartNamePatterns = {
  image: [
    "product-photo-{year}.{ext}",
    "team-meeting-snapshot-{month}-{year}.{ext}",
    "marketing-banner-v{version}.{ext}",
    "client-presentation-hero.{ext}",
    "social-media-post-{date}.{ext}",
  ],
  document: [
    "quarterly-report-q{quarter}-{year}.{ext}",
    "project-proposal-{client}-{year}.{ext}",
    "contract-agreement-{date}.{ext}",
    "meeting-notes-{month}-{day}.{ext}",
    "invoice-{number}-{year}.{ext}",
  ],
}

export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileItem[]>([])

  useEffect(() => {
    const storedFiles = localStorage.getItem("docvault_files")
    if (storedFiles) {
      const parsed = JSON.parse(storedFiles)
      setFiles(
        parsed.map((f: FileItem) => ({
          ...f,
          uploadedAt: new Date(f.uploadedAt),
        }))
      )
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("docvault_files", JSON.stringify(files))
  }, [files])

  const addFile = (fileData: Omit<FileItem, "id" | "uploadedAt">) => {
    const newFile: FileItem = {
      ...fileData,
      id: generateId(),
      uploadedAt: new Date(),
    }
    setFiles((prev) => [newFile, ...prev])
    return newFile
  }

  const updateFile = (id: string, updates: Partial<FileItem>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    )
  }

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const generateSmartName = async (file: FileItem): Promise<string> => {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const now = new Date()
    const ext = file.originalName.split(".").pop() || ""
    const patterns = smartNamePatterns[file.type]
    const pattern = patterns[Math.floor(Math.random() * patterns.length)]

    // Generate contextual smart name
    const smartName = pattern
      .replace("{year}", now.getFullYear().toString())
      .replace("{month}", (now.getMonth() + 1).toString().padStart(2, "0"))
      .replace("{day}", now.getDate().toString().padStart(2, "0"))
      .replace("{date}", now.toISOString().split("T")[0])
      .replace("{quarter}", Math.ceil((now.getMonth() + 1) / 3).toString())
      .replace("{version}", Math.floor(Math.random() * 10 + 1).toString())
      .replace("{number}", Math.floor(Math.random() * 9000 + 1000).toString())
      .replace("{client}", "parkshore-marble")
      .replace("{ext}", ext)

    return smartName
  }

  const shareFile = (id: string): string => {
    const shareLink = `https://docvault.app/share/${id}`
    updateFile(id, { shared: true, shareLink })
    return shareLink
  }

  const unshareFile = (id: string) => {
    updateFile(id, { shared: false, shareLink: undefined })
  }

  return (
    <FileContext.Provider
      value={{
        files,
        addFile,
        updateFile,
        deleteFile,
        generateSmartName,
        shareFile,
        unshareFile,
      }}
    >
      {children}
    </FileContext.Provider>
  )
}

export function useFiles() {
  const context = useContext(FileContext)
  if (context === undefined) {
    throw new Error("useFiles must be used within a FileProvider")
  }
  return context
}
