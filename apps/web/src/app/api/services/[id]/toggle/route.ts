import { NextRequest } from "next/server";
import { prisma } from "@zhiwebing/db";
import { verifyToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

// PATCH /api/services/[id]/toggle — 切换服务上下架状态（医生端）
export async function PATCH(
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
      return errorResponse("仅医生可执行此操作", 403);
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
      return errorResponse("无权操作其他医院的服务", 403);
    }

    const service = await prisma.wellnessService.update({
      where: { id },
      data: { isActive: !existing.isActive },
      include: {
        hospital: { select: { id: true, name: true } },
      },
    });

    const statusText = service.isActive ? "已上架" : "已下架";
    return successResponse(service, `康养服务${statusText}`);
  } catch (error) {
    console.error("Toggle service error:", error);
    return errorResponse("切换服务状态失败", 500);
  }
}
