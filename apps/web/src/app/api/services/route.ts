import { NextRequest } from "next/server";
import { prisma, ServiceCategory } from "@zhiwebing/db";
import { verifyToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { z } from "zod";

const serviceCategories = Object.values(ServiceCategory);

const createServiceSchema = z.object({
  name: z.string().min(1, "服务名称不能为空"),
  category: z.nativeEnum(ServiceCategory, {
    errorMap: () => ({ message: "无效的服务分类" }),
  }),
  description: z.string().min(1, "服务描述不能为空"),
  benefits: z.array(z.string()).default([]),
  precautions: z.array(z.string()).default([]),
  duration: z.string().optional(),
  price: z.string().optional(),
  suitableFor: z.array(z.string()).default([]),
  contraindicatedFor: z.array(z.string()).default([]),
  isSeasonalOnly: z.boolean().default(false),
  seasonalNote: z.string().optional(),
  coverImage: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

// GET /api/services — 获取康养服务列表（可选认证）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const category = searchParams.get("category") as ServiceCategory | null;
    const hospitalId = searchParams.get("hospitalId");
    const isActiveParam = searchParams.get("isActive");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10))
    );

    // Optional auth: check if doctor is authenticated
    let doctorHospitalId: string | null = null;
    const token = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "");
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { hospitalId: true, doctorProfile: { select: { id: true } } },
        });
        if (user?.doctorProfile) {
          doctorHospitalId = user.hospitalId;
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    // isActive filter
    if (doctorHospitalId) {
      // Authenticated doctor: respect isActive param
      if (isActiveParam === "true") {
        where.isActive = true;
      } else if (isActiveParam === "false") {
        where.isActive = false;
      }
      // 'all' or unset: no isActive filter for authenticated doctors

      // Auto-filter by doctor's hospitalId
      where.hospitalId = doctorHospitalId;
    } else {
      // Public access: always only show active services
      where.isActive = true;

      // Allow explicit hospitalId filter for public
      if (hospitalId) {
        where.hospitalId = hospitalId;
      }
    }

    // Category filter
    if (category && serviceCategories.includes(category)) {
      where.category = category;
    }

    // Fuzzy search by name
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const [items, total] = await Promise.all([
      prisma.wellnessService.findMany({
        where,
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          benefits: true,
          precautions: true,
          duration: true,
          price: true,
          suitableFor: true,
          contraindicatedFor: true,
          isSeasonalOnly: true,
          seasonalNote: true,
          coverImage: true,
          isActive: true,
          sortOrder: true,
          hospital: { select: { id: true, name: true } },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.wellnessService.count({ where }),
    ]);

    return successResponse({ items, total, page, pageSize });
  } catch (error) {
    console.error("Get services error:", error);
    return errorResponse("获取康养服务列表失败", 500);
  }
}

// POST /api/services — 创建康养服务（医生端）
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
      return errorResponse("仅医生可创建康养服务", 403);
    }

    if (!user.hospitalId) {
      return errorResponse("医生未关联医院，无法创建服务", 400);
    }

    const body = await request.json();
    const parsed = createServiceSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    const data = parsed.data;

    const service = await prisma.wellnessService.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        benefits: data.benefits,
        precautions: data.precautions,
        duration: data.duration,
        price: data.price,
        suitableFor: data.suitableFor,
        contraindicatedFor: data.contraindicatedFor,
        isSeasonalOnly: data.isSeasonalOnly,
        seasonalNote: data.seasonalNote,
        coverImage: data.coverImage,
        sortOrder: data.sortOrder,
        hospitalId: user.hospitalId,
      },
      include: {
        hospital: { select: { id: true, name: true } },
      },
    });

    return successResponse(service, "康养服务创建成功");
  } catch (error) {
    console.error("Create service error:", error);
    return errorResponse("创建康养服务失败", 500);
  }
}
