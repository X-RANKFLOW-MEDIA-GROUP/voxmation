'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface ShareModalProps {
  fileName: string
  onClose: () => void
}

export function ShareModal({ fileName, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${Math.random().toString(36).substr(2, 9)}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Share "{fileName}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-zinc-400">
            Share this link with others to give them access to this file.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 font-mono"
            />
            <Button
              onClick={handleCopy}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="bg-zinc-800 rounded p-3 text-xs text-zinc-400">
            <p className="font-semibold text-zinc-300 mb-1">Link expires in 30 days</p>
            <p>Anyone with this link can view and download the file.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
