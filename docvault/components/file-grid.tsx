'use client'

import { useState } from 'react'
import { File as FileIcon, Image as ImageIcon, Share2, MoreVertical, Grid3x3, List } from 'lucide-react'
import { useFiles } from '@/lib/file-context'
import { ShareModal } from './share-modal'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface FileGridProps {
  filterCategory?: 'image' | 'document'
}

export function FileGrid({ filterCategory }: FileGridProps) {
  const { files } = useFiles()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sharedFile, setSharedFile] = useState<string | null>(null)

  const filteredFiles = filterCategory
    ? files.filter(f => f.type === filterCategory)
    : files

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (filteredFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileIcon className="w-12 h-12 text-zinc-600 mb-4" />
        <p className="text-lg font-semibold text-zinc-300">No files yet</p>
        <p className="text-sm text-zinc-500">Upload files to get started</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end gap-2 mb-6">
        <Button
          onClick={() => setViewMode('grid')}
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          className={viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          <Grid3x3 className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => setViewMode('list')}
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          className={viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          <List className="w-4 h-4" />
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map(file => (
            <div
              key={file.id}
              className="bg-zinc-800 rounded-lg overflow-hidden hover:bg-zinc-750 transition-colors group"
            >
              <div className="aspect-square bg-zinc-900 flex items-center justify-center relative">
                {file.type === 'image' ? (
                  <ImageIcon className="w-12 h-12 text-zinc-600" />
                ) : (
                  <FileIcon className="w-12 h-12 text-zinc-600" />
                )}
                <button className="absolute top-2 right-2 p-2 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-white truncate mb-1">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-500 mb-3">
                  {formatFileSize(file.size)}
                </p>
                <Button
                  onClick={() => setSharedFile(file.id)}
                  size="sm"
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                >
                  <Share2 className="w-3 h-3 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map(file => (
            <div
              key={file.id}
              className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between hover:bg-zinc-750 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {file.type === 'image' ? (
                  <ImageIcon className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                ) : (
                  <FileIcon className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatFileSize(file.size)} • {format(file.uploadedAt, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <Button
                  onClick={() => setSharedFile(file.id)}
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
                <button className="p-2 hover:bg-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {sharedFile && (
        <ShareModal
          fileName={filteredFiles.find(f => f.id === sharedFile)?.name || 'File'}
          onClose={() => setSharedFile(null)}
        />
      )}
    </div>
  )
}
