import { NextRequest } from "next/server";
import { prisma } from "@zhiwebing/db";
import { verifyToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

// POST /api/activities/[id]/register — 报名
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return unauthorizedResponse();

    const payload = await verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id: activityId } = await params;

    const patient = await prisma.patientProfile.findUnique({
      where: { userId: payload.userId },
      select: { id: true },
    });
    if (!patient) return errorResponse("患者档案不存在", 403);

    // 查活动
    const activity = await prisma.wellnessActivity.findUnique({
      where: { id: activityId },
    });
    if (!activity) return notFoundResponse("活动");
    if (activity.status !== "PUBLISHED") return errorResponse("活动未开放报名");
    if (activity.currentCount >= activity.capacity) return errorResponse("活动名额已满");

    // 检查是否已报名
    const existing = await prisma.activityRegistration.findUnique({
      where: { activityId_patientId: { activityId, patientId: patient.id } },
    });
    if (existing) {
      if (existing.status === "REGISTERED") return errorResponse("您已报名该活动");
      // 已取消的可以重新报名
      const [, updated] = await prisma.$transaction([
        prisma.activityRegistration.update({
          where: { id: existing.id },
          data: { status: "REGISTERED", cancelledAt: null, registeredAt: new Date() },
        }),
        prisma.wellnessActivity.update({
          where: { id: activityId },
          data: { currentCount: { increment: 1 } },
        }),
      ]);
      return successResponse({ activity: updated, message: "报名成功" });
    }

    // 事务：创建报名记录 + 更新名额
    await prisma.$transaction([
      prisma.activityRegistration.create({
        data: { activityId, patientId: patient.id, status: "REGISTERED" },
      }),
      prisma.wellnessActivity.update({
        where: { id: activityId },
        data: { currentCount: { increment: 1 } },
      }),
    ]);

    return successResponse({ message: "报名成功" });
  } catch (error) {
    console.error("Register activity error:", error);
    return errorResponse("报名失败", 500);
  }
}

// DELETE /api/activities/[id]/register — 取消报名
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return unauthorizedResponse();

    const payload = await verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id: activityId } = await params;

    const patient = await prisma.patientProfile.findUnique({
      where: { userId: payload.userId },
      select: { id: true },
    });
    if (!patient) return errorResponse("患者档案不存在", 403);

    const registration = await prisma.activityRegistration.findUnique({
      where: { activityId_patientId: { activityId, patientId: patient.id } },
    });
    if (!registration || registration.status !== "REGISTERED") {
      return errorResponse("您未报名该活动");
    }

    // 事务：更新报名状态 + 减少名额
    await prisma.$transaction([
      prisma.activityRegistration.update({
        where: { id: registration.id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      }),
      prisma.wellnessActivity.update({
        where: { id: activityId },
        data: { currentCount: { decrement: 1 } },
      }),
    ]);

    return successResponse({ message: "已取消报名" });
  } catch (error) {
    console.error("Cancel registration error:", error);
    return errorResponse("取消报名失败", 500);
  }
}
