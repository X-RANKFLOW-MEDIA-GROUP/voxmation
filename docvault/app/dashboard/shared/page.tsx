'use client'

import { useMemo } from 'react'
import { Share2 } from 'lucide-react'
import { useFiles } from '@/lib/file-context'

export default function SharedPage() {
  const { files } = useFiles()
  
  const sharedFiles = useMemo(
    () => files.filter(f => f.shared),
    [files]
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Shared</h1>
        <p className="text-zinc-400">Files you've shared with others</p>
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Share2 className="w-12 h-12 text-zinc-600 mb-4" />
        <p className="text-lg font-semibold text-zinc-300">No shared files yet</p>
        <p className="text-sm text-zinc-500">Click "Share" on any file to get started</p>
      </div>
    </div>
  )
}
