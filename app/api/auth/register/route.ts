import { type NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { hashPassword } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { username, fullName, password } = await request.json()

    if (!username || !fullName || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Username validation - allow letters, numbers, dots, underscores, hyphens
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      return NextResponse.json(
        { message: "Username can only contain letters, numbers, dots, underscores, and hyphens" },
        { status: 400 },
      )
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json({ message: "Username must be between 3 and 30 characters" }, { status: 400 })
    }

    // Password validation - allow any characters, just check length
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Check if username already exists
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("username", "==", username))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      return NextResponse.json({ message: "Username already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = {
      username,
      fullName,
      hashedPassword,
      createdAt: new Date(),
    }

    const docRef = await addDoc(usersRef, newUser)

    // Return user data (without password)
    const user = {
      uid: docRef.id,
      username,
      fullName,
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
