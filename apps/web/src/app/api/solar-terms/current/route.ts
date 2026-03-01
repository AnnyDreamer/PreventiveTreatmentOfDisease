import { prisma } from "@zhiwebing/db";
import {
  getCurrentSolarTermKey,
  SOLAR_TERM_INFO,
} from "@zhiwebing/shared";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/solar-terms/current — 无需鉴权
export async function GET() {
  try {
    const key = getCurrentSolarTermKey();
    const termInfo = SOLAR_TERM_INFO[key];

    // 查询该节气关联的已发布文章（最多3篇）
    const relatedContents = await prisma.healthContent.findMany({
      where: {
        solarTermKey: key,
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
      take: 3,
    });

    return successResponse({
      ...termInfo,
      relatedContents,
    });
  } catch (error) {
    console.error("Get current solar term error:", error);
    return errorResponse("获取节气信息失败", 500);
  }
}
