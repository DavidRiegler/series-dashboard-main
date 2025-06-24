"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { MediaItem } from "@/lib/types"
import { useAuth } from "./components/AuthProvider"
import AuthGuard from "./components/AuthGuard"
import Header from "./components/Header"
import MediaSection from "./components/MediaSection"
import AddMediaModal from "./components/AddMediaModal"
import SearchFilterComponent from "./components/SearchFilters"
import { useRouter } from "next/navigation"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [media, setMedia] = useState<MediaItem[]>([])
  const [users, setUsers] = useState<Array<{ uid: string; fullName: string; username: string }>>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filters, setFilters] = useState({
    query: "",
    types: [] as string[],
    users: [] as string[],
    status: "",
    sortBy: "createdAt",
  })

  useEffect(() => {
    if (user) {
      fetchMedia()
      fetchUsers()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"))
      const usersData = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as Array<{ uid: string; fullName: string; username: string }>
      setUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchMedia = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.types.length > 0) params.append("types", filters.types.join(","))
      if (filters.users.length > 0) params.append("users", filters.users.join(","))
      if (filters.status) params.append("status", filters.status)
      if (filters.sortBy) params.append("sortBy", filters.sortBy)
      if (filters.query) params.append("search", filters.query)

      const response = await fetch(`/api/media?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch media")
      }

      const data = await response.json()
      setMedia(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching media:", error)
      setMedia([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMedia()
    }
  }, [filters, user])

  const handleAddMedia = async (mediaData: Partial<MediaItem>) => {
    if (!user) return

    try {
      const response = await fetch("/api/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...mediaData,
          userId: user.uid,
          userDisplayName: user.fullName,
        }),
      })

      if (response.ok) {
        fetchMedia()
        setShowAddModal(false)
      }
    } catch (error) {
      console.error("Error adding media:", error)
    }
  }

  const handleItemClick = (item: MediaItem) => {
    router.push(`/media/${item.id}`)
  }

  const getFilteredMedia = () => {
    if (!Array.isArray(media)) {
      return []
    }

    return media.filter((item) => {
      // Tab filtering - fix the mapping issue
      if (activeTab !== "all") {
        const tabToType = {
          movies: "movie",
          series: "series",
          books: "book",
        }
        const expectedType = tabToType[activeTab as keyof typeof tabToType]
        if (expectedType && item.type !== expectedType) return false
      }

      return true
    })
  }

  const getRecentlyAdded = () => {
    return getFilteredMedia().slice(0, 10)
  }

  const getTopRated = () => {
    return getFilteredMedia()
      .filter((item) => item.rating >= 4)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)
  }

  const getUnfinished = () => {
    return getFilteredMedia()
      .filter((item) => item.status === "unfinished")
      .slice(0, 10)
  }

  const getShortContent = () => {
    return getFilteredMedia()
      .filter((item) => {
        if (item.type === "movie") return true
        if (item.type === "book") return (item.pages || 0) < 300
        if (item.type === "series") return (item.episodes || 0) < 10
        return false
      })
      .slice(0, 10)
  }

  return (
    <AuthGuard>
      <div className="app-container">
        <Header />

        <main className="main-content">
          <div className="tabs-container">
            {["all", "movies", "series", "books"].map((tabName) => (
              <button
                key={tabName}
                className="tab"
                data-active={activeTab === tabName}
                onClick={() => setActiveTab(tabName)}
              >
                {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
              </button>
            ))}
          </div>

          <SearchFilterComponent filters={filters} onFiltersChange={setFilters} users={users} />

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <MediaSection title="Recently Added" items={getRecentlyAdded()} onItemClick={handleItemClick} />

              <MediaSection title="Top Rated" items={getTopRated()} onItemClick={handleItemClick} />

              <MediaSection title="Unfinished" items={getUnfinished()} onItemClick={handleItemClick} />

              <MediaSection title="Quick Picks" items={getShortContent()} onItemClick={handleItemClick} />

              {getFilteredMedia().length === 0 && (
                <div className="empty-state">
                  <h3>No content found</h3>
                  <p>Be the first to add some {activeTab === "all" ? "content" : activeTab}!</p>
                </div>
              )}
            </>
          )}
        </main>

        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          +
        </button>

        {showAddModal && (
          <AddMediaModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddMedia} />
        )}
      </div>
    </AuthGuard>
  )
}
