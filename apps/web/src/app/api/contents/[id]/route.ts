import { NextRequest } from "next/server";
import { prisma, ContentType } from "@zhiwebing/db";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

/** Helper to get authenticated doctor's hospitalId */
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

// GET /api/contents/[id] -- content detail with full body
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const content = await prisma.healthContent.findUnique({
      where: { id },
      include: {
        hospital: { select: { id: true, name: true } },
      },
    });

    if (!content) {
      return notFoundResponse("内容");
    }

    // If content is unpublished, only doctors from the same hospital can see it
    if (!content.isPublished) {
      const doctorHospitalId = await getDoctorHospitalId(request);
      if (!doctorHospitalId || doctorHospitalId !== content.hospitalId) {
        return notFoundResponse("内容");
      }
    }

    // fire-and-forget: increment view count without blocking
    prisma.healthContent
      .update({ where: { id }, data: { viewCount: { increment: 1 } } })
      .catch((e) => console.error("viewCount increment error:", e));

    return successResponse(content);
  } catch (error) {
    console.error("Get content detail error:", error);
    return errorResponse("获取内容详情失败", 500);
  }
}

// ---- PUT: Update content (doctor auth required) ----

const updateContentSchema = z.object({
  title: z.string().min(1, "标题不能为空").optional(),
  summary: z.string().min(1, "摘要不能为空").optional(),
  body: z.string().min(1, "正文不能为空").optional(),
  contentType: z
    .nativeEnum(ContentType, {
      errorMap: () => ({ message: "无效的内容类型" }),
    })
    .optional(),
  solarTermKey: z.string().nullable().optional(),
  constitutions: z.array(z.string()).optional(),
  authorName: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

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
      return errorResponse("仅医生可更新健康内容", 403);
    }

    const { id } = await params;

    const existing = await prisma.healthContent.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse("内容");
    }

    if (existing.hospitalId && existing.hospitalId !== user.hospitalId) {
      return errorResponse("无权修改其他医院的内容", 403);
    }

    const body = await request.json();
    const parsed = updateContentSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    const content = await prisma.healthContent.update({
      where: { id },
      data: parsed.data,
      include: {
        hospital: { select: { id: true, name: true } },
      },
    });

    return successResponse(content, "健康内容更新成功");
  } catch (error) {
    console.error("Update content error:", error);
    return errorResponse("更新健康内容失败", 500);
  }
}

// ---- DELETE: Only unpublished content can be deleted ----

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
      return errorResponse("仅医生可删除健康内容", 403);
    }

    const { id } = await params;

    const existing = await prisma.healthContent.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse("内容");
    }

    if (existing.hospitalId && existing.hospitalId !== user.hospitalId) {
      return errorResponse("无权删除其他医院的内容", 403);
    }

    if (existing.isPublished) {
      return errorResponse("已发布的内容不能直接删除，请先取消发布");
    }

    await prisma.healthContent.delete({ where: { id } });

    return successResponse(null, "健康内容已删除");
  } catch (error) {
    console.error("Delete content error:", error);
    return errorResponse("删除健康内容失败", 500);
  }
}
