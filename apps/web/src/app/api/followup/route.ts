import { NextRequest } from "next/server";
import { prisma } from "@zhiwebing/db";
import { verifyToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { z } from "zod";

const followupSchema = z.object({
  patientId: z.string().min(1, "患者ID不能为空"),
  name: z.string().min(1, "计划名称不能为空"),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为 YYYY-MM-DD"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为 YYYY-MM-DD")
    .optional(),
  intervalDays: z.number().int().min(1, "间隔天数至少为1"),
  targetConstitutions: z.array(z.string()).optional(),
});

// POST /api/followup - 创建随访计划（医生端）
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return unauthorizedResponse();

    const payload = await verifyToken(token);
    if (!payload) return unauthorizedResponse();

    // 验证是医生角色
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!doctor) {
      return errorResponse("仅医生可创建随访计划", 403);
    }

    const body = await request.json();
    const parsed = followupSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    const { patientId, name, description, startDate, endDate, intervalDays, targetConstitutions } =
      parsed.data;

    // 验证患者存在
    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return errorResponse("患者不存在", 404);
    }

    const startDateObj = new Date(startDate + "T00:00:00.000Z");
    const endDateObj = endDate ? new Date(endDate + "T00:00:00.000Z") : null;

    // 如果没有 endDate，默认生成3个月的随访记录
    const effectiveEndDate =
      endDateObj || new Date(startDateObj.getTime() + 90 * 24 * 60 * 60 * 1000);

    // 生成 FollowupRecord 列表
    const records: Array<{ scheduledDate: Date }> = [];
    let currentDate = new Date(startDateObj);
    while (currentDate <= effectiveEndDate) {
      records.push({ scheduledDate: new Date(currentDate) });
      currentDate.setDate(currentDate.getDate() + intervalDays);
    }

    // 创建随访计划 + 登记 + 记录（嵌套创建）
    const plan = await prisma.followupPlan.create({
      data: {
        doctorId: doctor.id,
        name,
        description,
        startDate: startDateObj,
        endDate: endDateObj,
        intervalDays,
        targetConstitutions: targetConstitutions ?? [],
        enrollments: {
          create: {
            patientId,
            records: {
              create: records,
            },
          },
        },
      },
      include: {
        enrollments: {
          include: {
            patient: {
              include: { user: { select: { name: true } } },
            },
            records: {
              orderBy: { scheduledDate: "asc" },
            },
          },
        },
      },
    });

    return successResponse(plan);
  } catch (error) {
    console.error("Create followup plan error:", error);
    return errorResponse("创建随访计划失败", 500);
  }
}

// GET /api/followup - 获取随访计划列表
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return unauthorizedResponse();

    const payload = await verifyToken(token);
    if (!payload) return unauthorizedResponse();

    // 判断用户角色（医生或患者）
    const [doctorProfile, patientProfile] = await Promise.all([
      prisma.doctorProfile.findUnique({ where: { userId: payload.userId } }),
      prisma.patientProfile.findUnique({ where: { userId: payload.userId } }),
    ]);

    if (doctorProfile) {
      // 医生：返回该医生的所有随访计划
      const plans = await prisma.followupPlan.findMany({
        where: { doctorId: doctorProfile.id },
        orderBy: { updatedAt: "desc" },
        include: {
          doctor: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
          enrollments: {
            include: {
              patient: {
                include: { user: { select: { id: true, name: true, avatar: true } } },
              },
              records: {
                orderBy: { scheduledDate: "desc" },
                take: 3,
              },
            },
          },
        },
      });
      return successResponse(plans);
    } else if (patientProfile) {
      // 患者：返回通过 FollowupEnrollment 关联的随访计划
      const plans = await prisma.followupPlan.findMany({
        where: {
          enrollments: {
            some: { patientId: patientProfile.id },
          },
        },
        orderBy: { updatedAt: "desc" },
        include: {
          doctor: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
          enrollments: {
            where: { patientId: patientProfile.id },
            include: {
              records: {
                orderBy: { scheduledDate: "desc" },
                take: 3,
              },
            },
          },
        },
      });
      return successResponse(plans);
    } else {
      return errorResponse("用户角色无效", 403);
    }
  } catch (error) {
    console.error("Get followup plans error:", error);
    return errorResponse("获取随访计划失败", 500);
  }
}
