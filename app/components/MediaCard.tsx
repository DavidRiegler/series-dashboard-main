"use client"

import { useState } from "react"
import Image from "next/image"
import type { MediaItem } from "@/lib/types"

interface MediaCardProps {
  item: MediaItem
  onClick: (item: MediaItem) => void
}

export default function MediaCard({ item, onClick }: MediaCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

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

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  const getPlaceholderIcon = () => {
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

  return (
    <div className="card" onClick={() => onClick(item)}>
      {item.imageUrl && !imageError ? (
        <Image
          src={item.imageUrl}
          alt={item.title}
          className="card-image"
          onLoad={handleImageLoad}
          onError={handleImageError}
          data-loading={imageLoading}
          loading="lazy"
          width={300}
          height={400}
          sizes="(max-width: 480px) 120px, (max-width: 768px) 300px, 400px"
        />
      ) : (
        <div className="card-image" data-error={imageError}>
          {getPlaceholderIcon()}
        </div>
      )}
      <div className="card-content">
        <h3 className="card-title">{item.title}</h3>
        <div className="card-meta">
          <span>{getMetaText()}</span>
          <div className="card-rating">⭐ {item.rating.toFixed(1)}</div>
        </div>
      </div>
    </div>
  )
}