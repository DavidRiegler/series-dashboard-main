import { NextResponse } from "next/server"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    const querySnapshot = await getDocs(collection(db, "media"))
    const titles: string[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.title) {
        titles.push(data.title)
      }
    })

    // Remove duplicates and sort
    const uniqueTitles = [...new Set(titles)].sort()

    return NextResponse.json(uniqueTitles)
  } catch (error) {
    console.error("Error fetching titles:", error)
    return NextResponse.json([])
  }
}