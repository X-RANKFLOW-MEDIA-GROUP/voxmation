'use client'

import { FileUpload } from '@/components/file-upload'
import { FileGrid } from '@/components/file-grid'

export default function AllFilesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">All Files</h1>
        <p className="text-zinc-400">Manage all your documents and images</p>
      </div>

      <div className="bg-zinc-800 rounded-lg p-8">
        <FileUpload />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Your Files</h2>
        <FileGrid />
      </div>
    </div>
  )
}
