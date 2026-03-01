# 小程序首页重设计 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将小程序首页从中医水墨棕风格重设计为清新绿色健康风，同时优化布局层级，合并打卡/节气区块，将服务宫格改为横排。

**Architecture:** 分三个文件改动：全局变量（app.scss）、首页样式（index.scss）、首页结构（index.tsx）。先改全局色彩系统，再改各组件样式，最后改 TSX 结构合并节气+打卡。

**Tech Stack:** Taro 4.x, React 18, TypeScript, SCSS（rpx 单位，750rpx 设计稿宽）

**Design Doc:** `docs/plans/2026-02-27-mini-homepage-redesign.md`

---

### Task 1: 更新全局 CSS 变量（配色系统）

**Files:**
- Modify: `apps/mini/src/app.scss`

**Step 1: 替换 page 块内的颜色和阴影变量**

将 `apps/mini/src/app.scss` 中 `page { ... }` 块内的变量替换为新的绿色健康风配色：

```scss
page {
  --color-primary: #2daa6f;          /* 健康绿 */
  --color-primary-deep: #1e8a55;     /* 深绿 */
  --color-primary-light: #5dc48a;    /* 浅绿 */
  --color-bg: #f4fbf7;               /* 浅薄荷白 */
  --color-bg-card: #ffffff;
  --color-text: #1a2e1a;             /* 深墨绿 */
  --color-text-secondary: #5a7a65;   /* 灰绿 */
  --color-text-light: #8aab95;
  --color-border: #c8e6d4;
  --color-border-light: #dff2e8;
  --color-success: #2daa6f;
  --color-danger: #ff6b6b;           /* 珊瑚红 */
  --color-warning: #f9a825;          /* 暖黄 */

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  --shadow-sm: 0 2px 8px rgba(45, 170, 111, 0.08);
  --shadow-md: 0 4px 16px rgba(45, 170, 111, 0.12);
  --shadow-lg: 0 8px 32px rgba(45, 170, 111, 0.15);

  /* spacing/font 不变 */
}
```

**Step 2: 确认保存，视觉检查不崩坏其他页面**

启动小程序预览：
```bash
pnpm dev:mini
```
在微信开发者工具中切换到各页面，确认颜色替换不造成白屏或文字看不见。

**Step 3: Commit**

```bash
git add apps/mini/src/app.scss
git commit -m "style(mini): 全局配色替换为清新绿色健康风"
```

---

### Task 2: 更新顶部 Banner 样式

**Files:**
- Modify: `apps/mini/src/pages/index/index.scss`（仅 banner 相关部分）

**Step 1: 替换 banner 区域样式**

找到 `.banner` 至 `.avatar-text` 这段（约第 10-107 行），**全部替换**为：

```scss
/* ============================================
   顶部 Banner — 清新绿色渐变
   ============================================ */
.banner {
  position: relative;
  padding: 48px 32px 28px;
  overflow: hidden;
}

.banner-deco {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #d4f0e3 0%, #e8f7ef 40%, var(--color-bg) 100%);

  &::after {
    content: '';
    position: absolute;
    top: -60px;
    right: -40px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(45, 170, 111, 0.08) 0%, transparent 70%);
  }
}

.banner-content {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.banner-left {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.greeting {
  font-size: 26px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.nickname {
  font-size: 44px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}

/* 节气胶囊已移除，不再需要 .season-pill */

.avatar-wrap {
  flex-shrink: 0;
  margin-left: 24px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 3px solid rgba(45, 170, 111, 0.2);
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2daa6f 0%, #1e8a55 100%);
  border-color: rgba(45, 170, 111, 0.15);
}

.avatar-text {
  color: #ffffff;
  font-size: 40px;
  font-weight: 600;
}
```

**Step 2: 检查微信开发者工具顶部 Banner 区域**

顶部应呈现浅绿渐变，昵称文字颜色深墨绿，头像圆形边框绿色。

**Step 3: Commit**

```bash
git add apps/mini/src/pages/index/index.scss
git commit -m "style(mini/index): 更新 banner 为绿色渐变风格"
```

---

### Task 3: 更新体质评估卡片样式

**Files:**
- Modify: `apps/mini/src/pages/index/index.scss`（体质卡部分）

**Step 1: 替换 assess-card 区域样式**

找到 `.assess-card` 至 `.result-more__text` 这段（约第 112-279 行），**全部替换**为：

```scss
/* ============================================
   体质评估卡 — 双状态（绿色健康风）
   ============================================ */
.assess-card {
  margin: 0 24px 20px;
  border-radius: 20px;
  padding: 28px;
  box-shadow: var(--shadow-md);
}

/* 未评估 */
.assess-card--empty {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f0faf4 100%);
  border: 1.5px dashed rgba(45, 170, 111, 0.3);
}

.assess-card__badge {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2daa6f 0%, #1e8a55 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 20px;
  box-shadow: 0 4px 12px rgba(45, 170, 111, 0.3);
}

.assess-card__badge-text {
  color: #ffffff;
  font-size: 36px;
  font-weight: 700;
}

.assess-card__body {
  flex: 1;
}

.assess-card__title {
  font-size: 30px;
  font-weight: 600;
  color: var(--color-text);
  display: block;
  margin-bottom: 6px;
}

.assess-card__desc {
  font-size: 24px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.assess-card__arrow {
  flex-shrink: 0;
  margin-left: 12px;
  font-size: 44px;
  color: var(--color-primary);
  font-weight: 300;
}

/* 已评估 */
.assess-card--result {
  background: linear-gradient(135deg, #2daa6f 0%, #1e8a55 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -30px;
    right: -30px;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: -20px;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.04);
  }
}

.result-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
}

.result-label {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-bottom: 6px;
}

.result-name {
  font-size: 42px;
  font-weight: 700;
  color: #ffffff;
}

.result-score-wrap {
  display: flex;
  align-items: baseline;
}

.result-score {
  font-size: 48px;
  font-weight: 700;
  color: #ffffff;
}

.result-score-unit {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 4px;
}

.result-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 20px 0;
}

.result-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
}

.result-tag {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 6px 14px;
}

.result-tag__text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 22px;
}

.result-more {
  flex-shrink: 0;
  margin-left: 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 6px 18px;
}

.result-more__text {
  color: #ffffff;
  font-size: 22px;
}
```

**Step 2: 检查体质卡片渲染**

- 未评估状态：浅绿色虚线卡，绿色圆形图标
- 已评估状态：深绿渐变卡，白色文字

**Step 3: Commit**

```bash
git add apps/mini/src/pages/index/index.scss
git commit -m "style(mini/index): 体质评估卡片改为绿色健康风"
```

---

### Task 4: 合并打卡条 + 节气卡为单行横条（TSX + 样式）

**Files:**
- Modify: `apps/mini/src/pages/index/index.tsx`
- Modify: `apps/mini/src/pages/index/index.scss`

**Step 1: 修改 index.tsx — 删除独立的打卡条和节气卡，替换为合并组件**

在 `index.tsx` 中：

1. **删除** Banner 内的 `.season-pill` View（第 82-87 行）：
```tsx
// 删除这段
<View className='season-pill'>
  <Text className='season-pill__icon'>~</Text>
  <Text className='season-pill__text'>
    {seasonTip.season}季 · {seasonTip.tip}
  </Text>
</View>
```

2. **删除** 独立的打卡提醒条 View（第 150-162 行）：
```tsx
// 删除这段（checkin-bar 整个 View）
<View
  className='checkin-bar'
  onClick={() => Taro.switchTab({ url: '/pages/diary/index' })}
>
  ...
</View>
```

3. **删除** 底部的节气卡 View（第 213-223 行）：
```tsx
// 删除这段（seasonal-card 整个 View）
<View className={`seasonal-card seasonal-card--${seasonTip.key}`}>
  ...
</View>
```

4. **在体质评估卡下方插入**合并横条：
```tsx
{/* 节气 + 打卡 合并横条 */}
<View
  className='daily-bar'
  onClick={() => Taro.switchTab({ url: '/pages/diary/index' })}
>
  <View className='daily-bar__season'>
    <View className={`daily-bar__season-dot daily-bar__season-dot--${seasonTip.key}`} />
    <Text className='daily-bar__season-text'>
      {seasonTip.season}季 · {seasonTip.tip}
    </Text>
  </View>
  <View className='daily-bar__checkin'>
    <Text className='daily-bar__checkin-text'>今日打卡 ›</Text>
  </View>
</View>
```

**Step 2: 在 index.scss 中，替换旧的打卡条+节气卡样式，添加新的 daily-bar 样式**

删除 `.checkin-bar` 至 `.checkin-bar__action` 这段（约第 284-335 行）。
删除 `.seasonal-card` 至末尾的 `.seasonal-card__desc` 这段（约第 471-529 行）。

在 `.section` 样式之前，插入：

```scss
/* ============================================
   节气 + 打卡 合并横条
   ============================================ */
.daily-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 24px 24px;
  background: #ffffff;
  border-radius: var(--radius-md);
  padding: 18px 24px;
  border-left: 4px solid var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.daily-bar__season {
  display: flex;
  align-items: center;
  flex: 1;
}

.daily-bar__season-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;

  &--spring { background: #2daa6f; }
  &--summer { background: #ff6b6b; }
  &--autumn { background: #f9a825; }
  &--winter { background: #5dc48a; }
}

.daily-bar__season-text {
  font-size: 24px;
  color: var(--color-text-secondary);
  flex: 1;
}

.daily-bar__checkin {
  flex-shrink: 0;
  background: var(--color-warning);
  border-radius: 20px;
  padding: 8px 20px;
}

.daily-bar__checkin-text {
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
}
```

**Step 3: 检查合并横条**

页面上打卡条和节气卡应合并为一行，高度明显收窄。

**Step 4: Commit**

```bash
git add apps/mini/src/pages/index/index.tsx apps/mini/src/pages/index/index.scss
git commit -m "feat(mini/index): 合并节气提示与打卡入口为单行横条"
```

---

### Task 5: 核心服务改为横排 1×4

**Files:**
- Modify: `apps/mini/src/pages/index/index.scss`（svc-grid 和 svc-item 样式）

**Step 1: 替换 svc-grid 和 svc-item 样式**

找到 `.svc-grid` 至 `.svc-item__desc` 这段（约第 373-466 行），**全部替换**为：

```scss
/* ============================================
   功能宫格 — 横排 1×4
   ============================================ */
.svc-grid {
  display: flex;
  flex-wrap: nowrap;
  gap: 0;
  justify-content: space-around;
}

.svc-item {
  flex: 1;
  background: transparent;
  padding: 16px 8px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  position: relative;

  &:active {
    opacity: 0.75;
  }
}

.svc-item__icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;

  /* 统一绿色系主题 */
  &--herb {
    background: #e6f7ef;
    .svc-item__icon-char { color: #2daa6f; }
  }

  &--celadon {
    background: #e6f7ef;
    .svc-item__icon-char { color: #1e8a55; }
  }

  &--cinnabar {
    background: #ffeaea;
    .svc-item__icon-char { color: #ff6b6b; }
  }

  &--blue {
    background: #e6f3fb;
    .svc-item__icon-char { color: #3a90c8; }
  }

  &--amber {
    background: #fff5e6;
    .svc-item__icon-char { color: #f9a825; }
  }

  &--purple {
    background: #f0edf8;
    .svc-item__icon-char { color: #7b6cb5; }
  }
}

.svc-item__icon-char {
  font-size: 36px;
  font-weight: 700;
}

.svc-item__title {
  font-size: 26px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 2px;
  text-align: center;
}

.svc-item__desc {
  font-size: 20px;
  color: var(--color-text-secondary);
  text-align: center;
}
```

**Step 2: 检查核心服务和养生天地宫格**

- 核心服务（4项）：横排一行，4个均等
- 养生天地（4项）：因为 `flex-wrap: nowrap` 现在也横排一行

**Step 3: Commit**

```bash
git add apps/mini/src/pages/index/index.scss
git commit -m "style(mini/index): 服务宫格改为横排一行布局"
```

---

### Task 6: 清理剩余旧样式 + section-header 微调

**Files:**
- Modify: `apps/mini/src/pages/index/index.scss`

**Step 1: 更新 section-header 分割线颜色**

找到 `.section-header__line` 的渐变色（约第 354-360 行），将棕色改为绿色：

```scss
.section-header__line {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(45, 170, 111, 0.2) 50%,
    transparent 100%
  );
}
```

**Step 2: 确认 `.footer-space` 保留**

```scss
.footer-space {
  height: 32px;
}
```

**Step 3: 全量视觉检查**

在微信开发者工具中检查：
- [ ] 顶部 Banner 绿色渐变，无棕色痕迹
- [ ] 体质卡（未评估）浅绿虚线框
- [ ] 体质卡（已评估）深绿渐变，分数白色清晰
- [ ] 节气+打卡合并为单行，左侧绿色竖线，右侧暖黄按钮
- [ ] 核心服务 4 图标横排一行
- [ ] 养生天地 4 图标横排一行
- [ ] 页面整体背景浅薄荷白 `#f4fbf7`

**Step 4: 最终 Commit**

```bash
git add apps/mini/src/pages/index/index.scss
git commit -m "style(mini/index): 清理旧样式，section分割线改绿色"
```

---

## 总结

| Task | 改动 | 预计时间 |
|------|------|---------|
| 1 | 全局配色替换 | 5 min |
| 2 | Banner 样式 | 5 min |
| 3 | 体质卡样式 | 5 min |
| 4 | 合并打卡+节气（TSX+SCSS） | 10 min |
| 5 | 服务宫格横排 | 5 min |
| 6 | 清理 + 全量验证 | 5 min |

**全部改动限定在：**
- `apps/mini/src/app.scss`
- `apps/mini/src/pages/index/index.tsx`
- `apps/mini/src/pages/index/index.scss`
