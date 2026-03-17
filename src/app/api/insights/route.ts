import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ stats: null });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ stats: null });
    }

    const events = await prisma.event.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    if (events.length === 0) {
      return NextResponse.json({ stats: null });
    }

    // Single-pass aggregation
    const categoryMap: Record<string, number> = {};
    const yearMap: Record<number, number> = {};
    const cityMap: Record<string, number> = {};
    let photosCount = 0;

    for (const e of events) {
      const cat = e.category || "uncategorized";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;

      const year = e.date.getFullYear();
      yearMap[year] = (yearMap[year] || 0) + 1;

      if (e.location) {
        cityMap[e.location] = (cityMap[e.location] || 0) + 1;
      }

      if (e.imageUrl) photosCount++;
    }

    const categories = Object.entries(categoryMap)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        color: "rgba(255,255,255,0.7)",
      }))
      .sort((a, b) => b.count - a.count);

    const yearlyEvents = Object.entries(yearMap)
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year);

    const cityVisits = Object.entries(cityMap)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    const mostActiveYear = yearlyEvents.reduce(
      (a, b) => (b.count > a.count ? b : a),
      yearlyEvents[0]
    )?.year || new Date().getFullYear();

    return NextResponse.json({
      stats: {
        totalEvents: events.length,
        totalPhotos: photosCount,
        citiesVisited: Object.keys(cityMap).length,
        mostActiveYear,
        mostVisitedCity: cityVisits[0]?.city || "None",
        topCategory: categories[0]?.name || "None",
        longestStreak: "—",
        categories,
        yearlyEvents,
        cityVisits,
      },
    });
  } catch (error) {
    console.error("GET /api/insights error:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
