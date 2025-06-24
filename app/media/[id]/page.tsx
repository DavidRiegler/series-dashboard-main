"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore"
import Image from "next/image"
import { db } from "@/lib/firebase"
import type { MediaItem } from "@/lib/types"
import { useAuth } from "@/app/components/AuthProvider"
import AuthGuard from "@/app/components/AuthGuard"
import AddMediaModal from "@/app/components/AddMediaModal"
import ConfirmDialog from "@/app/components/ConfirmDialog"

export default function MediaDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<MediaItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchMediaItem = useCallback(async () => {
    try {
      const docRef = doc(db, "media", params.id as string)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        setItem({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as MediaItem)
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching media item:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    if (params.id && user) {
      fetchMediaItem()
    }
  }, [params.id, user, fetchMediaItem])

  const handleEdit = () => {
    setEditingItem(item)
  }

  const handleEditMedia = async (mediaData: Partial<MediaItem>) => {
    if (!editingItem) return

    try {
      const docRef = doc(db, "media", editingItem.id)
      await updateDoc(docRef, {
        ...mediaData,
        updatedAt: new Date(),
      })

      fetchMediaItem()
      setEditingItem(null)
    } catch (error) {
      console.error("Error editing media:", error)
    }
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!item) return
    try {
      await deleteDoc(doc(db, "media", item.id))
      router.push("/")
    } catch (error) {
      console.error("Error deleting media:", error)
    }
  }

  const getMetaText = () => {
    if (!item) return ""
    switch (item.type) {
      case "movie":
        return item.duration || "Unknown duration"
      case "series":
        return `${item.seasons || 0} Seasons, ${item.episodes || 0} Episodes`
      case "book":
        return `${item.pages || 0} pages`
      default:
        return ""
    }
  }

  const getTypeIcon = () => {
    if (!item) return "📄"
    switch (item.type) {
      case "movie":
        return "🎬"
      case "series":
        return "📺"
      case "book":
        return "📚"
      default:
        return "📄"
    }
  }

  const formatDate = (date: Date | string | { seconds: number } | null | undefined): string => {
    try {
      if (!date) return "Unknown date"

      if (date instanceof Date) {
        return date.toLocaleDateString()
      }

      if (typeof date === "string") {
        return new Date(date).toLocaleDateString()
      }

      if (typeof date === "object" && "seconds" in date) {
        return new Date(date.seconds * 1000).toLocaleDateString()
      }

      return "Unknown date"
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Unknown date"
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="detail-page">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!item) {
    return (
      <AuthGuard>
        <div className="detail-page">
          <div className="error-state">
            <h2>Item not found</h2>
            <button onClick={() => router.push("/")} className="btn-primary">
              Go Back Home
            </button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const isOwner = user?.uid === item.createdBy

  return (
    <AuthGuard>
      <div className="detail-page">
        <div className="detail-header-nav">
          <button onClick={() => router.back()} className="back-btn">
            ← Back
          </button>
          {isOwner && (
            <div className="detail-actions">
              <button onClick={handleEdit} className="btn-secondary">
                Edit
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="detail-container">
          <div className="detail-hero">
            <div className="detail-image-container">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.title}
                  width={300}
                  height={400}
                  className="detail-image"
                />
              ) : (
                <div className="detail-image-placeholder">{getTypeIcon()}</div>
              )}
            </div>

            <div className="detail-info">
              <div className="detail-type-badge">
                {getTypeIcon()} {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </div>

              <h1 className="detail-title">{item.title}</h1>

              <div className="detail-meta-grid">
                <div className="meta-card">
                  <span className="meta-label">Duration/Length</span>
                  <span className="meta-value">{getMetaText()}</span>
                </div>

                <div className="meta-card">
                  <span className="meta-label">Status</span>
                  <span className={`meta-value status-${item.status}`}>
                    {item.status === "finished" ? "✅ Finished" : "⏳ Unfinished"}
                  </span>
                </div>

                <div className="meta-card">
                  <span className="meta-label">Rating</span>
                  <div className="rating-display">
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`star ${star <= item.rating ? "filled" : ""}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="rating-text">{item.rating.toFixed(1)} / 5.0</span>
                  </div>
                </div>

                <div className="meta-card">
                  <span className="meta-label">Added by</span>
                  <span className="meta-value">{item.createdByName}</span>
                </div>

                <div className="meta-card">
                  <span className="meta-label">Date Added</span>
                  <span className="meta-value">{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-description">
            <h2>Description</h2>
            <p>{item.description || "No description available."}</p>
          </div>
        </div>

        {editingItem && (
          <AddMediaModal
            isOpen={!!editingItem}
            onClose={() => setEditingItem(null)}
            onSubmit={handleEditMedia}
            editItem={editingItem}
          />
        )}

        {showDeleteConfirm && (
          <ConfirmDialog
            open={showDeleteConfirm}
            title="Delete Item"
            message="Are you sure you want to delete this item? This action cannot be undone."
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={async () => {
              setShowDeleteConfirm(false)
              await confirmDelete()
            }}
          />
        )}
      </div>
    </AuthGuard>
  )
}