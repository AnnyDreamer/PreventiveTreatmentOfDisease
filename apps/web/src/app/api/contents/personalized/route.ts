import { NextRequest } from "next/server";
import { prisma } from "@zhiwebing/db";
import { verifyToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { getCurrentSolarTermKey } from "@zhiwebing/shared";

// GET /api/contents/personalized — 需登录，个性化内容推荐
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return unauthorizedResponse();

    const payload = await verifyToken(token);
    if (!payload) return unauthorizedResponse();

    // 获取患者体质
    const patient = await prisma.patientProfile.findUnique({
      where: { userId: payload.userId },
      select: { primaryConstitution: true },
    });

    const constitution = patient?.primaryConstitution ?? null;
    const currentTermKey = getCurrentSolarTermKey();

    // 优先级：① 节气匹配 ② 体质匹配 ③ 通用内容
    const [solarTermContents, constitutionContents, generalContents] =
      await Promise.all([
        // ① 节气匹配
        prisma.healthContent.findMany({
          where: { isPublished: true, solarTermKey: currentTermKey },
          select: {
            id: true, title: true, summary: true, contentType: true,
            coverImage: true, solarTermKey: true, publishedAt: true,
            authorName: true, viewCount: true,
          },
          orderBy: { sortOrder: "asc" },
          take: 4,
        }),
        // ② 体质匹配
        constitution
          ? prisma.healthContent.findMany({
              where: {
                isPublished: true,
                solarTermKey: null,
                constitutions: { array_contains: constitution },
              },
              select: {
                id: true, title: true, summary: true, contentType: true,
                coverImage: true, solarTermKey: true, publishedAt: true,
                authorName: true, viewCount: true,
              },
              orderBy: { sortOrder: "asc" },
              take: 4,
            })
          : Promise.resolve([]),
        // ③ 通用内容（constitutions 为空数组）
        prisma.healthContent.findMany({
          where: {
            isPublished: true,
            constitutions: { equals: [] },
          },
          select: {
            id: true, title: true, summary: true, contentType: true,
            coverImage: true, solarTermKey: true, publishedAt: true,
            authorName: true, viewCount: true,
          },
          orderBy: { publishedAt: "desc" },
          take: 4,
        }),
      ]);

    // 合并去重，限制 10 条
    const seen = new Set<string>();
    const merged = [...solarTermContents, ...constitutionContents, ...generalContents]
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .slice(0, 10);

    return successResponse({
      constitution,
      currentSolarTerm: currentTermKey,
      contents: merged,
    });
  } catch (error) {
    console.error("Get personalized contents error:", error);
    return errorResponse("获取个性化内容失败", 500);
  }
}
