import { NextRequest } from "next/server";
import { prisma, ContentType } from "@zhiwebing/db";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// GET /api/contents?type=&solarTermKey=&constitution=&search=&isPublished=&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type") as ContentType | null;
    const solarTermKey = searchParams.get("solarTermKey");
    const constitution = searchParams.get("constitution");
    const search = searchParams.get("search");
    const isPublishedParam = searchParams.get("isPublished");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(20, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    // Determine isPublished filter
    // For authenticated doctors: default show all; otherwise default published only
    if (isPublishedParam === "all") {
      // No isPublished filter — show all (requires doctor auth checked below)
      const token = request.headers
        .get("Authorization")
        ?.replace("Bearer ", "");
      if (token) {
        const payload = await verifyToken(token);
        if (payload) {
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { doctorProfile: { select: { id: true } } },
          });
          if (!user?.doctorProfile) {
            // Non-doctor cannot see unpublished
            where.isPublished = true;
          }
          // Doctor: no filter, show all
        } else {
          where.isPublished = true;
        }
      } else {
        where.isPublished = true;
      }
    } else if (isPublishedParam === "true") {
      where.isPublished = true;
    } else if (isPublishedParam === "false") {
      // Only doctors can see unpublished
      const token = request.headers
        .get("Authorization")
        ?.replace("Bearer ", "");
      if (token) {
        const payload = await verifyToken(token);
        if (payload) {
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { doctorProfile: { select: { id: true } } },
          });
          if (user?.doctorProfile) {
            where.isPublished = false;
          } else {
            where.isPublished = true;
          }
        } else {
          where.isPublished = true;
        }
      } else {
        where.isPublished = true;
      }
    } else {
      // Default: published only for public access
      where.isPublished = true;
    }

    if (type) where.contentType = type;
    if (solarTermKey) where.solarTermKey = solarTermKey;
    if (constitution) {
      where.constitutions = { array_contains: constitution };
    }
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [items, total] = await Promise.all([
      prisma.healthContent.findMany({
        where,
        select: {
          id: true,
          title: true,
          summary: true,
          contentType: true,
          coverImage: true,
          solarTermKey: true,
          constitutions: true,
          isPublished: true,
          publishedAt: true,
          authorName: true,
          viewCount: true,
          sortOrder: true,
          createdAt: true,
        },
        orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.healthContent.count({ where }),
    ]);

    return successResponse({
      items,
      total,
      page,
      pageSize: limit,
    });
  } catch (error) {
    console.error("Get contents error:", error);
    return errorResponse("获取内容列表失败", 500);
  }
}

// ---- POST: Create new content (doctor auth required) ----

const createContentSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  summary: z.string().min(1, "摘要不能为空"),
  body: z.string().min(1, "正文不能为空"),
  contentType: z.nativeEnum(ContentType, {
    errorMap: () => ({ message: "无效的内容类型" }),
  }),
  solarTermKey: z.string().optional(),
  constitutions: z.array(z.string()).default([]),
  authorName: z.string().optional(),
  source: z.string().optional(),
  coverImage: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "");
    if (!token) return unauthorizedResponse();

    const payload = await verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { hospitalId: true, doctorProfile: { select: { id: true } } },
    });

    if (!user?.doctorProfile) {
      return errorResponse("仅医生可创建健康内容", 403);
    }

    const body = await request.json();
    const parsed = createContentSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    const content = await prisma.healthContent.create({
      data: {
        title: parsed.data.title,
        summary: parsed.data.summary,
        body: parsed.data.body,
        contentType: parsed.data.contentType,
        solarTermKey: parsed.data.solarTermKey ?? null,
        constitutions: parsed.data.constitutions,
        authorName: parsed.data.authorName ?? null,
        source: parsed.data.source ?? null,
        coverImage: parsed.data.coverImage ?? null,
        sortOrder: parsed.data.sortOrder,
        isPublished: false,
        hospitalId: user.hospitalId,
      },
    });

    return successResponse(content, "健康内容创建成功");
  } catch (error) {
    console.error("Create content error:", error);
    return errorResponse("创建健康内容失败", 500);
  }
}
