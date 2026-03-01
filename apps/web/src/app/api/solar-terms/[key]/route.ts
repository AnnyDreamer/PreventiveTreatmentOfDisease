import { NextRequest } from "next/server";
import { prisma } from "@zhiwebing/db";
import { SOLAR_TERM_INFO, type SolarTermKey } from "@zhiwebing/shared";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/lib/api-response";

// GET /api/solar-terms/[key] — 指定节气详情
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const upperKey = key.toUpperCase() as SolarTermKey;
    const termInfo = SOLAR_TERM_INFO[upperKey];

    if (!termInfo) {
      return notFoundResponse("节气");
    }

    const relatedContents = await prisma.healthContent.findMany({
      where: {
        solarTermKey: upperKey,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        summary: true,
        coverImage: true,
        publishedAt: true,
        authorName: true,
        viewCount: true,
      },
      orderBy: { sortOrder: "asc" },
      take: 5,
    });

    return successResponse({ ...termInfo, relatedContents });
  } catch (error) {
    console.error("Get solar term by key error:", error);
    return errorResponse("获取节气信息失败", 500);
  }
}
