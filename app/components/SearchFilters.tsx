"use client"
import { useState, useEffect, useRef } from "react"
import type { SearchFilters } from "@/lib/types"

interface SearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  users: Array<{ uid: string; fullName: string; username: string }>
}

export default function SearchFiltersComponent({ filters, onFiltersChange, users }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allTitles, setAllTitles] = useState<string[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Fetch all media titles for autocomplete
    fetchAllTitles()
  }, [])

  const fetchAllTitles = async () => {
    try {
      const response = await fetch("/api/media/titles")
      if (response.ok) {
        const titles = await response.json()
        setAllTitles(titles)
      }
    } catch (error) {
      console.error("Error fetching titles:", error)
    }
  }

  const handleSearchChange = (query: string) => {
    onFiltersChange({ ...filters, query })

    if (query.length > 1) {
      const filteredSuggestions = allTitles
        .filter((title) => title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
      setSuggestions(filteredSuggestions)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onFiltersChange({ ...filters, query: suggestion })
    setShowSuggestions(false)
  }

  const handleTypeChange = (type: string) => {
    const newTypes = filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type]

    onFiltersChange({ ...filters, types: newTypes })
  }

  const handleUserChange = (userId: string) => {
    const newUsers = filters.users.includes(userId)
      ? filters.users.filter((u) => u !== userId)
      : [...filters.users, userId]

    onFiltersChange({ ...filters, users: newUsers })
  }

  const clearFilters = () => {
    onFiltersChange({
      query: "",
      types: [],
      users: [],
      status: "",
      sortBy: "createdAt",
    })
  }

  const hasActiveFilters =
    filters.types.length > 0 || filters.users.length > 0 || filters.status || filters.sortBy !== "createdAt"

  return (
    <div className="search-filters">
      <div className="search-filters-header">
        <div className="search-with-autocomplete">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search titles, descriptions, creators..."
            className="search-filter-input"
            value={filters.query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => filters.query.length > 1 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item" onClick={() => handleSuggestionClick(suggestion)}>
                  🔍 {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className={`filter-toggle ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(!showFilters)}>
          🔍 Filters{" "}
          {hasActiveFilters && (
            <span className="filter-badge">
              {filters.types.length + filters.users.length + (filters.status ? 1 : 0)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear All
          </button>
        )}
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label className="filter-label">Content Type</label>
            <div className="filter-options">
              {["movie", "series", "book"].map((type) => (
                <label key={type} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type)}
                    onChange={() => handleTypeChange(type)}
                  />
                  <span className="checkmark"></span>
                  {type === "movie" ? "🎬 Movies" : type === "series" ? "📺 Series" : "📚 Books"}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="finished">✅ Finished</option>
              <option value="unfinished">⏳ Unfinished</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              className="form-select"
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
            >
              <option value="createdAt">Recently Added</option>
              <option value="rating">Best Rated</option>
              <option value="rating_asc">Worst Rated</option>
              <option value="title">Title A-Z</option>
              <option value="duration">Shortest First</option>
              <option value="duration_desc">Longest First</option>
            </select>
          </div>

          {users.length > 0 && (
            <div className="filter-group">
              <label className="filter-label">Added By</label>
              <div className="filter-options users-filter">
                {users.map((user) => (
                  <label key={user.uid} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.users.includes(user.uid)}
                      onChange={() => handleUserChange(user.uid)}
                    />
                    <span className="checkmark"></span>
                    {user.fullName} (@{user.username})
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
