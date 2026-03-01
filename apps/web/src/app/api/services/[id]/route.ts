import { NextRequest } from "next/server";
import { prisma, Prisma, ServiceCategory } from "@zhiwebing/db";
import { verifyToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { z } from "zod";

const updateServiceSchema = z.object({
  name: z.string().min(1, "服务名称不能为空").optional(),
  category: z
    .nativeEnum(ServiceCategory, {
      errorMap: () => ({ message: "无效的服务分类" }),
    })
    .optional(),
  description: z.string().min(1, "服务描述不能为空").optional(),
  benefits: z.array(z.string()).optional(),
  precautions: z.array(z.string()).optional(),
  duration: z.string().nullable().optional(),
  price: z.string().nullable().optional(),
  suitableFor: z.array(z.string()).optional(),
  contraindicatedFor: z.array(z.string()).nullable().optional(),
  isSeasonalOnly: z.boolean().optional(),
  seasonalNote: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

/** Helper to get the authenticated doctor's hospitalId */
async function getDoctorHospitalId(request: NextRequest) {
  const token = request.headers
    .get("Authorization")
    ?.replace("Bearer ", "");
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { hospitalId: true, doctorProfile: { select: { id: true } } },
  });

  if (!user?.doctorProfile) return null;
  return user.hospitalId;
}

// GET /api/services/[id] — 服务详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = await prisma.wellnessService.findUnique({
      where: { id },
      include: {
        hospital: { select: { id: true, name: true, address: true } },
      },
    });

    if (!service) {
      return notFoundResponse("康养服务");
    }

    // If service is inactive, only authenticated doctors from the same hospital can see it
    if (!service.isActive) {
      const doctorHospitalId = await getDoctorHospitalId(request);
      if (!doctorHospitalId || doctorHospitalId !== service.hospitalId) {
        return notFoundResponse("康养服务");
      }
    }

    return successResponse(service);
  } catch (error) {
    console.error("Get service detail error:", error);
    return errorResponse("获取服务详情失败", 500);
  }
}

// PUT /api/services/[id] — 更新康养服务（医生端）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return errorResponse("仅医生可更新康养服务", 403);
    }

    const { id } = await params;

    // Verify service exists and belongs to doctor's hospital
    const existing = await prisma.wellnessService.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse("康养服务");
    }

    if (existing.hospitalId !== user.hospitalId) {
      return errorResponse("无权修改其他医院的服务", 403);
    }

    const body = await request.json();
    const parsed = updateServiceSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    // Build the update data, handling nullable JSON field (contraindicatedFor)
    const { contraindicatedFor, ...rest } = parsed.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = { ...rest };

    if (contraindicatedFor !== undefined) {
      updateData.contraindicatedFor =
        contraindicatedFor === null
          ? Prisma.JsonNull
          : contraindicatedFor;
    }

    const service = await prisma.wellnessService.update({
      where: { id },
      data: updateData,
      include: {
        hospital: { select: { id: true, name: true } },
      },
    });

    return successResponse(service, "康养服务更新成功");
  } catch (error) {
    console.error("Update service error:", error);
    return errorResponse("更新康养服务失败", 500);
  }
}

// DELETE /api/services/[id] — 删除康养服务（医生端）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return errorResponse("仅医生可删除康养服务", 403);
    }

    const { id } = await params;

    // Verify service exists and belongs to doctor's hospital
    const existing = await prisma.wellnessService.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse("康养服务");
    }

    if (existing.hospitalId !== user.hospitalId) {
      return errorResponse("无权删除其他医院的服务", 403);
    }

    await prisma.wellnessService.delete({ where: { id } });

    return successResponse(null, "康养服务已删除");
  } catch (error) {
    console.error("Delete service error:", error);
    return errorResponse("删除康养服务失败", 500);
  }
}
