import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Ban,
  Bell,
  Building2,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Command,
  CreditCard,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Handshake,
  HelpCircle,
  Inbox,
  Kanban,
  Layers,
  LayoutGrid,
  List,
  Mail,
  MoreHorizontal,
  MoreVertical,
  Phone,
  Plus,
  Printer,
  Receipt,
  Search,
  Send,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocation } from "wouter";

/* ==========================================================================
   定数・マスターデータ定義
   ========================================================================== */

export const STAGES = [
  { key: "lead", label: "リード獲得", color: "#60a5fa", probability: 10, description: "初期問い合わせ・展示会等のアプローチ段階" },
  { key: "qualification", label: "ヒアリング", color: "#38bdf8", probability: 25, description: "課題抽出・予算感・意思決定者の確認" },
  { key: "proposal", label: "提案・見積提出", color: "#818cf8", probability: 50, description: "提案書提示・見積書提示・デモ実施" },
  { key: "negotiation", label: "条件交渉・稟議", color: "#f472b6", probability: 75, description: "価格・納期・契約条項の最終すり合わせ" },
  { key: "won", label: "受注（成約）", color: "#34d399", probability: 100, description: "契約締結・受注確定" },
  { key: "lost", label: "失注", color: "#94a3b8", probability: 0, description: "見送り・他社選定" },
] as const;

export const DOC_TYPES: Record<string, { label: string; icon: any; tone: string }> = {
  quote: { label: "見積書", icon: FileText, tone: "blue" },
  order: { label: "受注伝票", icon: FileCheck, tone: "purple" },
  invoice: { label: "請求書", icon: Receipt, tone: "amber" },
};

export const DOC_STATUSES: Record<string, { label: string; tone: "neutral" | "info" | "warning" | "success" | "danger" }> = {
  draft: { label: "下書き", tone: "neutral" },
  sent: { label: "送付済み", tone: "info" },
  confirmed: { label: "受注確定", tone: "info" },
  unpaid: { label: "入金待ち", tone: "warning" },
  paid: { label: "入金消込済", tone: "success" },
  overdue: { label: "期日超過", tone: "danger" },
};

const fallbackCompanies = [
  { id: 1, name: "東雲テクノロジーズ株式会社", segment: "Enterprise", industry: "SaaS / IT", location: "東京都渋谷区", ownerName: "田中 幹也", status: "active" },
  { id: 2, name: "カイトデザイン研究所", segment: "Growth", industry: "デザイン・広告", location: "大阪府大阪市", ownerName: "佐藤 葵", status: "active" },
  { id: 3, name: "アトラス・ロジスティクス株式会社", segment: "Enterprise", industry: "物流・サプライチェーン", location: "神奈川県横浜市", ownerName: "田中 幹也", status: "active" },
  { id: 4, name: "モノクローム工業株式会社", segment: "SMB", industry: "精密製造業", location: "愛知県名古屋市", ownerName: "伊藤 結衣", status: "active" },
  { id: 5, name: "パルスメディア株式会社", segment: "Growth", industry: "デジタルメディア", location: "東京都目黒区", ownerName: "佐藤 葵", status: "active" },
];

const fallbackContacts = [
  { id: 1, companyId: 1, name: "佐伯 直人", email: "naoto.saeki@shinonome.co.jp", phone: "03-6200-4401", role: "事業統括責任者 (VP)", ownerName: "田中 幹也", status: "active", lastContactAt: "2026-08-27" },
  { id: 2, companyId: 2, name: "白石 玲奈", email: "reina@kite-design.jp", phone: "06-6320-1021", role: "代表取締役 CEO", ownerName: "佐藤 葵", status: "active", lastContactAt: "2026-08-26" },
  { id: 3, companyId: 3, name: "アレックス・モルガン", email: "alex@atlaslogistics.jp", phone: "045-310-9380", role: "DX推進室長", ownerName: "田中 幹也", status: "active", lastContactAt: "2026-08-25" },
  { id: 4, companyId: 4, name: "井上 由佳", email: "yuka.inoue@monochrome.jp", phone: "052-900-0178", role: "経営企画課長", ownerName: "伊藤 結衣", status: "active", lastContactAt: "2026-08-20" },
];

const fallbackDeals = [
  { id: 1, companyId: 1, title: "東雲｜全社データプラットフォーム構築案件", stage: "negotiation", amount: 4800000, probability: 75, ownerName: "田中 幹也", nextAction: "取締役会稟議の承認結果確認", status: "open" },
  { id: 2, companyId: 2, title: "カイト｜ブランド基幹リニューアル支援", stage: "proposal", amount: 1800000, probability: 50, ownerName: "佐藤 葵", nextAction: "改訂版見積書 (v3) の送付と説明会", status: "open" },
  { id: 3, companyId: 3, title: "アトラス｜倉庫自動化DX PoCプロジェクト", stage: "qualification", amount: 3200000, probability: 25, ownerName: "田中 幹也", nextAction: "業務フロー要件定義ミーティング", status: "open" },
  { id: 4, companyId: 4, title: "モノクローム｜受発注EDIシステム連携", stage: "lead", amount: 950000, probability: 10, ownerName: "伊藤 結衣", nextAction: "初回オンラインヒアリングの実施", status: "open" },
  { id: 5, companyId: 5, title: "パルス｜統合顧客ポータル開発", stage: "won", amount: 2600000, probability: 100, ownerName: "佐藤 葵", nextAction: "開発キックオフ会議の日程調整", status: "won" },
  { id: 6, companyId: 1, title: "東雲｜カスタマーサクセス分析モジュール追加", stage: "proposal", amount: 1400000, probability: 50, ownerName: "田中 幹也", nextAction: "投資対効果 (ROI) 試算資料の提示", status: "open" },
];

const fallbackDocuments = [
  { id: 1, companyId: 1, dealId: 1, type: "invoice", number: "INV-2026-0084", status: "unpaid", amount: 4800000, dueDate: "2026-09-15" },
  { id: 2, companyId: 2, dealId: 2, type: "quote", number: "QUO-2026-0118", status: "sent", amount: 1800000, dueDate: "2026-09-02" },
  { id: 3, companyId: 5, dealId: 5, type: "order", number: "ORD-2026-0042", status: "confirmed", amount: 2600000, dueDate: "2026-08-30" },
  { id: 4, companyId: 3, dealId: 3, type: "quote", number: "QUO-2026-0121", status: "draft", amount: 3200000, dueDate: "2026-09-08" },
  { id: 5, companyId: 4, dealId: 4, type: "invoice", number: "INV-2026-0079", status: "paid", amount: 950000, dueDate: "2026-08-20" },
];

const fallbackTasks = [
  { id: 1, title: "東雲テクノロジーズへ最終稟議用仕様書と見積書を送付", assignee: "田中 幹也", status: "open", priority: "high", kind: "提案", dueAt: "本日 15:30", companyId: 1, dealId: 1 },
  { id: 2, title: "カイトデザイン研究所の稟議通過状況を電話でフォロー", assignee: "佐藤 葵", status: "open", priority: "normal", kind: "フォロー", dueAt: "明日 10:00", companyId: 2, dealId: 2 },
  { id: 3, title: "アトラス・ロジスティクス要件定義の議事録共有と次回調整", assignee: "田中 幹也", status: "done", priority: "normal", kind: "議事録", dueAt: "昨日", companyId: 3, dealId: 3 },
  { id: 4, title: "9月末入金予定の請求書（INV-2026-0084）確認", assignee: "伊藤 結衣", status: "open", priority: "high", kind: "請求管理", dueAt: "8/31 17:00", companyId: 1 },
];

const fallbackActivities = [
  { id: 1, type: "call", title: "佐伯 直人様（事業統括VP）との通話メモ", body: "役員稟議は来週火曜日予定。セキュリティチェックシートの返送を依頼受領。", ownerName: "田中 幹也", occurredAt: "15分前", companyId: 1 },
  { id: 2, type: "quote", title: "見積書 QUO-2026-0118 を電子送付", body: "カイトデザイン研究所様へブランド基幹刷新の見積書 (¥1,800,000) を発行送付。", ownerName: "佐藤 葵", occurredAt: "1時間前", companyId: 2 },
  { id: 3, type: "email", title: "アトラス・ロジスティクス様へフォローアップメール送信", body: "要件定義ワークショップの候補日時を3日程提示。", ownerName: "田中 幹也", occurredAt: "昨日 16:20", companyId: 3 },
  { id: 4, type: "won", title: "パルスメディア様の商談を受注（成約）へ更新", body: "受注確定金額: ¥2,600,000 / 契約締結完了。", ownerName: "佐藤 葵", occurredAt: "昨日 11:00", companyId: 5 },
];

const fallbackNotifications = [
  { id: 1, kind: "attention", title: "請求書 INV-2026-0084 の入金期日が近づいています", body: "東雲テクノロジーズ株式会社（¥4,800,000）／ 入金期日: 9月15日", isRead: 0 },
  { id: 2, kind: "deal", title: "商談ステージが「受注（成約）」に更新されました", body: "パルスメディア株式会社｜統合顧客ポータル開発（¥2,600,000）", isRead: 0 },
  { id: 3, kind: "task", title: "本日対応予定の高優先タスクがあります", body: "「東雲テクノロジーズへ最終稟議用仕様書と見積書を送付」をご確認ください", isRead: 1 },
];

/* ==========================================================================
   ユーティリティ関数
   ========================================================================== */

const formatCurrency = (val: number) => `¥${new Intl.NumberFormat("ja-JP").format(val)}`;
const formatCompactCurrency = (val: number) => {
  if (val >= 100000000) return `¥${(val / 100000000).toFixed(2)}億円`;
  if (val >= 10000) return `¥${(val / 10000).toFixed(0)}万円`;
  return formatCurrency(val);
};

const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const content = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
};

/* ==========================================================================
   Material Design 3 共通コンポーネント
   ========================================================================== */

function M3Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "info" | "warning" | "success" | "danger" | "purple";
}) {
  const toneClasses = {
    neutral: "bg-white/[0.08] text-muted-foreground border-white/10",
    info: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    danger: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    purple: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  }[tone];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses}`}>
      {children}
    </span>
  );
}

function M3MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  trendDirection = "up",
}: {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  icon: any;
  trendDirection?: "up" | "down" | "neutral";
}) {
  return (
    <div className="m3-card-elevated group relative p-5 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4.5" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</h3>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{subtitle}</span>
        <span
          className={`flex items-center font-medium ${
            trendDirection === "up" ? "text-emerald-400" : trendDirection === "down" ? "text-rose-400" : "text-muted-foreground"
          }`}
        >
          {trendDirection === "up" ? (
            <ArrowUpRight className="mr-0.5 size-3.5" />
          ) : trendDirection === "down" ? (
            <ArrowDownRight className="mr-0.5 size-3.5" />
          ) : null}
          {trend}
        </span>
      </div>
    </div>
  );
}

function PageHeader({
  badge,
  title,
  description,
  actionLabel,
  onAction,
  onExport,
  searchQuery,
  onSearchChange,
}: {
  badge: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  onExport?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}) {
  return (
    <div className="border-b border-white/[0.08] bg-[#11131b]/60 px-5 py-6 backdrop-blur md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <M3Badge tone="info">{badge}</M3Badge>
          </div>
          <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {onSearchChange !== undefined && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="絞り込み検索..."
                className="h-10 w-48 rounded-xl border-white/10 bg-white/[0.04] pl-9 text-xs focus:border-primary/50 focus:w-60 transition-all sm:w-56"
              />
            </div>
          )}
          {onExport && (
            <Button
              variant="outline"
              onClick={onExport}
              className="h-10 rounded-xl border-white/10 bg-white/[0.03] text-xs hover:bg-white/[0.08]"
            >
              <Download className="mr-1.5 size-3.5" />
              CSV出力
            </Button>
          )}
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              className="h-10 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
            >
              <Plus className="mr-1.5 size-4" />
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyView({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
      <div className="max-w-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/[0.05] text-muted-foreground">
          <Inbox className="size-6" />
        </div>
        <h4 className="mt-3 font-sans text-base font-semibold text-foreground">{title}</h4>
        <p className="mt-1 text-xs text-muted-foreground">{message}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-4 h-9 rounded-xl bg-primary/20 text-xs font-medium text-primary hover:bg-primary/30">
            <Plus className="mr-1 size-3.5" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   ビュー1: ダッシュボード (Overview)
   ========================================================================== */

function DashboardOverview({
  deals,
  documents,
  tasks,
  activities,
  companies,
  onNavigate,
  onNewDeal,
  onNewDoc,
  onNewTask,
}: {
  deals: any[];
  documents: any[];
  tasks: any[];
  activities: any[];
  companies: any[];
  onNavigate: (path: string) => void;
  onNewDeal: () => void;
  onNewDoc: () => void;
  onNewTask: () => void;
}) {
  const activeDeals = deals.filter((d) => d.status !== "won" && d.stage !== "won" && d.stage !== "lost");
  const pipelineTotal = activeDeals.reduce((sum, d) => sum + d.amount, 0);
  const weightedForecast = activeDeals.reduce((sum, d) => sum + d.amount * (d.probability / 100), 0);
  const wonDeals = deals.filter((d) => d.status === "won" || d.stage === "won");
  const wonTotal = wonDeals.reduce((sum, d) => sum + d.amount, 0);
  const unpaidTotal = documents.filter((doc) => doc.status === "unpaid" || doc.status === "overdue").reduce((sum, doc) => sum + doc.amount, 0);

  // パイプラインステージ別データ
  const stageChartData = STAGES.filter((s) => s.key !== "lost").map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage.key);
    const amount = stageDeals.reduce((sum, d) => sum + d.amount, 0);
    return {
      name: stage.label,
      金額: amount / 10000, // 万円単位
      案件数: stageDeals.length,
      color: stage.color,
    };
  });

  // 月別受注推移予測シミュレーション
  const monthlyTrendData = [
    { month: "4月", 実績: 280, 予測: 260 },
    { month: "5月", 実績: 340, 予測: 310 },
    { month: "6月", 実績: 420, 予測: 400 },
    { month: "7月", 実績: 390, 予測: 380 },
    { month: "8月", 実績: wonTotal / 10000 || 260, 予測: weightedForecast / 10000 || 450 },
    { month: "9月 (見込)", 実績: null, 予測: 580 },
  ];

  return (
    <div className="space-y-6 p-5 md:p-8">
      {/* ヒーローサマリー */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <M3Badge tone="success">稼働中システム</M3Badge>
            <span className="text-xs text-muted-foreground">最終データ同期: 2分前</span>
          </div>
          <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            総合ダッシュボード
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            営業パイプライン、販売実績、進行中タスクの重要指標を一元管理します。
          </p>
        </div>

        {/* クイックアクションボタングループ */}
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onNewDeal} className="h-10 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-1.5 size-4" />
            新規商談
          </Button>
          <Button onClick={onNewDoc} variant="outline" className="h-10 rounded-xl border-white/10 bg-white/[0.03] text-xs hover:bg-white/[0.08]">
            <Receipt className="mr-1.5 size-4" />
            伝票作成
          </Button>
          <Button onClick={onNewTask} variant="outline" className="h-10 rounded-xl border-white/10 bg-white/[0.03] text-xs hover:bg-white/[0.08]">
            <CalendarCheck className="mr-1.5 size-4" />
            タスク登録
          </Button>
        </div>
      </div>

      {/* 主要KPIカード4連 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <M3MetricCard
          title="進行中パイプライン総額"
          value={formatCompactCurrency(pipelineTotal)}
          subtitle={`${activeDeals.length}件の商談が進行中`}
          trend="+14.2% 前月比"
          icon={TrendingUp}
          trendDirection="up"
        />
        <M3MetricCard
          title="確度加重・売上見込"
          value={formatCompactCurrency(weightedForecast)}
          subtitle="各ステージ確度を加味した予測"
          trend="+8.5% 予算比"
          icon={Handshake}
          trendDirection="up"
        />
        <M3MetricCard
          title="当期確定受注額"
          value={formatCompactCurrency(wonTotal)}
          subtitle={`${wonDeals.length}件の成約確定`}
          trend="+22.0% 前期比"
          icon={CheckCircle2}
          trendDirection="up"
        />
        <M3MetricCard
          title="未回収売掛金（請求残）"
          value={formatCompactCurrency(unpaidTotal)}
          subtitle="未入金・請求中伝票の合計"
          trend="-3.1% 回収改善"
          icon={CreditCard}
          trendDirection="up"
        />
      </div>

      {/* チャートセクション */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* 売上予測・実績トレンドグラフ */}
        <div className="m3-card-elevated p-6 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans text-base font-semibold text-foreground">売上推移と着地予測 (万円)</h3>
              <p className="text-xs text-muted-foreground">月次確定受注実績および当月・来月見込み推移</p>
            </div>
            <M3Badge tone="info">月次トレンド</M3Badge>
          </div>
          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradientForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e222e", borderColor: "rgba(255,255,255,0.12)", borderRadius: "12px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="実績" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientActual)" />
                <Area type="monotone" dataKey="予測" stroke="#818cf8" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#gradientForecast)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* パイプラインステージ別構成比 */}
        <div className="m3-card-elevated p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans text-base font-semibold text-foreground">ステージ別パイプライン構成</h3>
              <p className="text-xs text-muted-foreground">各進捗フェーズの見込み金額分布</p>
            </div>
            <button onClick={() => onNavigate("/crm/deals")} className="text-xs text-primary hover:underline">
              詳細 →
            </button>
          </div>
          <div className="mt-5 space-y-3.5">
            {stageChartData.map((stage) => {
              const maxAmount = Math.max(...stageChartData.map((s) => s.金額), 1);
              const percent = Math.round((stage.金額 / maxAmount) * 100);
              return (
                <div key={stage.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="font-medium text-foreground">{stage.name}</span>
                      <span className="text-[11px] text-muted-foreground">({stage.案件数}件)</span>
                    </div>
                    <span className="font-semibold text-foreground">¥{stage.金額.toLocaleString()}万円</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percent, stage.金額 > 0 ? 6 : 0)}%`, backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2カラム: 今日のタスク & 最近のアクティビティ */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* 今日のタスクキュー */}
        <div className="m3-card-elevated p-6 lg:col-span-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="size-5 text-primary" />
              <h3 className="font-sans text-base font-semibold text-foreground">優先フォローアップタスク</h3>
            </div>
            <button onClick={() => onNavigate("/work")} className="text-xs text-primary hover:underline">
              すべて表示 ({tasks.filter((t) => t.status !== "done").length}件)
            </button>
          </div>
          <div className="mt-4 space-y-2.5">
            {tasks
              .filter((t) => t.status !== "done")
              .slice(0, 4)
              .map((task) => {
                const company = companies.find((c) => c.id === task.companyId);
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:bg-white/[0.05]"
                  >
                    <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-lg border border-white/20 text-muted-foreground">
                      <Clock className="size-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground">{task.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        {company && <span className="text-primary/90">{company.name}</span>}
                        <span>•</span>
                        <span>担当: {task.assignee}</span>
                        <span>•</span>
                        <span className={task.priority === "high" ? "font-semibold text-rose-400" : ""}>{task.dueAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            {tasks.filter((t) => t.status !== "done").length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">現在未完了のタスクはありません。</p>
            )}
          </div>
        </div>

        {/* 最近の活動履歴 */}
        <div className="m3-card-elevated p-6 lg:col-span-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-tertiary" />
              <h3 className="font-sans text-base font-semibold text-foreground">営業・業務活動タイムライン</h3>
            </div>
            <button onClick={() => onNavigate("/work")} className="text-xs text-primary hover:underline">
              活動ログ一覧
            </button>
          </div>
          <div className="mt-4 space-y-3.5">
            {activities.slice(0, 4).map((act) => (
              <div key={act.id} className="flex gap-3">
                <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  {act.type === "call" ? (
                    <Phone className="size-3.5" />
                  ) : act.type === "email" ? (
                    <Mail className="size-3.5" />
                  ) : act.type === "quote" ? (
                    <FileText className="size-3.5" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground">{act.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{act.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground/70">
                    {act.ownerName} • {act.occurredAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   ビュー2: 顧客企業一覧 (CompaniesView)
   ========================================================================== */

function CompaniesView({
  companies,
  contacts,
  deals,
  documents,
  onNewCompany,
  onOpenDetail,
  onDeleteCompany,
}: {
  companies: any[];
  contacts: any[];
  deals: any[];
  documents: any[];
  onNewCompany: () => void;
  onOpenDetail: (item: any, type: string) => void;
  onDeleteCompany: (id: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("all");

  const filtered = companies.filter((c) => {
    const matchQuery = `${c.name} ${c.industry} ${c.location} ${c.ownerName}`.toLowerCase().includes(query.toLowerCase());
    const matchSegment = selectedSegment === "all" || c.segment === selectedSegment;
    return matchQuery && matchSegment;
  });

  const handleExport = () => {
    const headers = ["ID", "企業名", "セグメント", "業界", "拠点", "担当者", "進行中商談数", "商談総額"];
    const rows = filtered.map((c) => {
      const cDeals = deals.filter((d) => d.companyId === c.id);
      const totalAmount = cDeals.reduce((sum, d) => sum + d.amount, 0);
      return [c.id, c.name, c.segment, c.industry || "", c.location || "", c.ownerName || "", cDeals.length, totalAmount];
    });
    exportToCsv("顧客企業一覧", headers, rows);
  };

  return (
    <div>
      <PageHeader
        badge="CRM / 取引先"
        title="顧客企業一覧"
        description="取引先企業のアカウント情報、商談パイプライン、関連担当者を一元管理"
        actionLabel="新規企業を登録"
        onAction={onNewCompany}
        onExport={handleExport}
        searchQuery={query}
        onSearchChange={setQuery}
      />

      <div className="p-5 md:p-8">
        {/* セグメントフィルターチップ */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "all", label: "すべてのセグメント" },
              { key: "Enterprise", label: "エンタープライズ (大手)" },
              { key: "Growth", label: "グロース企業" },
              { key: "SMB", label: "中小企業 (SMB)" },
            ].map((seg) => (
              <button
                key={seg.key}
                onClick={() => setSelectedSegment(seg.key)}
                className={`m3-chip ${selectedSegment === seg.key ? "m3-chip-selected" : ""}`}
              >
                {seg.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            表示中: {filtered.length}社 / 全{companies.length}社
          </span>
        </div>

        {/* 顧客データテーブル */}
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#141722] shadow-sm">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-muted-foreground">
                <th className="px-5 py-3.5 font-medium">企業名 / アカウント</th>
                <th className="px-4 py-3.5 font-medium">セグメント</th>
                <th className="px-4 py-3.5 font-medium">業界 / 所在地</th>
                <th className="px-4 py-3.5 font-medium">担当者 (自社)</th>
                <th className="px-4 py-3.5 font-medium">進行中商談</th>
                <th className="px-5 py-3.5 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.map((company) => {
                const cDeals = deals.filter((d) => d.companyId === company.id);
                const cContacts = contacts.filter((c) => c.companyId === company.id);
                const totalDealAmount = cDeals.reduce((sum, d) => sum + d.amount, 0);

                return (
                  <tr
                    key={company.id}
                    onClick={() => onOpenDetail(company, "company")}
                    className="cursor-pointer transition hover:bg-primary/[0.04]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-xl bg-primary/10 font-bold text-primary">
                          <Building2 className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{company.name}</p>
                          <p className="text-[11px] text-muted-foreground">連絡先: {cContacts.length}名登録</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <M3Badge tone={company.segment === "Enterprise" ? "purple" : company.segment === "Growth" ? "info" : "neutral"}>
                        {company.segment}
                      </M3Badge>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-foreground">{company.industry || "未設定"}</p>
                      <p className="text-[11px] text-muted-foreground">{company.location || "未設定"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5 text-muted-foreground" />
                        <span>{company.ownerName || "未割当"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">{cDeals.length}件</p>
                      <p className="text-[11px] text-primary">{cDeals.length > 0 ? formatCurrency(totalDealAmount) : "商談なし"}</p>
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenDetail(company, "company")}
                          className="h-8 rounded-lg text-xs hover:bg-white/10"
                        >
                          詳細
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`「${company.name}」を削除しますか？`)) {
                              onDeleteCompany(company.id);
                            }
                          }}
                          className="h-8 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-8">
              <EmptyView title="該当する顧客企業が見つかりません" message="検索条件を変更するか、新しい企業を登録してください。" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   ビュー3: 取引先担当者一覧 (ContactsView)
   ========================================================================== */

function ContactsView({
  contacts,
  companies,
  onNewContact,
  onOpenDetail,
  onDeleteContact,
}: {
  contacts: any[];
  companies: any[];
  onNewContact: () => void;
  onOpenDetail: (item: any, type: string) => void;
  onDeleteContact: (id: number) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = contacts.filter((c) => `${c.name} ${c.email} ${c.role} ${c.phone}`.toLowerCase().includes(query.toLowerCase()));

  const handleExport = () => {
    const headers = ["ID", "氏名", "所属企業", "役職", "メールアドレス", "電話番号", "自社担当者", "最終接触日"];
    const rows = filtered.map((c) => {
      const comp = companies.find((comp) => comp.id === c.companyId);
      return [c.id, c.name, comp?.name || "", c.role || "", c.email || "", c.phone || "", c.ownerName || "", c.lastContactAt || ""];
    });
    exportToCsv("取引先担当者一覧", headers, rows);
  };

  return (
    <div>
      <PageHeader
        badge="CRM / 連絡先"
        title="取引先担当者一覧"
        description="顧客企業のキーパーソン、役職、連絡先情報および接触履歴の管理"
        actionLabel="担当者を追加"
        onAction={onNewContact}
        onExport={handleExport}
        searchQuery={query}
        onSearchChange={setQuery}
      />

      <div className="p-5 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((contact) => {
            const company = companies.find((comp) => comp.id === contact.companyId);
            return (
              <div
                key={contact.id}
                onClick={() => onOpenDetail(contact, "contact")}
                className="m3-card-elevated cursor-pointer p-5 transition hover:border-primary/40"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-11 rounded-2xl border border-primary/20 bg-primary/10">
                      <AvatarFallback className="rounded-2xl bg-transparent font-semibold text-primary">
                        {contact.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{contact.name}</h4>
                      <p className="text-xs text-muted-foreground">{contact.role || "役職未設定"}</p>
                    </div>
                  </div>
                  <M3Badge tone="info">{company ? company.name : "企業未紐付"}</M3Badge>
                </div>

                <div className="mt-4 space-y-2 text-xs text-muted-foreground border-t border-white/[0.06] pt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="size-3.5 text-primary" />
                    <span className="truncate">{contact.email || "メール未登録"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-3.5 text-tertiary" />
                    <span>{contact.phone || "電話番号未登録"}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px] text-muted-foreground">
                  <span>担当: {contact.ownerName || "未割当"}</span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`mailto:${contact.email}`}
                      className="grid size-7 place-items-center rounded-lg bg-white/[0.05] hover:bg-primary/20 hover:text-primary transition"
                      title="メールを送信"
                    >
                      <Mail className="size-3.5" />
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`担当者「${contact.name}」を削除しますか？`)) {
                          onDeleteContact(contact.id);
                        }
                      }}
                      className="size-7 p-0 rounded-lg text-rose-400 hover:bg-rose-500/10"
                      title="削除"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <EmptyView title="該当する担当者が見つかりません" message="検索条件を変更するか、新しい担当者を登録してください。" />
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   ビュー4: 商談パイプライン (DealsView)
   ========================================================================== */

function DealsView({
  deals,
  companies,
  onNewDeal,
  onOpenDetail,
  onUpdateStage,
  onDeleteDeal,
}: {
  deals: any[];
  companies: any[];
  onNewDeal: () => void;
  onOpenDetail: (item: any, type: string) => void;
  onUpdateStage: (deal: any, stageKey: string) => void;
  onDeleteDeal: (id: number) => void;
}) {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [query, setQuery] = useState("");

  const filteredDeals = deals.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()));
  const totalAmount = filteredDeals.reduce((sum, d) => sum + d.amount, 0);
  const weightedTotal = filteredDeals.reduce((sum, d) => sum + d.amount * (d.probability / 100), 0);

  const handleExport = () => {
    const headers = ["ID", "商談名", "顧客企業", "ステージ", "確度(%)", "見込み金額", "加重金額", "自社担当者", "次回アクション"];
    const rows = filteredDeals.map((d) => {
      const comp = companies.find((c) => c.id === d.companyId);
      const stage = STAGES.find((s) => s.key === d.stage);
      return [
        d.id,
        d.title,
        comp?.name || "",
        stage?.label || d.stage,
        d.probability,
        d.amount,
        Math.round(d.amount * (d.probability / 100)),
        d.ownerName,
        d.nextAction || "",
      ];
    });
    exportToCsv("商談パイプライン一覧", headers, rows);
  };

  return (
    <div>
      <PageHeader
        badge="CRM / パイプライン"
        title="商談パイプライン"
        description="案件フェーズの進捗管理、受注確度・売上見込の可視化とアクション追跡"
        actionLabel="新規商談を作成"
        onAction={onNewDeal}
        onExport={handleExport}
        searchQuery={query}
        onSearchChange={setQuery}
      />

      <div className="p-5 md:p-8">
        {/* サマリーバー & ビュー切り替え */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs">
              <span className="text-muted-foreground">案件総数: </span>
              <span className="font-semibold text-foreground">{filteredDeals.length}件</span>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs">
              <span className="text-primary/80">総見込み額: </span>
              <span className="font-semibold text-primary">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-3.5 py-1.5 text-xs">
              <span className="text-purple-300">加重売上予測: </span>
              <span className="font-semibold text-purple-200">{formatCurrency(weightedTotal)}</span>
            </div>
          </div>

          {/* カンバン / リスト切り替え */}
          <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                viewMode === "kanban" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Kanban className="size-3.5" />
              カンバン表示
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                viewMode === "list" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-3.5" />
              リスト表示
            </button>
          </div>
        </div>

        {/* カンバンボードビュー */}
        {viewMode === "kanban" ? (
          <div className="grid gap-4 overflow-x-auto pb-4 xl:grid-cols-5">
            {STAGES.filter((s) => s.key !== "lost").map((stage) => {
              const stageDeals = filteredDeals.filter((d) => d.stage === stage.key);
              const stageAmount = stageDeals.reduce((sum, d) => sum + d.amount, 0);

              return (
                <div key={stage.key} className="min-w-[260px] rounded-2xl border border-white/[0.08] bg-[#131620] p-3.5 flex flex-col">
                  {/* ステージヘッダー */}
                  <div className="border-b border-white/[0.06] pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                        <h4 className="font-semibold text-foreground text-xs">{stage.label}</h4>
                      </div>
                      <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {stageDeals.length}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] font-semibold text-primary/90">{formatCompactCurrency(stageAmount)}</p>
                  </div>

                  {/* 案件カードリスト */}
                  <div className="mt-3 flex-1 space-y-3">
                    {stageDeals.map((deal) => {
                      const company = companies.find((c) => c.id === deal.companyId);
                      return (
                        <div
                          key={deal.id}
                          onClick={() => onOpenDetail(deal, "deal")}
                          className="m3-card-elevated group cursor-pointer p-3.5 transition hover:border-primary/50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-semibold text-foreground text-xs leading-snug">{deal.title}</h5>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">{company?.name || "企業未紐付"}</p>

                          <div className="mt-3 flex items-baseline justify-between border-t border-white/[0.06] pt-2.5">
                            <span className="font-bold text-sm text-foreground">{formatCurrency(deal.amount)}</span>
                            <span className="text-[11px] font-medium text-primary">{deal.probability}%</span>
                          </div>

                          {deal.nextAction && (
                            <p className="mt-2 text-[10px] text-amber-300/80 bg-amber-500/10 rounded-md p-1 line-clamp-1">
                              次: {deal.nextAction}
                            </p>
                          )}

                          {/* 次のステージへのワンクリック移行導線 */}
                          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px]" onClick={(e) => e.stopPropagation()}>
                            <span className="text-muted-foreground">担当: {deal.ownerName}</span>
                            <div className="flex items-center gap-1">
                              {stage.key !== "won" && (
                                <button
                                  onClick={() => {
                                    const nextIdx = STAGES.findIndex((s) => s.key === stage.key) + 1;
                                    if (nextIdx < STAGES.length) {
                                      onUpdateStage(deal, STAGES[nextIdx].key);
                                    }
                                  }}
                                  className="rounded-md bg-white/[0.06] px-2 py-0.5 text-primary hover:bg-primary/20 transition"
                                  title="次のステージへ進める"
                                >
                                  次へ →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {stageDeals.length === 0 && (
                      <div className="py-8 text-center text-xs text-muted-foreground/60 border border-dashed border-white/[0.06] rounded-xl">
                        案件なし
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* リストテーブル表示 */
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#141722]">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-muted-foreground">
                  <th className="px-5 py-3.5 font-medium">商談名</th>
                  <th className="px-4 py-3.5 font-medium">顧客企業</th>
                  <th className="px-4 py-3.5 font-medium">進捗ステージ</th>
                  <th className="px-4 py-3.5 text-right font-medium">見込み金額</th>
                  <th className="px-4 py-3.5 text-right font-medium">確度 / 加重予測</th>
                  <th className="px-4 py-3.5 font-medium">次回アクション</th>
                  <th className="px-4 py-3.5 font-medium">自社担当</th>
                  <th className="px-5 py-3.5 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredDeals.map((deal) => {
                  const company = companies.find((c) => c.id === deal.companyId);
                  const stage = STAGES.find((s) => s.key === deal.stage);
                  return (
                    <tr
                      key={deal.id}
                      onClick={() => onOpenDetail(deal, "deal")}
                      className="cursor-pointer transition hover:bg-primary/[0.04]"
                    >
                      <td className="px-5 py-4 font-semibold text-foreground">{deal.title}</td>
                      <td className="px-4 py-4 text-muted-foreground">{company?.name || "—"}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                          <span className="size-2 rounded-full" style={{ backgroundColor: stage?.color || "#999" }} />
                          {stage?.label || deal.stage}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-foreground">{formatCurrency(deal.amount)}</td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-primary font-semibold">{deal.probability}%</span>
                        <span className="ml-1.5 text-muted-foreground">({formatCompactCurrency(deal.amount * (deal.probability / 100))})</span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{deal.nextAction || "—"}</td>
                      <td className="px-4 py-4 text-foreground">{deal.ownerName}</td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`商談「${deal.title}」を削除しますか？`)) {
                              onDeleteDeal(deal.id);
                            }
                          }}
                          className="h-8 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   ビュー5: 販売・請求管理 (SalesView)
   ========================================================================== */

function SalesView({
  documents,
  companies,
  deals,
  onNewDocument,
  onOpenDetail,
  onUpdateStatus,
  onDeleteDocument,
}: {
  documents: any[];
  companies: any[];
  deals: any[];
  onNewDocument: () => void;
  onOpenDetail: (item: any, type: string) => void;
  onUpdateStatus: (id: number, status: string) => void;
  onDeleteDocument: (id: number) => void;
}) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  const filtered = documents.filter((doc) => {
    const matchType = selectedType === "all" || doc.type === selectedType;
    const matchQuery = `${doc.number} ${doc.status}`.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  const unpaidTotal = documents.filter((d) => d.status === "unpaid" || d.status === "overdue").reduce((sum, d) => sum + d.amount, 0);
  const paidTotal = documents.filter((d) => d.status === "paid").reduce((sum, d) => sum + d.amount, 0);

  const handleExport = () => {
    const headers = ["伝票番号", "種別", "顧客企業", "関連商談", "金額", "ステータス", "支払期日"];
    const rows = filtered.map((d) => {
      const comp = companies.find((c) => c.id === d.companyId);
      const deal = deals.find((deal) => deal.id === d.dealId);
      return [
        d.number,
        DOC_TYPES[d.type]?.label || d.type,
        comp?.name || "",
        deal?.title || "",
        d.amount,
        DOC_STATUSES[d.status]?.label || d.status,
        d.dueDate || "",
      ];
    });
    exportToCsv("販売伝票一覧", headers, rows);
  };

  return (
    <div>
      <PageHeader
        badge="ERP / 販売管理"
        title="販売・請求管理"
        description="見積書発行から受注処理、請求書発行・入金消込までの販売ライフサイクルを一元管理"
        actionLabel="伝票を作成"
        onAction={onNewDocument}
        onExport={handleExport}
        searchQuery={query}
        onSearchChange={setQuery}
      />

      <div className="p-5 md:p-8">
        {/* KPI サマリーバー */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="m3-card-elevated p-4.5">
            <span className="text-xs text-muted-foreground">未回収請求残高</span>
            <p className="mt-1 font-sans text-xl font-bold text-amber-400">{formatCurrency(unpaidTotal)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">入金待ち・期日超過分</p>
          </div>
          <div className="m3-card-elevated p-4.5">
            <span className="text-xs text-muted-foreground">当月入金消込済合計</span>
            <p className="mt-1 font-sans text-xl font-bold text-emerald-400">{formatCurrency(paidTotal)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">入金確認完了伝票</p>
          </div>
          <div className="m3-card-elevated p-4.5">
            <span className="text-xs text-muted-foreground">発行中見積書件数</span>
            <p className="mt-1 font-sans text-xl font-bold text-primary">
              {documents.filter((d) => d.type === "quote").length}件
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">商談提案中の見積</p>
          </div>
        </div>

        {/* フィルターチップ */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "すべての伝票" },
            { key: "quote", label: "見積書 (Quote)" },
            { key: "order", label: "受注伝票 (Order)" },
            { key: "invoice", label: "請求書 (Invoice)" },
          ].map((type) => (
            <button
              key={type.key}
              onClick={() => setSelectedType(type.key)}
              className={`m3-chip ${selectedType === type.key ? "m3-chip-selected" : ""}`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* 伝票一覧テーブル */}
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#141722]">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-muted-foreground">
                <th className="px-5 py-3.5 font-medium">伝票番号 / 種別</th>
                <th className="px-4 py-3.5 font-medium">宛先顧客 / 紐付商談</th>
                <th className="px-4 py-3.5 text-right font-medium">金額 (税込)</th>
                <th className="px-4 py-3.5 font-medium">ステータス</th>
                <th className="px-4 py-3.5 font-medium">支払期日 / 発行日</th>
                <th className="px-5 py-3.5 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.map((doc) => {
                const company = companies.find((c) => c.id === doc.companyId);
                const deal = deals.find((d) => d.id === doc.dealId);
                const docMeta = DOC_TYPES[doc.type] || { label: doc.type, icon: FileText, tone: "blue" };
                const statusMeta = DOC_STATUSES[doc.status] || { label: doc.status, tone: "neutral" };

                return (
                  <tr
                    key={doc.id}
                    onClick={() => onOpenDetail(doc, "document")}
                    className="cursor-pointer transition hover:bg-primary/[0.04]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                          <docMeta.icon className="size-4.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm font-mono">{doc.number}</p>
                          <M3Badge tone={doc.type === "invoice" ? "warning" : doc.type === "order" ? "purple" : "info"}>
                            {docMeta.label}
                          </M3Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">{company?.name || "—"}</p>
                      <p className="text-[11px] text-muted-foreground">{deal?.title || "商談未紐付"}</p>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-sm text-foreground">{formatCurrency(doc.amount)}</td>
                    <td className="px-4 py-4">
                      <M3Badge tone={statusMeta.tone}>{statusMeta.label}</M3Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{doc.dueDate || "未設定"}</td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewDoc(doc)}
                          className="h-8 rounded-lg text-xs hover:bg-white/10"
                          title="帳票プレビュー・印刷"
                        >
                          <Printer className="size-3.5 mr-1" />
                          印刷
                        </Button>
                        {doc.status === "unpaid" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateStatus(doc.id, "paid")}
                            className="h-8 rounded-lg border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs"
                          >
                            <BadgeCheck className="size-3.5 mr-1" />
                            入金消込
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`伝票「${doc.number}」を削除しますか？`)) {
                              onDeleteDocument(doc.id);
                            }
                          }}
                          className="size-8 p-0 rounded-lg text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-8">
              <EmptyView title="販売伝票がありません" message="新しい見積書・受注伝票・請求書を作成してください。" />
            </div>
          )}
        </div>
      </div>

      {/* 帳票印刷プレビューモーダル */}
      {previewDoc && (
        <Dialog open={Boolean(previewDoc)} onOpenChange={() => setPreviewDoc(null)}>
          <DialogContent className="max-w-2xl bg-[#141620] border-white/10 text-foreground p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between border-b border-white/10 pb-4">
                <span>帳票プレビュー: {DOC_TYPES[previewDoc.type]?.label} ({previewDoc.number})</span>
                <Button size="sm" onClick={() => window.print()} className="bg-primary text-primary-foreground rounded-xl">
                  <Printer className="size-4 mr-1.5" /> 印刷・PDF出力
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="bg-white text-black p-8 rounded-xl my-3 space-y-6 font-sans shadow-lg">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">{DOC_TYPES[previewDoc.type]?.label}</h2>
                  <p className="text-sm text-gray-500 mt-1">伝票番号: {previewDoc.number}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold text-gray-800">NexaFlow エンタープライズ株式会社</p>
                  <p className="text-gray-500 text-xs">東京都千代田区大手町 1-1-1</p>
                  <p className="text-gray-500 text-xs">TEL: 03-1234-5678</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">ご請求先 / 宛先</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {companies.find((c) => c.id === previewDoc.companyId)?.name || "お客様"} 御中
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">お支払・納品期日</p>
                  <p className="font-semibold text-gray-800 mt-1">{previewDoc.dueDate || "2026年9月15日"}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border text-right">
                <span className="text-sm text-gray-600">合計金額 (税込):</span>
                <span className="text-2xl font-bold text-gray-900 ml-3">{formatCurrency(previewDoc.amount)}</span>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300 text-gray-600">
                    <th className="py-2">項目・摘要</th>
                    <th className="py-2 text-right">数量</th>
                    <th className="py-2 text-right">単価</th>
                    <th className="py-2 text-right">金額</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 font-medium text-gray-800">
                      {deals.find((d) => d.id === previewDoc.dealId)?.title || "基幹システム導入・ライセンス費用"}
                    </td>
                    <td className="py-3 text-right">1</td>
                    <td className="py-3 text-right">{formatCurrency(previewDoc.amount)}</td>
                    <td className="py-3 text-right font-bold">{formatCurrency(previewDoc.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setPreviewDoc(null)}>
                閉じる
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ==========================================================================
   ビュー6: タスク・活動管理 (WorkView)
   ========================================================================== */

function WorkView({
  tasks,
  activities,
  notifications,
  companies,
  onTaskToggle,
  onNewTask,
  onNewActivity,
  onDeleteTask,
}: {
  tasks: any[];
  activities: any[];
  notifications: any[];
  companies: any[];
  onTaskToggle: (task: any) => void;
  onNewTask: () => void;
  onNewActivity: () => void;
  onDeleteTask: (id: number) => void;
}) {
  const [taskFilter, setTaskFilter] = useState<"all" | "open" | "today" | "done">("open");

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === "open") return t.status !== "done";
    if (taskFilter === "done") return t.status === "done";
    if (taskFilter === "today") return t.status !== "done" && (t.dueAt?.includes("今日") || t.dueAt?.includes("本日"));
    return true;
  });

  return (
    <div>
      <PageHeader
        badge="ワークスペース / 業務キュー"
        title="タスク・活動管理"
        description="フォローアップタスク、営業活動履歴、通話メモの一括登録・追跡"
        actionLabel="タスクを追加"
        onAction={onNewTask}
      />

      <div className="grid gap-6 p-5 md:grid-cols-12 md:p-8">
        {/* 左カラム: タスクキュー */}
        <div className="m3-card-elevated p-6 md:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans text-base font-semibold text-foreground">タスク一覧</h3>
              <p className="text-xs text-muted-foreground">期限・重要度に応じた優先フォロー</p>
            </div>
            <div className="flex gap-1.5">
              {[
                { key: "open", label: "未完了" },
                { key: "today", label: "本日" },
                { key: "done", label: "完了済" },
                { key: "all", label: "すべて" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTaskFilter(f.key as any)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    taskFilter === f.key ? "bg-primary/20 text-primary font-semibold" : "text-muted-foreground hover:bg-white/[0.05]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {filteredTasks.map((task) => {
              const company = companies.find((c) => c.id === task.companyId);
              const isDone = task.status === "done";

              return (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 transition ${
                    isDone
                      ? "border-white/[0.04] bg-white/[0.01] opacity-50"
                      : "border-white/[0.08] bg-[#141722] hover:border-primary/40"
                  }`}
                >
                  <button
                    onClick={() => onTaskToggle(task)}
                    className={`mt-0.5 grid size-5.5 shrink-0 place-items-center rounded-lg border transition ${
                      isDone
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-white/30 text-transparent hover:border-primary hover:text-primary"
                    }`}
                  >
                    <Check className="size-3.5" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <M3Badge tone={task.priority === "high" ? "danger" : "neutral"}>
                        {task.priority === "high" ? "高優先度" : "通常"}
                      </M3Badge>
                      {company && <span className="text-primary">{company.name}</span>}
                      <span>担当: {task.assignee}</span>
                      <span>•</span>
                      <span>期限: {task.dueAt || "未設定"}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTask(task.id)}
                    className="size-7 p-0 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <EmptyView title="該当するタスクはありません" message="新しいタスクを登録して業務を開始しましょう。" />
            )}
          </div>
        </div>

        {/* 右カラム: 活動ログ登録 & タイムライン */}
        <div className="space-y-6 md:col-span-5">
          {/* 活動ログ追加カード */}
          <div className="m3-card-elevated p-5">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground text-sm">活動ログをクイック記録</h4>
              <Button size="sm" onClick={onNewActivity} className="h-8 rounded-lg bg-primary/20 text-primary text-xs hover:bg-primary/30">
                <Plus className="size-3.5 mr-1" />
                活動を登録
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">電話、商談ミーティング、メール送受信メモの追加</p>
          </div>

          {/* タイムライン */}
          <div className="m3-card-elevated p-5">
            <h4 className="font-semibold text-foreground text-sm mb-4">活動履歴タイムライン</h4>
            <div className="relative space-y-4 before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-white/10">
              {activities.map((act) => (
                <div key={act.id} className="relative flex gap-3">
                  <div className="z-10 grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 text-primary border border-primary/30">
                    {act.type === "call" ? (
                      <Phone className="size-3.5" />
                    ) : act.type === "email" ? (
                      <Mail className="size-3.5" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-xs font-semibold text-foreground">{act.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{act.body}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                      {act.ownerName} • {act.occurredAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   ビュー7: 通知センター (NotificationsView)
   ========================================================================== */

function NotificationsView({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: {
  notifications: any[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
}) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <PageHeader
        badge="システム / 通知"
        title="通知センター"
        description="商談ステージ更新、請求期日アラート、タスク期日通知などの重要イベント"
        actionLabel={unreadCount > 0 ? "すべて既読にする" : undefined}
        onAction={onMarkAllRead}
      />

      <div className="max-w-3xl p-5 md:p-8">
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isUnread = !notif.isRead;
            return (
              <div
                key={notif.id}
                className={`m3-card-elevated flex items-start gap-4 p-4.5 transition ${
                  isUnread ? "border-primary/40 bg-primary/[0.04]" : "border-white/[0.06] opacity-75"
                }`}
              >
                <div
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                    notif.kind === "attention"
                      ? "bg-amber-500/15 text-amber-300"
                      : notif.kind === "deal"
                      ? "bg-purple-500/15 text-purple-300"
                      : "bg-blue-500/15 text-blue-300"
                  }`}
                >
                  <Bell className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-foreground text-sm">{notif.title}</h4>
                    {isUnread && <span className="size-2 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{notif.body}</p>
                </div>

                {isUnread && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkRead(notif.id)}
                    className="shrink-0 text-xs text-primary hover:bg-primary/10"
                  >
                    既読
                  </Button>
                )}
              </div>
            );
          })}

          {notifications.length === 0 && (
            <EmptyView title="新しい通知はありません" message="現在すべてのイベントは確認済みです。" />
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   ビュー8: システム設定 (SettingsView)
   ========================================================================== */

function SettingsView() {
  return (
    <div>
      <PageHeader
        badge="システム / 設定"
        title="システム設定"
        description="ワークスペース情報、組織プロファイル、API連携ステータス"
        actionLabel="設定を保存"
        onAction={() => toast.success("システム設定を更新しました")}
      />

      <div className="grid max-w-3xl gap-6 p-5 md:p-8">
        {/* ワークスペース設定 */}
        <div className="m3-card-elevated p-6">
          <h3 className="font-semibold text-foreground text-base">ワークスペース基本設定</h3>
          <p className="mt-1 text-xs text-muted-foreground">システムの名称および通貨フォーマット</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">ワークスペース名称</Label>
              <Input defaultValue="NexaFlow Japan HQ" className="mt-1.5 rounded-xl border-white/10 bg-white/[0.04] text-xs" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">基準通貨</Label>
              <Input defaultValue="JPY (日本円 ¥)" disabled className="mt-1.5 rounded-xl border-white/10 bg-white/[0.04] text-xs" />
            </div>
          </div>
        </div>

        {/* 接続ステータス */}
        <div className="m3-card-elevated p-6">
          <h3 className="font-semibold text-foreground text-base">システム稼働状況</h3>
          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-muted-foreground">データベース接続</span>
              <M3Badge tone="success">正常稼働中 (Connected)</M3Badge>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-muted-foreground">tRPC API ゲートウェイ</span>
              <M3Badge tone="info">応答正常 (Operational)</M3Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">データ暗号化</span>
              <M3Badge tone="info">AES-256 有効</M3Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   詳細ドロワーパネル (DetailSheet)
   ========================================================================== */

function DetailSheet({
  item,
  type,
  companies,
  deals,
  onClose,
  onSaveDeal,
  onSaveDoc,
}: {
  item: any;
  type: string;
  companies: any[];
  deals: any[];
  onClose: () => void;
  onSaveDeal?: (payload: any) => void;
  onSaveDoc?: (payload: any) => void;
}) {
  const [dealForm, setDealForm] = useState({
    ownerName: item.ownerName || "",
    amount: String(item.amount || 0),
    probability: String(item.probability || 0),
    nextAction: item.nextAction || "",
  });

  const [docForm, setDocForm] = useState({
    type: item.type || "quote",
    status: item.status || "draft",
    amount: String(item.amount || 0),
  });

  const company = type === "company" ? item : companies.find((c) => c.id === item.companyId);

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/60 backdrop-blur-xs" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-lg overflow-y-auto border-l border-white/10 bg-[#12151f] p-6 shadow-2xl md:p-8"
      >
        <div className="flex items-center justify-between">
          <M3Badge tone="info">{type === "company" ? "顧客企業レコード" : type === "contact" ? "連絡先レコード" : type === "deal" ? "商談案件レコード" : "販売伝票レコード"}</M3Badge>
          <Button variant="ghost" size="sm" onClick={onClose} className="size-8 p-0 rounded-lg hover:bg-white/10">
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-5">
          <h2 className="font-sans text-2xl font-bold text-foreground">{item.name || item.title || item.number}</h2>
          <p className="mt-1 text-xs text-muted-foreground">ID: #{item.id} • 最終更新: 本日</p>
        </div>

        <Separator className="my-5 bg-white/[0.08]" />

        {/* 商談レコード編集 */}
        {type === "deal" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <span className="text-[11px] text-muted-foreground">見込み金額</span>
                <p className="font-bold text-base text-foreground mt-1">{formatCurrency(item.amount)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <span className="text-[11px] text-muted-foreground">受注確度</span>
                <p className="font-bold text-base text-primary mt-1">{item.probability}%</p>
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4 space-y-3">
              <h4 className="font-semibold text-xs text-primary">商談情報の編集</h4>
              <div>
                <Label className="text-xs text-muted-foreground">自社担当者</Label>
                <Input
                  value={dealForm.ownerName}
                  onChange={(e) => setDealForm({ ...dealForm, ownerName: e.target.value })}
                  className="mt-1 rounded-xl border-white/10 bg-white/[0.04] text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">見込み金額 (円)</Label>
                  <Input
                    type="number"
                    value={dealForm.amount}
                    onChange={(e) => setDealForm({ ...dealForm, amount: e.target.value })}
                    className="mt-1 rounded-xl border-white/10 bg-white/[0.04] text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">確度 (%)</Label>
                  <Input
                    type="number"
                    value={dealForm.probability}
                    onChange={(e) => setDealForm({ ...dealForm, probability: e.target.value })}
                    className="mt-1 rounded-xl border-white/10 bg-white/[0.04] text-xs"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">次回アクション</Label>
                <Input
                  value={dealForm.nextAction}
                  onChange={(e) => setDealForm({ ...dealForm, nextAction: e.target.value })}
                  className="mt-1 rounded-xl border-white/10 bg-white/[0.04] text-xs"
                />
              </div>
              <Button
                onClick={() =>
                  onSaveDeal?.({
                    id: item.id,
                    ownerName: dealForm.ownerName,
                    amount: Number(dealForm.amount),
                    probability: Number(dealForm.probability),
                    nextAction: dealForm.nextAction,
                  })
                }
                className="w-full h-9 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                商談の変更を保存
              </Button>
            </div>
          </div>
        )}

        {/* 伝票レコード編集 */}
        {type === "document" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
              <h4 className="font-semibold text-xs text-foreground">伝票ステータス更新</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">伝票種別</Label>
                  <select
                    value={docForm.type}
                    onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-[#171a24] px-2 text-xs text-foreground"
                  >
                    <option value="quote">見積書</option>
                    <option value="order">受注伝票</option>
                    <option value="invoice">請求書</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">ステータス</Label>
                  <select
                    value={docForm.status}
                    onChange={(e) => setDocForm({ ...docForm, status: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-[#171a24] px-2 text-xs text-foreground"
                  >
                    <option value="draft">下書き</option>
                    <option value="sent">送付済み</option>
                    <option value="confirmed">受注確定</option>
                    <option value="unpaid">入金待ち</option>
                    <option value="paid">入金消込済</option>
                    <option value="overdue">期日超過</option>
                  </select>
                </div>
              </div>
              <Button
                onClick={() => onSaveDoc?.({ id: item.id, type: docForm.type, status: docForm.status })}
                className="w-full h-9 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                伝票状態を保存
              </Button>
            </div>
          </div>
        )}

        {/* 企業・連絡先情報 */}
        {type === "company" && (
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-white/[0.06] pb-2">
              <span className="text-muted-foreground">セグメント</span>
              <span className="font-semibold text-foreground">{item.segment}</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.06] pb-2">
              <span className="text-muted-foreground">業界</span>
              <span className="text-foreground">{item.industry || "未設定"}</span>
            </div>
            <div className="flex justify-between border-b border-white/[0.06] pb-2">
              <span className="text-muted-foreground">所在地</span>
              <span className="text-foreground">{item.location || "未設定"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">担当者</span>
              <span className="text-foreground">{item.ownerName || "未設定"}</span>
            </div>
          </div>
        )}

        {/* AI アシストサジェスト */}
        <div className="mt-8 rounded-xl border border-purple-500/20 bg-purple-500/[0.05] p-4">
          <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold">
            <Sparkles className="size-4" />
            AI インサイトサジェスト
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            このレコードは過去の成約パターンに合致しています。今週中にフォローアップを行うことで成約率が約28%向上する見込みです。
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ==========================================================================
   グローバル検索ダイアログ (SearchOverlay - ⌘K)
   ========================================================================== */

function SearchOverlay({
  open,
  onClose,
  companies,
  contacts,
  deals,
  documents,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  companies: any[];
  contacts: any[];
  deals: any[];
  documents: any[];
  onNavigate: (path: string) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  if (!open) return null;

  const results = [
    ...companies.map((c) => ({ id: c.id, title: c.name, sub: `${c.industry || "企業"} • ${c.segment}`, type: "顧客企業", path: "/crm/companies" })),
    ...contacts.map((c) => ({ id: c.id, title: c.name, sub: `${c.role || "担当者"} • ${c.email || ""}`, type: "連絡先", path: "/crm/contacts" })),
    ...deals.map((d) => ({ id: d.id, title: d.title, sub: `商談 • ${formatCurrency(d.amount)}`, type: "商談案件", path: "/crm/deals" })),
    ...documents.map((doc) => ({ id: doc.id, title: doc.number, sub: `伝票 (${DOC_TYPES[doc.type]?.label || doc.type}) • ${formatCurrency(doc.amount)}`, type: "販売伝票", path: "/sales" })),
  ].filter((item) => `${item.title} ${item.sub} ${item.type}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-start bg-black/60 px-4 pt-[15vh] backdrop-blur-xs" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#151822] shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <Search className="size-4.5 text-primary" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="企業名、担当者、商談名、伝票番号を検索..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.map((res) => (
            <button
              key={`${res.type}-${res.id}`}
              onClick={() => {
                onNavigate(res.path);
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition hover:bg-white/[0.05]"
            >
              <div>
                <p className="text-xs font-semibold text-foreground">{res.title}</p>
                <p className="text-[11px] text-muted-foreground">{res.sub}</p>
              </div>
              <M3Badge tone="info">{res.type}</M3Badge>
            </button>
          ))}

          {results.length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground">一致するデータが見つかりませんでした。</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   メインアプリケーションコンポーネント (Home)
   ========================================================================== */

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [detail, setDetail] = useState<{ item: any; type: string } | null>(null);
  const [createDialog, setCreateDialog] = useState<"company" | "contact" | "deal" | "document" | "task" | "activity" | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const snapshotQuery = trpc.crm.snapshot.useQuery(undefined, { enabled: Boolean(isAuthenticated), retry: false });
  const utils = trpc.useUtils();

  // ミューテーション定義
  const createCompany = trpc.crm.companies.create.useMutation({
    onSuccess: () => {
      toast.success("顧客企業を新規登録しました");
      setCreateDialog(null);
      utils.crm.snapshot.invalidate();
    },
  });
  const deleteCompany = trpc.crm.companies.delete.useMutation({
    onSuccess: () => {
      toast.success("顧客企業を削除しました");
      utils.crm.snapshot.invalidate();
    },
  });

  const createContact = trpc.crm.contacts.create.useMutation({
    onSuccess: () => {
      toast.success("取引先担当者を登録しました");
      setCreateDialog(null);
      utils.crm.snapshot.invalidate();
    },
  });
  const deleteContact = trpc.crm.contacts.delete.useMutation({
    onSuccess: () => {
      toast.success("担当者を削除しました");
      utils.crm.snapshot.invalidate();
    },
  });

  const createDeal = trpc.crm.deals.create.useMutation({
    onSuccess: () => {
      toast.success("新規商談を作成しました");
      setCreateDialog(null);
      utils.crm.snapshot.invalidate();
    },
  });
  const updateDeal = trpc.crm.deals.update.useMutation({
    onSuccess: () => {
      toast.success("商談情報を更新しました");
      setDetail(null);
      utils.crm.snapshot.invalidate();
    },
  });
  const deleteDeal = trpc.crm.deals.delete.useMutation({
    onSuccess: () => {
      toast.success("商談を削除しました");
      utils.crm.snapshot.invalidate();
    },
  });

  const createDocument = trpc.crm.documents.create.useMutation({
    onSuccess: () => {
      toast.success("販売伝票を作成しました");
      setCreateDialog(null);
      utils.crm.snapshot.invalidate();
    },
  });
  const updateDocument = trpc.crm.documents.update.useMutation({
    onSuccess: () => {
      toast.success("伝票ステータスを更新しました");
      setDetail(null);
      utils.crm.snapshot.invalidate();
    },
  });
  const deleteDocument = trpc.crm.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("伝票を削除しました");
      utils.crm.snapshot.invalidate();
    },
  });

  const createTask = trpc.crm.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("タスクを登録しました");
      setCreateDialog(null);
      utils.crm.snapshot.invalidate();
    },
  });
  const updateTask = trpc.crm.tasks.update.useMutation({
    onSuccess: () => {
      toast.success("タスク状態を更新しました");
      utils.crm.snapshot.invalidate();
    },
  });
  const deleteTask = trpc.crm.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("タスクを削除しました");
      utils.crm.snapshot.invalidate();
    },
  });

  const createActivity = trpc.crm.activities.create.useMutation({
    onSuccess: () => {
      toast.success("活動ログを記録しました");
      setCreateDialog(null);
      utils.crm.snapshot.invalidate();
    },
  });

  const markRead = trpc.crm.notifications.markRead.useMutation({
    onSuccess: () => utils.crm.snapshot.invalidate(),
  });
  const markAllRead = trpc.crm.notifications.markAllRead.useMutation({
    onSuccess: () => {
      toast.success("すべての通知を既読にしました");
      utils.crm.snapshot.invalidate();
    },
  });

  // データソースの統合
  const data = (snapshotQuery.data as any) ?? {};
  const isPreview = !isAuthenticated;
  const companies = isPreview ? fallbackCompanies : data.companies || fallbackCompanies;
  const contacts = isPreview ? fallbackContacts : data.contacts || fallbackContacts;
  const deals = isPreview ? fallbackDeals : data.deals || fallbackDeals;
  const documents = isPreview ? fallbackDocuments : data.documents || fallbackDocuments;
  const tasks = isPreview ? fallbackTasks : data.tasks || fallbackTasks;
  const activities = isPreview ? fallbackActivities : data.activities || fallbackActivities;
  const notifications = isPreview ? fallbackNotifications : data.notifications || fallbackNotifications;

  // キーボードショートカット (⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenCreate = (kind: "company" | "contact" | "deal" | "document" | "task" | "activity") => {
    setForm({});
    setCreateDialog(kind);
  };

  const handleCreateSubmit = () => {
    if (createDialog === "company") {
      createCompany.mutate({
        name: form.name || "新規取引先",
        segment: form.segment || "Growth",
        industry: form.industry || "IT / サービス",
        location: form.location || "東京都",
        ownerName: form.ownerName || "田中 幹也",
      });
    } else if (createDialog === "contact") {
      createContact.mutate({
        name: form.name || "新規担当者",
        companyId: form.companyId ? Number(form.companyId) : companies[0]?.id,
        email: form.email || "contact@example.com",
        phone: form.phone || "03-0000-0000",
        role: form.role || "担当者",
        ownerName: form.ownerName || "田中 幹也",
      });
    } else if (createDialog === "deal") {
      createDeal.mutate({
        title: form.title || "新規商談案件",
        companyId: form.companyId ? Number(form.companyId) : companies[0]?.id,
        stage: form.stage || "lead",
        amount: Number(form.amount || 1000000),
        probability: Number(form.probability || 10),
        ownerName: form.ownerName || "田中 幹也",
        nextAction: form.nextAction || "初回ヒアリング",
        status: "open",
      });
    } else if (createDialog === "document") {
      createDocument.mutate({
        number: form.number || `DOC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        type: form.type || "quote",
        status: form.status || "draft",
        companyId: form.companyId ? Number(form.companyId) : companies[0]?.id,
        dealId: form.dealId ? Number(form.dealId) : deals[0]?.id,
        amount: Number(form.amount || 500000),
      });
    } else if (createDialog === "task") {
      createTask.mutate({
        title: form.title || "新規フォローアップタスク",
        companyId: form.companyId ? Number(form.companyId) : companies[0]?.id,
        assignee: form.assignee || "田中 幹也",
        priority: form.priority || "normal",
        dueAt: form.dueAt || "明日 17:00",
        status: "open",
      });
    } else if (createDialog === "activity") {
      createActivity.mutate({
        title: form.title || "活動ログ記録",
        type: form.type || "call",
        body: form.body || "電話にて進捗状況を確認。",
        companyId: form.companyId ? Number(form.companyId) : companies[0]?.id,
        ownerName: form.ownerName || "田中 幹也",
      });
    }
  };

  const currentView = useMemo(() => {
    if (location === "/work") {
      return (
        <WorkView
          tasks={tasks}
          activities={activities}
          notifications={notifications}
          companies={companies}
          onTaskToggle={(task) => updateTask.mutate({ id: task.id, status: task.status === "done" ? "open" : "done" })}
          onNewTask={() => handleOpenCreate("task")}
          onNewActivity={() => handleOpenCreate("activity")}
          onDeleteTask={(id) => deleteTask.mutate({ id })}
        />
      );
    }
    if (location === "/crm/companies") {
      return (
        <CompaniesView
          companies={companies}
          contacts={contacts}
          deals={deals}
          documents={documents}
          onNewCompany={() => handleOpenCreate("company")}
          onOpenDetail={(item, type) => setDetail({ item, type })}
          onDeleteCompany={(id) => deleteCompany.mutate({ id })}
        />
      );
    }
    if (location === "/crm/contacts") {
      return (
        <ContactsView
          contacts={contacts}
          companies={companies}
          onNewContact={() => handleOpenCreate("contact")}
          onOpenDetail={(item, type) => setDetail({ item, type })}
          onDeleteContact={(id) => deleteContact.mutate({ id })}
        />
      );
    }
    if (location === "/crm/deals") {
      return (
        <DealsView
          deals={deals}
          companies={companies}
          onNewDeal={() => handleOpenCreate("deal")}
          onOpenDetail={(item, type) => setDetail({ item, type })}
          onUpdateStage={(deal, stageKey) => {
            const prob = STAGES.find((s) => s.key === stageKey)?.probability || 50;
            updateDeal.mutate({ id: deal.id, stage: stageKey, probability: prob });
          }}
          onDeleteDeal={(id) => deleteDeal.mutate({ id })}
        />
      );
    }
    if (location === "/sales") {
      return (
        <SalesView
          documents={documents}
          companies={companies}
          deals={deals}
          onNewDocument={() => handleOpenCreate("document")}
          onOpenDetail={(item, type) => setDetail({ item, type })}
          onUpdateStatus={(id, status) => updateDocument.mutate({ id, status })}
          onDeleteDocument={(id) => deleteDocument.mutate({ id })}
        />
      );
    }
    if (location === "/notifications") {
      return (
        <NotificationsView
          notifications={notifications}
          onMarkRead={(id) => markRead.mutate({ id })}
          onMarkAllRead={() => markAllRead.mutate()}
        />
      );
    }
    if (location === "/settings") {
      return <SettingsView />;
    }
    return (
      <DashboardOverview
        deals={deals}
        documents={documents}
        tasks={tasks}
        activities={activities}
        companies={companies}
        onNavigate={setLocation}
        onNewDeal={() => handleOpenCreate("deal")}
        onNewDoc={() => handleOpenCreate("document")}
        onNewTask={() => handleOpenCreate("task")}
      />
    );
  }, [location, tasks, activities, notifications, companies, contacts, deals, documents]);

  return (
    <div className="min-h-screen">
      {currentView}

      {/* 詳細サイドシート */}
      {detail && (
        <DetailSheet
          item={detail.item}
          type={detail.type}
          companies={companies}
          deals={deals}
          onClose={() => setDetail(null)}
          onSaveDeal={(payload) => updateDeal.mutate(payload)}
          onSaveDoc={(payload) => updateDocument.mutate(payload)}
        />
      )}

      {/* 新規登録ダイアログ */}
      <Dialog open={Boolean(createDialog)} onOpenChange={(open) => !open && setCreateDialog(null)}>
        <DialogContent className="max-w-md bg-[#161924] border-white/10 text-foreground p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {createDialog === "company" && "新規顧客企業の登録"}
              {createDialog === "contact" && "取引先担当者の登録"}
              {createDialog === "deal" && "新規商談の作成"}
              {createDialog === "document" && "新規販売伝票の作成"}
              {createDialog === "task" && "タスクの追加"}
              {createDialog === "activity" && "活動ログの記録"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              必要な情報を入力してシステムに登録します。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-3 text-xs">
            {createDialog === "company" && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">企業名</Label>
                  <Input
                    placeholder="例: 株式会社サンプルテクノロジーズ"
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">セグメント</Label>
                    <select
                      value={form.segment || "Growth"}
                      onChange={(e) => setForm({ ...form, segment: e.target.value })}
                      className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-[#1b1e2a] px-2 text-xs"
                    >
                      <option value="Enterprise">Enterprise (大手)</option>
                      <option value="Growth">Growth (中堅)</option>
                      <option value="SMB">SMB (中小)</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">業界</Label>
                    <Input
                      placeholder="例: SaaS / 製造業"
                      value={form.industry || ""}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">所在地</Label>
                  <Input
                    placeholder="例: 東京都千代田区"
                    value={form.location || ""}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                  />
                </div>
              </>
            )}

            {createDialog === "contact" && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">氏名</Label>
                  <Input
                    placeholder="例: 山田 太郎"
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">所属顧客企業</Label>
                  <select
                    value={form.companyId || companies[0]?.id}
                    onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-[#1b1e2a] px-2 text-xs"
                  >
                    {companies.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">役職</Label>
                    <Input
                      placeholder="例: 取締役部長"
                      value={form.role || ""}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">電話番号</Label>
                    <Input
                      placeholder="例: 03-1234-5678"
                      value={form.phone || ""}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">メールアドレス</Label>
                  <Input
                    placeholder="例: yamada@example.com"
                    value={form.email || ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                  />
                </div>
              </>
            )}

            {createDialog === "deal" && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">商談名</Label>
                  <Input
                    placeholder="例: 基幹システム刷新 PoC案件"
                    value={form.title || ""}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">顧客企業</Label>
                  <select
                    value={form.companyId || companies[0]?.id}
                    onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-[#1b1e2a] px-2 text-xs"
                  >
                    {companies.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">見込み金額 (円)</Label>
                    <Input
                      type="number"
                      placeholder="例: 3000000"
                      value={form.amount || ""}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">初期ステージ</Label>
                    <select
                      value={form.stage || "lead"}
                      onChange={(e) => {
                        const prob = STAGES.find((s) => s.key === e.target.value)?.probability || 10;
                        setForm({ ...form, stage: e.target.value, probability: prob });
                      }}
                      className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-[#1b1e2a] px-2 text-xs"
                    >
                      {STAGES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label} ({s.probability}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">次回アクション</Label>
                  <Input
                    placeholder="例: 初回ヒアリングの実施と提案書作成"
                    value={form.nextAction || ""}
                    onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
                    className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                  />
                </div>
              </>
            )}

            {createDialog === "document" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">伝票種別</Label>
                    <select
                      value={form.type || "quote"}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-[#1b1e2a] px-2 text-xs"
                    >
                      <option value="quote">見積書 (Quote)</option>
                      <option value="order">受注伝票 (Order)</option>
                      <option value="invoice">請求書 (Invoice)</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">伝票番号 (自動/任意)</Label>
                    <Input
                      placeholder="例: QUO-2026-0099"
                      value={form.number || ""}
                      onChange={(e) => setForm({ ...form, number: e.target.value })}
                      className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">宛先顧客</Label>
                  <select
                    value={form.companyId || companies[0]?.id}
                    onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-[#1b1e2a] px-2 text-xs"
                  >
                    {companies.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">関連商談</Label>
                  <select
                    value={form.dealId || deals[0]?.id}
                    onChange={(e) => setForm({ ...form, dealId: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-[#1b1e2a] px-2 text-xs"
                  >
                    {deals.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">金額 (税込 円)</Label>
                  <Input
                    type="number"
                    placeholder="例: 1500000"
                    value={form.amount || ""}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                  />
                </div>
              </>
            )}

            {createDialog === "task" && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">タスク内容</Label>
                  <Input
                    placeholder="例: 契約書の最終確認と押印依頼"
                    value={form.title || ""}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">優先度</Label>
                    <select
                      value={form.priority || "normal"}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-[#1b1e2a] px-2 text-xs"
                    >
                      <option value="high">高 (High)</option>
                      <option value="normal">通常 (Normal)</option>
                      <option value="low">低 (Low)</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">期日</Label>
                    <Input
                      placeholder="例: 本日 17:00 / 8月31日"
                      value={form.dueAt || ""}
                      onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
                      className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">担当者</Label>
                  <Input
                    placeholder="例: 田中 幹也"
                    value={form.assignee || "田中 幹也"}
                    onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                    className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                  />
                </div>
              </>
            )}

            {createDialog === "activity" && (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">活動タイトル</Label>
                  <Input
                    placeholder="例: 定例ミーティング議事録"
                    value={form.title || ""}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1 rounded-xl border-white/10 bg-white/[0.04]"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">種別</Label>
                  <select
                    value={form.type || "call"}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-[#1b1e2a] px-2 text-xs"
                  >
                    <option value="call">電話・通話メモ</option>
                    <option value="email">メール送受信</option>
                    <option value="quote">商談・見積提示</option>
                    <option value="won">契約・成約更新</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">活動内容・メモ</Label>
                  <Textarea
                    placeholder="面談での決定事項や次回アクションなどを記載"
                    value={form.body || ""}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    className="mt-1 rounded-xl border-white/10 bg-white/[0.04] text-xs h-20"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setCreateDialog(null)} className="rounded-xl text-xs">
              キャンセル
            </Button>
            <Button onClick={handleCreateSubmit} className="rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90">
              登録する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* グローバル検索モーダル */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        companies={companies}
        contacts={contacts}
        deals={deals}
        documents={documents}
        onNavigate={setLocation}
      />
    </div>
  );
}
