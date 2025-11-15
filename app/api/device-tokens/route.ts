import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all device tokens for this user
    const tokens = await prisma.deviceToken.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        platform: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      userId: session.user.id,
      email: session.user.email,
      tokens,
      count: tokens.length,
    })
  } catch (error) {
    console.error("Error fetching device tokens:", error)
    return NextResponse.json(
      { error: "Failed to fetch device tokens" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { token, platform } = await req.json()

    if (!token || !platform) {
      return NextResponse.json(
        { error: "Token and platform are required" },
        { status: 400 }
      )
    }

    // Check if token already exists for this user
    const existingToken = await prisma.deviceToken.findUnique({
      where: { token },
    })

    if (existingToken) {
      // If token exists but for different user, update it
      if (existingToken.userId !== session.user.id) {
        await prisma.deviceToken.update({
          where: { token },
          data: {
            userId: session.user.id,
            platform,
          },
        })
      }
      return NextResponse.json({ success: true, message: "Token already registered" })
    }

    // Create new device token
    await prisma.deviceToken.create({
      data: {
        userId: session.user.id,
        token,
        platform,
      },
    })

    return NextResponse.json({ success: true, message: "Token registered successfully" })
  } catch (error) {
    console.error("Error registering device token:", error)
    return NextResponse.json(
      { error: "Failed to register device token" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      )
    }

    // Delete the device token
    await prisma.deviceToken.deleteMany({
      where: {
        token,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, message: "Token removed successfully" })
  } catch (error) {
    console.error("Error removing device token:", error)
    return NextResponse.json(
      { error: "Failed to remove device token" },
      { status: 500 }
    )
  }
}
