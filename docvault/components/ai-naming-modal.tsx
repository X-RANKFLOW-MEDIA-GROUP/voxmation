'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface AINamingModalProps {
  fileName: string
  onConfirm: (newName: string) => void
  onSkip: () => void
}

export function AINamingModal({ fileName, onConfirm, onSkip }: AINamingModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [suggestedName, setSuggestedName] = useState('')
  const [editedName, setEditedName] = useState('')

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      const suggestions = [
        'project-proposal-2026.pdf',
        'contract-agreement-signed.pdf',
        'invoice-march-2026.pdf',
        'financial-report-q1.pdf',
        'marketing-presentation-v2.pdf',
        'team-handbook-updated.pdf',
        'partnership-agreement.pdf',
        'budget-allocation-2026.pdf',
      ]
      const suggested = suggestions[Math.floor(Math.random() * suggestions.length)]
      setSuggestedName(suggested)
      setEditedName(suggested)
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Dialog open={true}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Generate Smart Name</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
            <p className="text-sm text-zinc-400">Analyzing file...</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">Original name</p>
              <p className="text-sm text-zinc-300 bg-zinc-800 rounded px-3 py-2 truncate">
                {fileName}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">AI Suggested name</p>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
              />
              <p className="text-xs text-zinc-500 mt-1">
                You can edit or accept the suggestion
              </p>
            </div>
          </div>
        )}

        {!isLoading && (
          <DialogFooter className="gap-2">
            <Button
              onClick={onSkip}
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Skip
            </Button>
            <Button
              onClick={() => onConfirm(editedName)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
