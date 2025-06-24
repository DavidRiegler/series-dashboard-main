"use client"

import { useEffect } from "react"
import Image from "next/image"
import type { MediaItem } from "@/lib/types"
import { useAuth } from "./AuthProvider"

interface MediaDetailProps {
  item: MediaItem
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

export default function MediaDetail({ item, onEdit, onDelete, onClose }: MediaDetailProps) {
  const { user } = useAuth()
  const isOwner = user?.uid === item.createdBy

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  const getMetaText = () => {
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

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="star filled">
            ★
          </span>,
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="star half-filled">
            ★
          </span>,
        )
      } else {
        stars.push(
          <span key={i} className="star">
            ☆
          </span>,
        )
      }
    }
    return stars
  }

  return (
    <div className="modal-overlay modal-overlay-detail" onClick={onClose}>
      <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Media Details</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-content modal-content-detail">
          <div className="detail-layout">
            <div className="detail-image-section">
              {item.imageUrl ? (
                <Image 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="detail-image"
                  width={400}
                  height={600}
                  priority
                />
              ) : (
                <div className="detail-image detail-image-placeholder">
                  <span className="placeholder-icon">{getTypeIcon()}</span>
                </div>
              )}
            </div>

            <div className="detail-info-section">
              <div className="detail-header-info">
                <div className="type-badge">
                  <span className="type-icon">{getTypeIcon()}</span>
                  <span className="type-text">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                </div>

                <h1 className="detail-title">{item.title}</h1>

                <div className="detail-meta-row">
                  <div className="meta-item">
                    <span className="meta-label">Duration/Info</span>
                    <span className="meta-value">{getMetaText()}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Status</span>
                    <span className={`meta-value status-${item.status}`}>
                      {item.status === "finished" ? "✅ Finished" : "⏳ Unfinished"}
                    </span>
                  </div>
                </div>

                <div className="rating-section">
                  <div className="stars-container">{renderStars(item.rating)}</div>
                  <span className="rating-text">{item.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              {item.description && (
                <div className="description-section">
                  <h3>Description</h3>
                  <p className="detail-description">{item.description}</p>
                </div>
              )}

              <div className="detail-footer">
                <div className="creator-info">
                  <span className="creator-text">
                    Added by <strong>{item.createdByName}</strong> on {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="modal-actions modal-actions-detail">
            <button className="btn-danger btn-responsive" onClick={onDelete}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6" />
                <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2" />
              </svg>
              Delete
            </button>
            <button className="btn-secondary btn-responsive" onClick={onEdit}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  )
}