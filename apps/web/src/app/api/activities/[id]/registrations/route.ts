import { NextRequest } from "next/server";
import { prisma } from "@zhiwebing/db";
import { verifyToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

// GET /api/activities/[id]/registrations — 活动报名列表（医生端）
export async function GET(
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

    const { id: activityId } = await params;

    // Verify activity exists and belongs to doctor's hospital
    const activity = await prisma.wellnessActivity.findUnique({
      where: { id: activityId },
      select: { id: true, hospitalId: true },
    });

    if (!activity) {
      return notFoundResponse("活动");
    }

    if (activity.hospitalId !== user.hospitalId) {
      return errorResponse("无权查看其他医院的报名记录", 403);
    }

    // Pagination
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    const where = { activityId };

    const [items, total] = await Promise.all([
      prisma.activityRegistration.findMany({
        where,
        select: {
          id: true,
          status: true,
          note: true,
          registeredAt: true,
          cancelledAt: true,
          patient: {
            select: {
              id: true,
              gender: true,
              primaryConstitution: true,
              user: {
                select: {
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { registeredAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activityRegistration.count({ where }),
    ]);

    return successResponse({ items, total, page, pageSize: limit });
  } catch (error) {
    console.error("Get activity registrations error:", error);
    return errorResponse("获取报名列表失败", 500);
  }
}
