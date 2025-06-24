"use client"

import type React from "react"

import { useState } from "react"
import type { MediaItem } from "@/lib/types"

interface AddMediaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<MediaItem>) => Promise<void>
  editItem?: MediaItem | null
}

export default function AddMediaModal({ isOpen, onClose, onSubmit, editItem }: AddMediaModalProps) {
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(editItem?.imageUrl || "")
  const [formData, setFormData] = useState({
    title: editItem?.title || "",
    description: editItem?.description || "",
    type: editItem?.type || "movie",
    duration: editItem?.duration || "",
    seasons: editItem?.seasons || 0,
    episodes: editItem?.episodes || 0,
    pages: editItem?.pages || 0,
    status: editItem?.status || "finished",
    rating: editItem?.rating || 5,
    imageUrl: editItem?.imageUrl || "",
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.imageUrl) {
        alert('Bitte geben Sie eine Bild-URL ein.')
        setLoading(false)
        return
      }

      const submitData: Partial<MediaItem> = {
        title: formData.title,
        description: formData.description,
        type: formData.type as "movie" | "series" | "book",
        status: formData.status as "finished" | "unfinished",
        rating: formData.rating,
        imageUrl: formData.imageUrl,
      }

      // Add type-specific fields
      if (formData.type === "movie") {
        submitData.duration = formData.duration
      } else if (formData.type === "series") {
        submitData.seasons = formData.seasons
        submitData.episodes = formData.episodes
      } else if (formData.type === "book") {
        submitData.pages = formData.pages
      }

      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      alert('Fehler beim Speichern der Daten')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFormData(prev => ({ ...prev, imageUrl: url }))
    setImagePreview(url)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editItem ? "Edit Media" : "Add New Media"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as "movie" | "series" | "book" }))}
                >
                  <option value="movie">🎬 Movie</option>
                  <option value="series">📺 Series</option>
                  <option value="book">📚 Book</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as "finished" | "unfinished" }))}
                >
                  <option value="finished">✅ Finished</option>
                  <option value="unfinished">⏳ Unfinished</option>
                </select>
              </div>
            </div>

            {formData.type === "movie" && (
              <div className="form-group">
                <label className="form-label">Duration (e.g., &quot;1h 45m&quot;)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.duration}
                  onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                  placeholder="1h 45m"
                />
              </div>
            )}

            {formData.type === "series" && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Seasons</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.seasons === 0 ? "" : formData.seasons}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        seasons: e.target.value === "" ? 0 : Number(e.target.value)
                      }))
                    }
                    onFocus={e => {
                      if (e.target.value === "0") e.target.value = "";
                    }}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Episodes per season</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.episodes === 0 ? "" : formData.episodes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        episodes: e.target.value === "" ? 0 : Number(e.target.value)
                      }))
                    }
                    onFocus={e => {
                      if (e.target.value === "0") e.target.value = "";
                    }}
                    min="0"
                  />
                </div>
              </div>
            )}

            {formData.type === "book" && (
              <div className="form-group">
                <label className="form-label">Pages</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.pages}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pages: Number.parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Rating (1-5 stars)</label>
              <input
                type="number"
                className="form-input"
                value={formData.rating}
                onChange={(e) => setFormData((prev) => ({ ...prev, rating: Number.parseFloat(e.target.value) || 1 }))}
                min="1"
                max="5"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="url"
                className="form-input"
                value={formData.imageUrl}
                onChange={handleImageUrlChange}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            {imagePreview && (
              <div className="image-preview-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="image-preview"
                  onError={() => {
                    setImagePreview("")
                    setFormData(prev => ({ ...prev, imageUrl: "" }))
                    alert("Invalid Image-URL")
                  }}
                />
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : editItem ? "Update" : "Add Media"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}