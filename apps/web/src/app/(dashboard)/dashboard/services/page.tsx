"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConstitutionCheckboxGroup } from "@/components/constitution-checkbox-group";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Clock,
  CircleDollarSign,
  Leaf,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  SERVICE_CATEGORY_CONFIG,
  CONSTITUTION_INFO,
} from "@zhiwebing/shared";
import type { ConstitutionType, ServiceCategoryKey } from "@zhiwebing/shared";

// ── Types ────────────────────────────────────────────────────────

interface WellnessService {
  id: string;
  name: string;
  category: ServiceCategoryKey;
  description: string;
  benefits: string[];
  precautions: string[];
  duration: string | null;
  price: string | null;
  suitableFor: ConstitutionType[];
  contraindicatedFor: ConstitutionType[] | null;
  isSeasonalOnly: boolean;
  seasonalNote: string | null;
  isActive: boolean;
  sortOrder: number;
}

type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

interface Appointment {
  id: string;
  serviceId: string;
  patientId: string;
  doctorId: string | null;
  scheduledDate: string;
  scheduledTime: string;
  status: AppointmentStatus;
  note: string | null;
  completionNote: string | null;
  cancelReason: string | null;
  service: { id: string; name: string; category: string };
  patient: { id: string; user: { name: string | null } };
  doctor: { id: string; title: string | null; user: { name: string | null } } | null;
}

interface Patient {
  id: string;
  user: { name: string | null };
}

interface Doctor {
  id: string;
  title: string | null;
  user: { name: string | null };
}

// ── Constants ────────────────────────────────────────────────────

const CATEGORIES = Object.entries(SERVICE_CATEGORY_CONFIG) as [
  ServiceCategoryKey,
  (typeof SERVICE_CATEGORY_CONFIG)[ServiceCategoryKey]
][];

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; variant: "warning" | "success" | "secondary" | "danger" | "outline"; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: "待确认", variant: "warning", icon: AlertCircle },
  CONFIRMED: { label: "已确认", variant: "success", icon: CheckCircle2 },
  COMPLETED: { label: "已完成", variant: "secondary", icon: CheckCircle2 },
  CANCELLED: { label: "已取消", variant: "outline", icon: XCircle },
  NO_SHOW: { label: "未到诊", variant: "danger", icon: XCircle },
};

// ── Helpers ──────────────────────────────────────────────────────

function getToken() {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];
}

async function apiFetch(url: string, options?: RequestInit) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "请求失败");
  return data;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ── Service Form ─────────────────────────────────────────────────

const emptyServiceForm = {
  name: "",
  category: "MOXIBUSTION" as ServiceCategoryKey,
  description: "",
  benefits: "",
  precautions: "",
  duration: "",
  price: "",
  suitableFor: [] as ConstitutionType[],
  contraindicatedFor: [] as ConstitutionType[],
  isSeasonalOnly: false,
  seasonalNote: "",
  sortOrder: 0,
};

// ── Main Page ────────────────────────────────────────────────────

export default function ServicesPage() {
  const [mainTab, setMainTab] = useState("services");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-900">
            康养服务管理
          </h1>
          <p className="text-muted-foreground mt-1">
            管理康养服务项目与患者预约
          </p>
        </div>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="services">服务项目</TabsTrigger>
          <TabsTrigger value="appointments">预约管理</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-4">
          <ServiceCatalogTab />
        </TabsContent>

        <TabsContent value="appointments" className="mt-4">
          <AppointmentManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Tab 1: Service Catalog ────────────────────────────────────────

function ServiceCatalogTab() {
  const [services, setServices] = useState<WellnessService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyServiceForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        isActive: "all",
      });
      if (search) params.set("search", search);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      const data = await apiFetch(`/api/services?${params}`);
      setServices(data.data.items);
      setTotal(data.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleToggle = async (id: string) => {
    try {
      await apiFetch(`/api/services/${id}/toggle`, { method: "PATCH" });
      fetchServices();
    } catch (e) {
      console.error(e);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyServiceForm);
    setDialogOpen(true);
  };

  const openEdit = (svc: WellnessService) => {
    setEditingId(svc.id);
    setForm({
      name: svc.name,
      category: svc.category,
      description: svc.description,
      benefits: (svc.benefits || []).join("\n"),
      precautions: (svc.precautions || []).join("\n"),
      duration: svc.duration || "",
      price: svc.price || "",
      suitableFor: svc.suitableFor || [],
      contraindicatedFor: svc.contraindicatedFor || [],
      isSeasonalOnly: svc.isSeasonalOnly,
      seasonalNote: svc.seasonalNote || "",
      sortOrder: svc.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        description: form.description,
        benefits: form.benefits.split("\n").map((s) => s.trim()).filter(Boolean),
        precautions: form.precautions.split("\n").map((s) => s.trim()).filter(Boolean),
        duration: form.duration || undefined,
        price: form.price || undefined,
        suitableFor: form.suitableFor,
        contraindicatedFor: form.contraindicatedFor,
        isSeasonalOnly: form.isSeasonalOnly,
        seasonalNote: form.seasonalNote || undefined,
        sortOrder: form.sortOrder,
      };
      if (editingId) {
        await apiFetch(`/api/services/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/api/services", { method: "POST", body: JSON.stringify(payload) });
      }
      setDialogOpen(false);
      fetchServices();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/services/${id}`, { method: "DELETE" });
      setDeleteConfirm(null);
      fetchServices();
    } catch (e) {
      console.error(e);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索服务名称..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => { setCategoryFilter("all"); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoryFilter === "all" ? "bg-herb-600 text-white" : "bg-muted text-muted-foreground hover:bg-herb-100"}`}
            >
              全部
            </button>
            {CATEGORIES.map(([key, config]) => (
              <button
                key={key}
                onClick={() => { setCategoryFilter(key); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoryFilter === key ? "bg-herb-600 text-white" : "bg-muted text-muted-foreground hover:bg-herb-100"}`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
        <Button className="gap-2 ml-3" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          新建服务
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-12 w-12 rounded-lg mb-3" /><Skeleton className="h-5 w-3/4 mb-2" /><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Leaf className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-lg font-medium">暂无服务</p>
            <p className="text-sm mt-1">点击"新建服务"添加第一个康养服务</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => {
            const catConfig = SERVICE_CATEGORY_CONFIG[svc.category] || SERVICE_CATEGORY_CONFIG.OTHER;
            return (
              <Card key={svc.id} className={`card-hover ${!svc.isActive ? "opacity-60" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg text-white text-lg font-bold" style={{ backgroundColor: catConfig.color }}>
                      {catConfig.icon}
                    </div>
                    <Switch checked={svc.isActive} onCheckedChange={() => handleToggle(svc.id)} />
                  </div>

                  <h3 className="font-semibold text-ink-900 mb-1">{svc.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{svc.description}</p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    {svc.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{svc.duration}</span>}
                    {svc.price && <span className="flex items-center gap-1"><CircleDollarSign className="h-3 w-3" />{svc.price}</span>}
                    {svc.isSeasonalOnly && <Badge variant="warning" className="text-[10px]">季节限定</Badge>}
                  </div>

                  {svc.suitableFor && svc.suitableFor.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {svc.suitableFor.slice(0, 4).map((ct) => (
                        <Badge key={ct} variant="secondary" className="text-[10px]">{CONSTITUTION_INFO[ct]?.name || ct}</Badge>
                      ))}
                      {svc.suitableFor.length > 4 && <Badge variant="outline" className="text-[10px]">+{svc.suitableFor.length - 4}</Badge>}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button variant="ghost" size="sm" className="flex-1 gap-1" onClick={() => openEdit(svc)}>
                      <Pencil className="h-3.5 w-3.5" />编辑
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 gap-1 text-cinnabar-500 hover:text-cinnabar-600" onClick={() => setDeleteConfirm(svc.id)}>
                      <Trash2 className="h-3.5 w-3.5" />删除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>上一页</Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>下一页</Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "编辑康养服务" : "新建康养服务"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">服务名称 *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="如：艾灸温经调理" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">服务分类 *</Label>
                <Select id="category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ServiceCategoryKey }))}>
                  {CATEGORIES.map(([key, config]) => (<option key={key} value={key}>{config.label}</option>))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">服务描述 *</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="详细描述服务内容和特色" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="benefits">功效（每行一条）</Label>
                <Textarea id="benefits" value={form.benefits} onChange={(e) => setForm((f) => ({ ...f, benefits: e.target.value }))} placeholder={"温通经络\n补益元气\n调和气血"} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precautions">注意事项（每行一条）</Label>
                <Textarea id="precautions" value={form.precautions} onChange={(e) => setForm((f) => ({ ...f, precautions: e.target.value }))} placeholder={"孕妇禁用\n皮肤破损处不宜"} rows={3} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">时长</Label>
                <Input id="duration" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="如：45分钟" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">价格</Label>
                <Input id="price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="如：¥128" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">排序</Label>
                <Input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>适用体质</Label>
              <ConstitutionCheckboxGroup value={form.suitableFor} onChange={(v) => setForm((f) => ({ ...f, suitableFor: v }))} />
            </div>
            <div className="space-y-2">
              <Label>禁忌体质</Label>
              <ConstitutionCheckboxGroup value={form.contraindicatedFor} onChange={(v) => setForm((f) => ({ ...f, contraindicatedFor: v }))} />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.isSeasonalOnly} onCheckedChange={(v) => setForm((f) => ({ ...f, isSeasonalOnly: v }))} />
                <Label>季节限定服务</Label>
              </div>
              {form.isSeasonalOnly && (
                <Input value={form.seasonalNote} onChange={(e) => setForm((f) => ({ ...f, seasonalNote: e.target.value }))} placeholder="如：仅限三伏天" className="flex-1" />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "保存中..." : editingId ? "更新" : "创建"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">确定要删除该康养服务吗？此操作不可撤销。</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>取消</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Tab 2: Appointment Management ────────────────────────────────

function AppointmentManagementTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // New appointment dialog
  const [newApptOpen, setNewApptOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<WellnessService[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [apptForm, setApptForm] = useState({
    serviceId: "",
    patientId: "",
    doctorId: "",
    scheduledDate: "",
    scheduledTime: "09:00",
    note: "",
  });
  const [apptSaving, setApptSaving] = useState(false);

  // Expand row
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const data = await apiFetch(`/api/appointments?${params}`);
      setAppointments(data.data.items);
      setTotal(data.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const loadDialogData = async () => {
    try {
      const [pData, sData] = await Promise.all([
        apiFetch("/api/patients?pageSize=100"),
        apiFetch("/api/services?pageSize=100&isActive=true"),
      ]);
      setPatients(pData.data.items || []);
      setServices(sData.data.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  const openNewAppt = () => {
    setApptForm({ serviceId: "", patientId: "", doctorId: "", scheduledDate: "", scheduledTime: "09:00", note: "" });
    loadDialogData();
    setNewApptOpen(true);
  };

  const loadDoctors = async (serviceId: string) => {
    if (!serviceId) return;
    try {
      const data = await apiFetch(`/api/services/${serviceId}/schedules`);
      const uniqueDoctors = Array.from(
        new Map((data.data || []).map((s: { doctor: Doctor }) => [s.doctor.id, s.doctor])).values()
      ) as Doctor[];
      setDoctors(uniqueDoctors);
    } catch (e) {
      console.error(e);
      setDoctors([]);
    }
  };

  const handleCreateAppt = async () => {
    setApptSaving(true);
    try {
      await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          serviceId: apptForm.serviceId,
          patientId: apptForm.patientId,
          doctorId: apptForm.doctorId || undefined,
          scheduledDate: apptForm.scheduledDate,
          scheduledTime: apptForm.scheduledTime,
          note: apptForm.note || undefined,
        }),
      });
      setNewApptOpen(false);
      fetchAppointments();
    } catch (e) {
      console.error(e);
    } finally {
      setApptSaving(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: AppointmentStatus, extra?: { completionNote?: string; cancelReason?: string }) => {
    setUpdatingId(id);
    try {
      await apiFetch(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...extra }),
      });
      fetchAppointments();
      setExpandedId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/appointments/${id}`, { method: "DELETE" });
      fetchAppointments();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setCompletionNote("");
      setCancelReason("");
    }
  };

  const STATUS_FILTERS = [
    { value: "all", label: "全部" },
    { value: "PENDING", label: "待确认" },
    { value: "CONFIRMED", label: "已确认" },
    { value: "COMPLETED", label: "已完成" },
    { value: "CANCELLED", label: "已取消" },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === f.value ? "bg-herb-600 text-white" : "bg-muted text-muted-foreground hover:bg-herb-100"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button className="gap-2" onClick={openNewAppt}>
          <Plus className="h-4 w-4" />
          新建预约
        </Button>
      </div>

      {loading ? (
        <Card><CardContent className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CalendarCheck className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-lg font-medium">暂无预约记录</p>
            <p className="text-sm mt-1">点击"新建预约"为患者安排康养服务</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">患者</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">服务</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">医生</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">时间</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">状态</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => {
                    const sc = STATUS_CONFIG[appt.status];
                    const isExpanded = expandedId === appt.id;
                    return (
                      <>
                        <tr
                          key={appt.id}
                          className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer"
                          onClick={() => toggleExpand(appt.id)}
                        >
                          <td className="px-4 py-3 font-medium text-ink-900">
                            {appt.patient?.user?.name || "—"}
                          </td>
                          <td className="px-4 py-3 text-ink-700">{appt.service?.name || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {appt.doctor ? `${appt.doctor.user?.name || ""}${appt.doctor.title ? ` (${appt.doctor.title})` : ""}` : "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {formatDate(appt.scheduledDate)} {appt.scheduledTime}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={sc.variant} className="text-[10px] gap-1">
                              {sc.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              {appt.status === "PENDING" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs text-celadon-600 hover:text-celadon-700 hover:bg-celadon-50"
                                    disabled={updatingId === appt.id}
                                    onClick={() => handleStatusUpdate(appt.id, "CONFIRMED")}
                                  >
                                    确认
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-cinnabar-500 hover:text-cinnabar-600"
                                    disabled={updatingId === appt.id}
                                    onClick={() => handleDelete(appt.id)}
                                  >
                                    删除
                                  </Button>
                                </>
                              )}
                              {appt.status === "CONFIRMED" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => toggleExpand(appt.id)}
                                >
                                  完成
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toggleExpand(appt.id)}>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${appt.id}-expand`} className="bg-muted/10 border-b border-border">
                            <td colSpan={6} className="px-4 py-3">
                              <div className="space-y-3">
                                {appt.note && (
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">备注：</span>
                                    <span className="text-xs text-ink-700 ml-1">{appt.note}</span>
                                  </div>
                                )}
                                {appt.completionNote && (
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">完成记录：</span>
                                    <span className="text-xs text-ink-700 ml-1">{appt.completionNote}</span>
                                  </div>
                                )}
                                {appt.cancelReason && (
                                  <div>
                                    <span className="text-xs font-medium text-muted-foreground">取消原因：</span>
                                    <span className="text-xs text-ink-700 ml-1">{appt.cancelReason}</span>
                                  </div>
                                )}
                                {appt.status === "CONFIRMED" && (
                                  <div className="space-y-2">
                                    <Textarea
                                      placeholder="填写完成记录（可选）"
                                      value={completionNote}
                                      onChange={(e) => setCompletionNote(e.target.value)}
                                      rows={2}
                                      className="text-xs"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        className="text-xs"
                                        disabled={updatingId === appt.id}
                                        onClick={() => handleStatusUpdate(appt.id, "COMPLETED", { completionNote: completionNote || undefined })}
                                      >
                                        标记完成
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs text-cinnabar-500"
                                        disabled={updatingId === appt.id}
                                        onClick={() => handleStatusUpdate(appt.id, "NO_SHOW")}
                                      >
                                        未到诊
                                      </Button>
                                      <div className="flex gap-1 flex-1">
                                        <Input
                                          placeholder="取消原因（可选）"
                                          value={cancelReason}
                                          onChange={(e) => setCancelReason(e.target.value)}
                                          className="text-xs h-8"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-xs text-cinnabar-500 whitespace-nowrap"
                                          disabled={updatingId === appt.id}
                                          onClick={() => handleStatusUpdate(appt.id, "CANCELLED", { cancelReason: cancelReason || undefined })}
                                        >
                                          取消预约
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {appt.status === "PENDING" && (
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="取消原因（可选）"
                                      value={cancelReason}
                                      onChange={(e) => setCancelReason(e.target.value)}
                                      className="text-xs h-8 max-w-xs"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs text-cinnabar-500"
                                      disabled={updatingId === appt.id}
                                      onClick={() => handleStatusUpdate(appt.id, "CANCELLED", { cancelReason: cancelReason || undefined })}
                                    >
                                      取消预约
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>上一页</Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>下一页</Button>
        </div>
      )}

      {/* New Appointment Dialog */}
      <Dialog open={newApptOpen} onOpenChange={setNewApptOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新建预约</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>选择患者 *</Label>
              <Select
                value={apptForm.patientId}
                onChange={(e) => setApptForm((f) => ({ ...f, patientId: e.target.value }))}
              >
                <option value="">— 选择患者 —</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.user?.name || p.id}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>选择服务 *</Label>
              <Select
                value={apptForm.serviceId}
                onChange={(e) => {
                  const sid = e.target.value;
                  setApptForm((f) => ({ ...f, serviceId: sid, doctorId: "" }));
                  loadDoctors(sid);
                }}
              >
                <option value="">— 选择服务 —</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
            {doctors.length > 0 && (
              <div className="space-y-2">
                <Label>选择医生</Label>
                <Select
                  value={apptForm.doctorId}
                  onChange={(e) => setApptForm((f) => ({ ...f, doctorId: e.target.value }))}
                >
                  <option value="">— 不指定医生 —</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.user?.name || "—"}{d.title ? ` (${d.title})` : ""}</option>
                  ))}
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>预约日期 *</Label>
                <Input
                  type="date"
                  value={apptForm.scheduledDate}
                  onChange={(e) => setApptForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>预约时间 *</Label>
                <Input
                  type="time"
                  value={apptForm.scheduledTime}
                  onChange={(e) => setApptForm((f) => ({ ...f, scheduledTime: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>备注/主诉</Label>
              <Textarea
                placeholder="患者主诉或备注信息（可选）"
                value={apptForm.note}
                onChange={(e) => setApptForm((f) => ({ ...f, note: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewApptOpen(false)}>取消</Button>
            <Button
              onClick={handleCreateAppt}
              disabled={apptSaving || !apptForm.patientId || !apptForm.serviceId || !apptForm.scheduledDate}
            >
              {apptSaving ? "创建中..." : "创建预约"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
