'use client'

import { FileGrid } from '@/components/file-grid'
import { FileUpload } from '@/components/file-upload'
import { useFiles } from '@/lib/file-context'
import { useMemo } from 'react'

export default function ImagesPage() {
  const { files } = useFiles()
  
  const imageFiles = useMemo(
    () => files.filter(f => f.type === 'image'),
    [files]
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Images</h1>
        <p className="text-zinc-400">View and manage your image files</p>
      </div>

      {imageFiles.length === 0 && (
        <div className="bg-zinc-800 rounded-lg p-8">
          <FileUpload />
        </div>
      )}

      {imageFiles.length > 0 && (
        <div>
          <FileGrid filterCategory="image" />
        </div>
      )}
    </div>
  )
}
