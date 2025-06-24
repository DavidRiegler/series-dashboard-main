import { type NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { MediaItem } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const types = searchParams.get("types")?.split(",") || []
    const users = searchParams.get("users")?.split(",") || []
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "createdAt"

    const q = query(collection(db, "media"), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    const media: MediaItem[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      media.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as MediaItem)
    })

    // Apply filters
    let filteredMedia = media

    // Filter by types
    if (types.length > 0) {
      filteredMedia = filteredMedia.filter((item) => types.includes(item.type))
    }

    // Filter by users
    if (users.length > 0) {
      filteredMedia = filteredMedia.filter((item) => users.includes(item.createdBy))
    }

    // Filter by status
    if (status) {
      filteredMedia = filteredMedia.filter((item) => item.status === status)
    }

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase()
      filteredMedia = filteredMedia.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.createdByName.toLowerCase().includes(searchLower),
      )
    }

    // Sort results
    switch (sortBy) {
      case "rating":
        filteredMedia.sort((a, b) => b.rating - a.rating)
        break
      case "rating_asc":
        filteredMedia.sort((a, b) => a.rating - b.rating)
        break
      case "title":
        filteredMedia.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "duration":
        filteredMedia.sort((a, b) => {
          const getDuration = (item: MediaItem) => {
            if (item.type === "movie" && item.duration) {
              // Parse duration like "1h 45m" to minutes
              const match = item.duration.match(/(\d+)h?\s*(\d+)?m?/)
              if (match) {
                const hours = Number.parseInt(match[1]) || 0
                const minutes = Number.parseInt(match[2]) || 0
                return hours * 60 + minutes
              }
            }
            if (item.type === "series") return item.episodes || 0
            if (item.type === "book") return item.pages || 0
            return 0
          }
          return getDuration(a) - getDuration(b)
        })
        break
      case "duration_desc":
        filteredMedia.sort((a, b) => {
          const getDuration = (item: MediaItem) => {
            if (item.type === "movie" && item.duration) {
              const match = item.duration.match(/(\d+)h?\s*(\d+)?m?/)
              if (match) {
                const hours = Number.parseInt(match[1]) || 0
                const minutes = Number.parseInt(match[2]) || 0
                return hours * 60 + minutes
              }
            }
            if (item.type === "series") return item.episodes || 0
            if (item.type === "book") return item.pages || 0
            return 0
          }
          return getDuration(b) - getDuration(a)
        })
        break
      default:
        // Already sorted by createdAt desc
        break
    }

    return NextResponse.json(filteredMedia || [])
  } catch (error) {
    console.error("Error fetching media:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userDisplayName, ...mediaData } = body

    const newMedia = {
      ...mediaData,
      createdBy: userId,
      createdByName: userDisplayName,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Safely convert numbers, defaulting to 0 if undefined or invalid
      seasons: body.seasons ? Number(body.seasons) : 0,
      episodes: body.episodes ? Number(body.episodes) : 0,
      pages: body.pages ? Number(body.pages) : 0,
    }

    const docRef = await addDoc(collection(db, "media"), newMedia)

    return NextResponse.json({ id: docRef.id, ...newMedia })
  } catch (error) {
    console.error("Error adding media:", error)
    return NextResponse.json({ error: "Failed to add media" }, { status: 500 })
  }
}