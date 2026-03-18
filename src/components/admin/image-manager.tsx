"use client"

import { useState, useCallback } from "react"
import { ChevronUp, ChevronDown, Star, Trash2, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface VehicleImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
  sortOrder: number
}

interface ImageManagerProps {
  vehicleId: string
  images: VehicleImage[]
  onImagesChange: (images: VehicleImage[]) => void
}

export function ImageManager({ vehicleId, images, onImagesChange }: ImageManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<VehicleImage | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      setUploading(true)
      try {
        for (const file of Array.from(files)) {
          const formData = new FormData()
          formData.append("file", file)

          const res = await fetch(`/api/admin/vehicles/${vehicleId}/images`, {
            method: "POST",
            body: formData,
          })

          if (!res.ok) {
            toast.error("Something went wrong. Please try again.")
            continue
          }

          const newImage = await res.json()
          onImagesChange([...images, newImage])
        }
      } catch {
        toast.error("Something went wrong. Please try again.")
      } finally {
        setUploading(false)
        e.target.value = ""
      }
    },
    [vehicleId, images, onImagesChange],
  )

  const handleReorder = useCallback(
    async (index: number, direction: "up" | "down") => {
      const swapIndex = direction === "up" ? index - 1 : index + 1
      if (swapIndex < 0 || swapIndex >= images.length) return

      const updated = [...images]
      const tempOrder = updated[index].sortOrder
      updated[index] = { ...updated[index], sortOrder: updated[swapIndex].sortOrder }
      updated[swapIndex] = { ...updated[swapIndex], sortOrder: tempOrder }
      // Swap positions in array
      ;[updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]]

      // Optimistic update
      onImagesChange(updated)

      try {
        const res = await fetch(`/api/admin/vehicles/${vehicleId}/images`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: updated.map((img) => ({ id: img.id, sortOrder: img.sortOrder })),
          }),
        })

        if (!res.ok) {
          // Revert
          onImagesChange(images)
          toast.error("Something went wrong. Please try again.")
        }
      } catch {
        onImagesChange(images)
        toast.error("Something went wrong. Please try again.")
      }
    },
    [vehicleId, images, onImagesChange],
  )

  const handleSetPrimary = useCallback(
    async (imageId: string) => {
      const updated = images.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      }))

      // Optimistic update
      onImagesChange(updated)

      try {
        const res = await fetch(`/api/admin/vehicles/${vehicleId}/images`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ primaryImageId: imageId }),
        })

        if (!res.ok) {
          onImagesChange(images)
          toast.error("Something went wrong. Please try again.")
        }
      } catch {
        onImagesChange(images)
        toast.error("Something went wrong. Please try again.")
      }
    },
    [vehicleId, images, onImagesChange],
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      const res = await fetch(
        `/api/admin/vehicles/${vehicleId}/images?imageId=${deleteTarget.id}`,
        { method: "DELETE" },
      )

      if (!res.ok) {
        toast.error("Something went wrong. Please try again.")
        return
      }

      onImagesChange(images.filter((img) => img.id !== deleteTarget.id))
      toast.success("Image deleted")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }, [vehicleId, deleteTarget, images, onImagesChange])

  if (images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button asChild disabled={uploading} variant="outline">
            <label className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Add Images"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </Button>
          {uploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-12 text-center">
          <h3 className="text-lg font-semibold">No images yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload photos to showcase this vehicle.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button asChild disabled={uploading} variant="outline">
          <label className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Add Images"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </Button>
        {uploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {images.map((image, index) => (
          <div key={image.id} className="relative aspect-square rounded-md overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.alt}
              className="h-full w-full object-cover"
            />

            {/* Top-right: Star + Trash */}
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => handleSetPrimary(image.id)}
                aria-label="Set as primary image"
                className="rounded bg-black/50 p-1 text-white hover:bg-black/70"
              >
                <Star
                  className="h-4 w-4"
                  fill={image.isPrimary ? "currentColor" : "none"}
                />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(image)}
                aria-label="Delete image"
                className="rounded bg-black/50 p-1 text-white hover:bg-black/70"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Bottom-center: Reorder arrows */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => handleReorder(index, "up")}
                disabled={index === 0}
                aria-label="Move image up"
                className="rounded bg-black/50 p-1 text-white hover:bg-black/70 disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleReorder(index, "down")}
                disabled={index === images.length - 1}
                aria-label="Move image down"
                className="rounded bg-black/50 p-1 text-white hover:bg-black/70 disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Primary badge */}
            {image.isPrimary && (
              <div className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                Primary
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              This image will be permanently removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Keep Image
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
