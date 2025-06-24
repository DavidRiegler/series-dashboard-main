import { type NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { verifyPassword } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    // Find user by username
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("username", "==", username))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
    }

    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()

    // Verify password
    const isValidPassword = await verifyPassword(password, userData.hashedPassword)
    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
    }

    // Return user data (without password)
    const user = {
      uid: userDoc.id,
      username: userData.username,
      fullName: userData.fullName,
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
