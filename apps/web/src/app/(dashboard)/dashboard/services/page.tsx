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
} from "lucide-react";
import {
  SERVICE_CATEGORY_CONFIG,
  CONSTITUTION_INFO,
} from "@zhiwebing/shared";
import type { ConstitutionType, ServiceCategoryKey } from "@zhiwebing/shared";

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

const CATEGORIES = Object.entries(SERVICE_CATEGORY_CONFIG) as [
  ServiceCategoryKey,
  (typeof SERVICE_CATEGORY_CONFIG)[ServiceCategoryKey]
][];

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

const emptyForm = {
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

export default function ServicesPage() {
  const [services, setServices] = useState<WellnessService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
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
    setForm(emptyForm);
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
        benefits: form.benefits
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        precautions: form.precautions
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        duration: form.duration || undefined,
        price: form.price || undefined,
        suitableFor: form.suitableFor,
        contraindicatedFor: form.contraindicatedFor,
        isSeasonalOnly: form.isSeasonalOnly,
        seasonalNote: form.seasonalNote || undefined,
        sortOrder: form.sortOrder,
      };

      if (editingId) {
        await apiFetch(`/api/services/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink-900">
            康养服务管理
          </h1>
          <p className="text-muted-foreground mt-1">
            管理康养服务项目，支持上下架控制
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          新建服务
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索服务名称..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setCategoryFilter("all");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === "all"
                ? "bg-herb-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-herb-100"
            }`}
          >
            全部
          </button>
          {CATEGORIES.map(([key, config]) => (
            <button
              key={key}
              onClick={() => {
                setCategoryFilter(key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === key
                  ? "bg-herb-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-herb-100"
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Service Cards Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-12 w-12 rounded-lg mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
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
            const catConfig =
              SERVICE_CATEGORY_CONFIG[svc.category] ||
              SERVICE_CATEGORY_CONFIG.OTHER;
            return (
              <Card
                key={svc.id}
                className={`card-hover ${!svc.isActive ? "opacity-60" : ""}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white text-lg font-bold"
                      style={{ backgroundColor: catConfig.color }}
                    >
                      {catConfig.icon}
                    </div>
                    <Switch
                      checked={svc.isActive}
                      onCheckedChange={() => handleToggle(svc.id)}
                    />
                  </div>

                  <h3 className="font-semibold text-ink-900 mb-1">
                    {svc.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {svc.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    {svc.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {svc.duration}
                      </span>
                    )}
                    {svc.price && (
                      <span className="flex items-center gap-1">
                        <CircleDollarSign className="h-3 w-3" />
                        {svc.price}
                      </span>
                    )}
                    {svc.isSeasonalOnly && (
                      <Badge variant="warning" className="text-[10px]">
                        季节限定
                      </Badge>
                    )}
                  </div>

                  {/* Suitable constitutions */}
                  {svc.suitableFor && svc.suitableFor.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {svc.suitableFor.slice(0, 4).map((ct) => (
                        <Badge
                          key={ct}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {CONSTITUTION_INFO[ct]?.name || ct}
                        </Badge>
                      ))}
                      {svc.suitableFor.length > 4 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{svc.suitableFor.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => openEdit(svc)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-1 text-cinnabar-500 hover:text-cinnabar-600"
                      onClick={() => setDeleteConfirm(svc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      删除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            下一页
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "编辑康养服务" : "新建康养服务"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">服务名称 *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="如：艾灸温经调理"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">服务分类 *</Label>
                <Select
                  id="category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value as ServiceCategoryKey,
                    }))
                  }
                >
                  {CATEGORIES.map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">服务描述 *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="详细描述服务内容和特色"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="benefits">功效（每行一条）</Label>
                <Textarea
                  id="benefits"
                  value={form.benefits}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, benefits: e.target.value }))
                  }
                  placeholder={"温通经络\n补益元气\n调和气血"}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precautions">注意事项（每行一条）</Label>
                <Textarea
                  id="precautions"
                  value={form.precautions}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, precautions: e.target.value }))
                  }
                  placeholder={"孕妇禁用\n皮肤破损处不宜"}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">时长</Label>
                <Input
                  id="duration"
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: e.target.value }))
                  }
                  placeholder="如：45分钟"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">价格</Label>
                <Input
                  id="price"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="如：¥128"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">排序</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>适用体质</Label>
              <ConstitutionCheckboxGroup
                value={form.suitableFor}
                onChange={(v) => setForm((f) => ({ ...f, suitableFor: v }))}
              />
            </div>

            <div className="space-y-2">
              <Label>禁忌体质</Label>
              <ConstitutionCheckboxGroup
                value={form.contraindicatedFor}
                onChange={(v) =>
                  setForm((f) => ({ ...f, contraindicatedFor: v }))
                }
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isSeasonalOnly}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isSeasonalOnly: v }))
                  }
                />
                <Label>季节限定服务</Label>
              </div>
              {form.isSeasonalOnly && (
                <Input
                  value={form.seasonalNote}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seasonalNote: e.target.value }))
                  }
                  placeholder="如：仅限三伏天"
                  className="flex-1"
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "保存中..." : editingId ? "更新" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            确定要删除该康养服务吗？此操作不可撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
