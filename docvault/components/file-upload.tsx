'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { useFiles } from '@/lib/file-context'
import { Button } from '@/components/ui/button'
import { AINamingModal } from './ai-naming-modal'

interface PendingFile {
  id: string
  file: File
  progress: number
}

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [namingFile, setNamingFile] = useState<PendingFile | null>(null)
  const { addFile } = useFiles()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      processFiles(files)
    }
  }

  const processFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isPdf = file.type === 'application/pdf'
      const size = file.size / 1024 / 1024 // MB
      return (isImage || isPdf) && size <= 50
    })

    validFiles.forEach(file => {
      const id = Math.random().toString(36).substr(2, 9)
      const pending: PendingFile = { id, file, progress: 0 }
      setPendingFiles(prev => [...prev, pending])
      
      // Simulate upload with progress
      simulateUpload(id, file)
    })
  }

  const simulateUpload = (id: string, file: File) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 90) {
        clearInterval(interval)
        setPendingFiles(prev =>
          prev.map(f => f.id === id ? { ...f, progress: 90 } : f)
        )
      } else {
        setPendingFiles(prev =>
          prev.map(f => f.id === id ? { ...f, progress } : f)
        )
      }
    }, 300)
  }

  const handleAINaming = (pendingFile: PendingFile) => {
    setNamingFile(pendingFile)
  }

  const handleConfirmName = (newName: string) => {
    if (namingFile) {
      const ext = namingFile.file.name.substring(namingFile.file.name.lastIndexOf('.'))
      const fileWithExt = newName.includes('.') ? newName : `${newName}${ext}`
      
      addFile({
        name: fileWithExt,
        originalName: namingFile.file.name,
        type: namingFile.file.type.startsWith('image/') ? 'image' : 'document',
        mimeType: namingFile.file.type,
        size: namingFile.file.size,
        shared: false
      })

      setPendingFiles(prev => prev.filter(f => f.id !== namingFile.id))
      setNamingFile(null)
    }
  }

  const handleSkip = () => {
    if (namingFile) {
      addFile({
        name: namingFile.file.name,
        originalName: namingFile.file.name,
        type: namingFile.file.type.startsWith('image/') ? 'image' : 'document',
        mimeType: namingFile.file.type,
        size: namingFile.file.size,
        shared: false
      })

      setPendingFiles(prev => prev.filter(f => f.id !== namingFile.id))
      setNamingFile(null)
    }
  }

  const removeFile = (id: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== id))
  }

  return (
    <>
      <div
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileInput}
          className="hidden"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <Upload className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-white mb-2">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-zinc-400">
            Supports images and PDFs up to 50MB
          </p>
        </label>
      </div>

      {pendingFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-300">Uploading</h3>
          {pendingFiles.map(pf => (
            <div key={pf.id} className="bg-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-zinc-300 truncate">{pf.file.name}</p>
                <button
                  onClick={() => removeFile(pf.id)}
                  className="p-1 hover:bg-zinc-700 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2 mb-3">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(pf.progress, 90)}%` }}
                />
              </div>
              {pf.progress >= 90 && (
                <Button
                  onClick={() => handleAINaming(pf)}
                  variant="outline"
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 border-0 text-white"
                >
                  Generate Smart Name
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {namingFile && (
        <AINamingModal
          fileName={namingFile.file.name}
          onConfirm={handleConfirmName}
          onSkip={handleSkip}
        />
      )}
    </>
  )
}
