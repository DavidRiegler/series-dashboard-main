export interface User {
  uid: string
  username: string
  fullName: string
  createdAt: Date
}

export interface AuthUser {
  uid: string
  username: string
  fullName: string
}

export interface MediaItem {
  id: string
  title: string
  description: string
  type: "movie" | "series" | "book"
  duration?: string // For movies (e.g., "1h 45m")
  seasons?: number // For series
  episodes?: number // For series
  pages?: number // For books
  status: "finished" | "unfinished"
  rating: number // 1-5 stars
  imageUrl?: string
  createdBy: string // User ID
  createdByName: string // User display name
  createdAt: Date
  updatedAt: Date
}

export interface SearchFilters {
  query: string
  types: string[]
  users: string[]
  status: string
  sortBy: string
}
