'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, X, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

const MAX_SIZE_MB  = 10
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']

interface PhotoUploadProps {
  onPhoto:  (file: File) => void
  disabled?: boolean
}

export default function PhotoUpload({ onPhoto, disabled }: PhotoUploadProps) {
  const [preview,   setPreview]   = useState<string | null>(null)
  const [fileName,  setFileName]  = useState<string | null>(null)
  const [dragging,  setDragging]  = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!ALLOWED_MIME.includes(file.type)) {
      toast.error('Only JPEG, PNG or WebP images allowed.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SIZE_MB}MB.`)
      return
    }
    setFileName(file.name)
    const url = URL.createObjectURL(file)
    setPreview(url)
    onPhoto(file)
  }, [onPhoto])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const clear = () => {
    setPreview(null)
    setFileName(null)
  }

  return (
    <div className="relative w-full">
      {preview ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900"
        >
          <Image
            src={preview}
            alt="Uploaded flood photo"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="text-xs text-white/80 truncate max-w-[80%]">{fileName}</span>
            <button
              onClick={clear}
              disabled={disabled}
              className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
              aria-label="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ) : (
        <label
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`
            flex flex-col items-center justify-center gap-3
            w-full aspect-video rounded-2xl cursor-pointer
            border-2 border-dashed transition-all duration-200
            ${dragging
              ? 'border-flood-500 bg-flood-500/10'
              : 'border-slate-700 hover:border-flood-500/60 bg-slate-900/40 hover:bg-slate-900/60'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
          `}
          aria-label="Upload flood photo â€” click or drag and drop"
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={onInputChange}
            disabled={disabled}
            className="sr-only"
            aria-hidden="true"
          />
          <div className="p-4 rounded-full bg-slate-800">
            <ImageIcon className="w-8 h-8 text-flood-400" aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">
              <span className="text-flood-400">Tap to photo</span> or drag here
            </p>
            <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP Â· max {MAX_SIZE_MB}MB</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Camera className="w-4 h-4" />
            <span>Camera access on mobile</span>
            <Upload className="w-4 h-4 ml-2" />
            <span>Or file upload</span>
          </div>
        </label>
      )}
    </div>
  )
}