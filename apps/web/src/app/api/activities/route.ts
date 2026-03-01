import { NextRequest } from "next/server";
import { prisma, type ActivityStatus, Prisma } from "@zhiwebing/db";
import { verifyToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { z } from "zod";

const createActivitySchema = z
  .object({
    title: z.string().min(1, "活动标题不能为空"),
    description: z.string().min(1, "活动描述不能为空"),
    location: z.string().min(1, "活动地点不能为空"),
    department: z.string().optional(),
    startTime: z.string().datetime("开始时间格式无效"),
    endTime: z.string().datetime("结束时间格式无效"),
    capacity: z.number().int().positive("容量必须为正整数"),
    targetConstitutions: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: "开始时间必须早于结束时间",
    path: ["startTime"],
  });

// GET /api/activities?status=&search=&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const statusParam = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(20, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.WellnessActivityWhereInput = {};

    // Auth check: if doctor is authenticated, auto-filter by hospitalId
    const token = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "");
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            hospitalId: true,
            doctorProfile: { select: { id: true } },
          },
        });
        if (user?.doctorProfile && user.hospitalId) {
          where.hospitalId = user.hospitalId;
        }
      }
    }

    // Status filter: 'all' returns all statuses; specific status filters; default shows all
    if (statusParam && statusParam !== "all") {
      where.status = statusParam as ActivityStatus;
    }

    // Search filter: fuzzy title search
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [items, total] = await Promise.all([
      prisma.wellnessActivity.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          department: true,
          startTime: true,
          endTime: true,
          capacity: true,
          currentCount: true,
          status: true,
          targetConstitutions: true,
          coverImage: true,
          tags: true,
          publishedAt: true,
          hospital: { select: { id: true, name: true } },
          publisher: {
            select: {
              id: true,
              title: true,
              department: true,
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { startTime: "asc" },
        skip,
        take: limit,
      }),
      prisma.wellnessActivity.count({ where }),
    ]);

    return successResponse({ items, total, page, pageSize: limit });
  } catch (error) {
    console.error("Get activities error:", error);
    return errorResponse("获取活动列表失败", 500);
  }
}

// POST /api/activities — 创建活动（医生端）
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
      return errorResponse("仅医生可执行此操作", 403);
    }

    const body = await request.json();
    const parsed = createActivitySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    const {
      title,
      description,
      location,
      department,
      startTime,
      endTime,
      capacity,
      targetConstitutions,
      tags,
      coverImage,
    } = parsed.data;

    const activity = await prisma.wellnessActivity.create({
      data: {
        title,
        description,
        location,
        department,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity,
        targetConstitutions: targetConstitutions ?? Prisma.JsonNull,
        tags: tags ?? Prisma.JsonNull,
        coverImage,
        status: "DRAFT",
        publisherId: user.doctorProfile.id,
        hospitalId: user.hospitalId!,
      },
      include: {
        hospital: { select: { id: true, name: true } },
        publisher: {
          select: {
            id: true,
            title: true,
            department: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    return successResponse(activity, "活动创建成功");
  } catch (error) {
    console.error("Create activity error:", error);
    return errorResponse("创建活动失败", 500);
  }
}
