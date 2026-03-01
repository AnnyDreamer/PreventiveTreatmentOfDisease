import { NextRequest } from "next/server";
import { prisma, type ActivityStatus } from "@zhiwebing/db";
import { verifyToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { z } from "zod";

const statusTransitionSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ONGOING", "ENDED", "CANCELLED"], {
    errorMap: () => ({ message: "无效的活动状态" }),
  }),
});

// Valid status transitions
const VALID_TRANSITIONS: Record<ActivityStatus, ActivityStatus[]> = {
  DRAFT: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["ONGOING", "CANCELLED"],
  ONGOING: ["ENDED", "CANCELLED"],
  ENDED: [],
  CANCELLED: [],
};

// PATCH /api/activities/[id]/status — 变更活动状态
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

    const existing = await prisma.wellnessActivity.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse("活动");
    }

    // Verify hospital ownership
    if (existing.hospitalId !== user.hospitalId) {
      return errorResponse("无权操作其他医院的活动", 403);
    }

    const body = await request.json();
    const parsed = statusTransitionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    const newStatus = parsed.data.status as ActivityStatus;
    const currentStatus = existing.status as ActivityStatus;

    // Validate transition
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      return errorResponse(
        `不允许从「${currentStatus}」转换为「${newStatus}」`
      );
    }

    // Build update data with side effects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = { status: newStatus };

    // Side effect: set publishedAt when publishing
    if (newStatus === "PUBLISHED") {
      updateData.publishedAt = new Date();
    }

    // Side effect: when cancelling, update all registrations
    if (newStatus === "CANCELLED") {
      await prisma.activityRegistration.updateMany({
        where: {
          activityId: id,
          status: "REGISTERED",
        },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });
    }

    const activity = await prisma.wellnessActivity.update({
      where: { id },
      data: updateData,
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

    const statusLabels: Record<string, string> = {
      PUBLISHED: "已发布",
      ONGOING: "进行中",
      ENDED: "已结束",
      CANCELLED: "已取消",
    };

    return successResponse(
      activity,
      `活动${statusLabels[newStatus] || "状态更新"}成功`
    );
  } catch (error) {
    console.error("Update activity status error:", error);
    return errorResponse("更新活动状态失败", 500);
  }
}
