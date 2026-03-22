import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

// GET /api/google/status — check which Google services have imported data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [calendarCount, photosCount] = await Promise.all([
      prisma.event.count({ where: { userId: user.id, source: "calendar" } }),
      prisma.event.count({ where: { userId: user.id, source: "photos" } }),
    ]);

    return NextResponse.json({
      calendar: calendarCount > 0,
      photos: photosCount > 0,
    });
  } catch (error) {
    console.error("GET /api/google/status error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
