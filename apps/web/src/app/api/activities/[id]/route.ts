import { NextRequest } from "next/server";
import { prisma, Prisma } from "@zhiwebing/db";
import { verifyToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { z } from "zod";

const updateActivitySchema = z.object({
  title: z.string().min(1, "活动标题不能为空").optional(),
  description: z.string().min(1, "活动描述不能为空").optional(),
  location: z.string().min(1, "活动地点不能为空").optional(),
  department: z.string().nullable().optional(),
  startTime: z.string().datetime("开始时间格式无效").optional(),
  endTime: z.string().datetime("结束时间格式无效").optional(),
  capacity: z.number().int().positive("容量必须为正整数").optional(),
  targetConstitutions: z.array(z.string()).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  coverImage: z.string().nullable().optional(),
});

// GET /api/activities/[id] — 活动详情，登录用户附带 isRegistered
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const activity = await prisma.wellnessActivity.findUnique({
      where: { id },
      include: {
        hospital: { select: { id: true, name: true, address: true } },
        publisher: {
          select: {
            id: true,
            title: true,
            department: true,
            specialty: true,
            user: { select: { name: true, avatar: true } },
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!activity) {
      return notFoundResponse("活动");
    }

    // Check if logged-in user is registered
    let isRegistered = false;
    const token = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "");
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        const patient = await prisma.patientProfile.findUnique({
          where: { userId: payload.userId },
          select: { id: true },
        });
        if (patient) {
          const registration = await prisma.activityRegistration.findUnique({
            where: {
              activityId_patientId: {
                activityId: id,
                patientId: patient.id,
              },
            },
          });
          isRegistered =
            !!registration && registration.status === "REGISTERED";
        }
      }
    }

    return successResponse({ ...activity, isRegistered });
  } catch (error) {
    console.error("Get activity detail error:", error);
    return errorResponse("获取活动详情失败", 500);
  }
}

// PUT /api/activities/[id] — 更新活动（医生端）
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
      return errorResponse("仅医生可执行此操作", 403);
    }

    const { id } = await params;

    const existing = await prisma.wellnessActivity.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse("活动");
    }

    if (existing.hospitalId !== user.hospitalId) {
      return errorResponse("无权修改其他医院的活动", 403);
    }

    const body = await request.json();
    const parsed = updateActivitySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    // Determine which fields are allowed based on status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};

    if (existing.status === "DRAFT") {
      // DRAFT: all fields editable
      const {
        targetConstitutions,
        tags,
        startTime,
        endTime,
        ...rest
      } = parsed.data;

      Object.assign(updateData, rest);

      if (startTime !== undefined) {
        updateData.startTime = new Date(startTime);
      }
      if (endTime !== undefined) {
        updateData.endTime = new Date(endTime);
      }
      if (targetConstitutions !== undefined) {
        updateData.targetConstitutions =
          targetConstitutions === null
            ? Prisma.JsonNull
            : targetConstitutions;
      }
      if (tags !== undefined) {
        updateData.tags = tags === null ? Prisma.JsonNull : tags;
      }

      // Validate startTime < endTime if either is being changed
      const finalStart = updateData.startTime ?? existing.startTime;
      const finalEnd = updateData.endTime ?? existing.endTime;
      if (new Date(finalStart) >= new Date(finalEnd)) {
        return errorResponse("开始时间必须早于结束时间");
      }
    } else if (existing.status === "PUBLISHED") {
      // PUBLISHED: only description, capacity, location allowed
      const allowedKeys = ["description", "location", "capacity"] as const;
      for (const key of allowedKeys) {
        if (parsed.data[key] !== undefined) {
          updateData[key] = parsed.data[key];
        }
      }

      // Check if any disallowed fields were provided
      const disallowed = Object.keys(parsed.data).filter(
        (k) => !allowedKeys.includes(k as (typeof allowedKeys)[number])
      );
      if (disallowed.length > 0) {
        return errorResponse(
          `已发布的活动仅允许修改描述、容量和地点`
        );
      }
    } else {
      return errorResponse(
        `当前状态(${existing.status})下不允许编辑活动`
      );
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

    return successResponse(activity, "活动更新成功");
  } catch (error) {
    console.error("Update activity error:", error);
    return errorResponse("更新活动失败", 500);
  }
}

// DELETE /api/activities/[id] — 删除活动（仅 DRAFT/CANCELLED 状态）
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
      return errorResponse("仅医生可执行此操作", 403);
    }

    const { id } = await params;

    const existing = await prisma.wellnessActivity.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse("活动");
    }

    if (existing.hospitalId !== user.hospitalId) {
      return errorResponse("无权删除其他医院的活动", 403);
    }

    if (existing.status !== "DRAFT" && existing.status !== "CANCELLED") {
      return errorResponse(
        "仅草稿或已取消的活动可删除"
      );
    }

    // Delete related registrations first, then the activity
    await prisma.$transaction([
      prisma.activityRegistration.deleteMany({
        where: { activityId: id },
      }),
      prisma.wellnessActivity.delete({ where: { id } }),
    ]);

    return successResponse(null, "活动已删除");
  } catch (error) {
    console.error("Delete activity error:", error);
    return errorResponse("删除活动失败", 500);
  }
}
