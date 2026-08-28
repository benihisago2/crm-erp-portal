import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  Bell,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  FileSpreadsheet,
  Handshake,
  HelpCircle,
  Layers,
  LayoutDashboard,
  LogOut,
  Receipt,
  Search,
  Settings,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const navigationSections = [
  {
    title: "ワークスペース",
    items: [
      { icon: LayoutDashboard, label: "ダッシュボード", path: "/" },
      { icon: CalendarCheck, label: "タスク・活動管理", path: "/work" },
    ],
  },
  {
    title: "CRM（顧客関係管理）",
    items: [
      { icon: Building2, label: "顧客企業一覧", path: "/crm/companies" },
      { icon: Users, label: "取引先担当者", path: "/crm/contacts" },
      { icon: Handshake, label: "商談パイプライン", path: "/crm/deals" },
    ],
  },
  {
    title: "ERP（販売・請求管理）",
    items: [
      { icon: Receipt, label: "販売・請求管理", path: "/sales" },
      { icon: Bell, label: "通知センター", path: "/notifications" },
    ],
  },
];

const SIDEBAR_WIDTH_KEY = "nexaflow-sidebar-width";
const DEFAULT_WIDTH = 270;
const MIN_WIDTH = 220;
const MAX_WIDTH = 400;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({ children, setSidebarWidth }: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const nextWidth = event.clientX - sidebarLeft;
      if (nextWidth >= MIN_WIDTH && nextWidth <= MAX_WIDTH) setSidebarWidth(nextWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-white/[0.08] bg-[#0f1118]" disableTransition={isResizing}>
          {/* Material 3 App Header */}
          <SidebarHeader className="h-16 justify-center border-b border-white/[0.06] px-3.5">
            <div className="flex w-full items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-all hover:bg-primary/20 hover:scale-105"
                aria-label="メニューを開閉"
                title="メニューを開閉"
              >
                <Layers className="size-4.5" />
              </button>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-sm font-semibold tracking-tight text-white">NexaFlow</span>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">ERP/CRM</span>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">統合基幹業務ポータル</p>
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-1 px-2.5 py-3">
            {/* M3 Quick Search Button */}
            {!isCollapsed ? (
              <button
                onClick={() => {
                  const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
                  window.dispatchEvent(event);
                }}
                className="mb-3 flex h-10 w-full items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-white/[0.06] hover:text-white"
              >
                <Search className="size-3.5 text-primary" />
                <span className="flex-1 text-left">統合検索...</span>
                <kbd className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  ⌘K
                </kbd>
              </button>
            ) : (
              <button
                onClick={() => {
                  const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
                  window.dispatchEvent(event);
                }}
                className="mb-3 mx-auto grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-white"
                title="クイック検索 (⌘K)"
              >
                <Search className="size-4" />
              </button>
            )}

            {/* Navigation Groups */}
            {navigationSections.map((section) => (
              <SidebarGroup key={section.title} className="px-0 py-1.5">
                {!isCollapsed && (
                  <SidebarGroupLabel className="px-3 text-[11px] font-medium text-muted-foreground/80 tracking-normal">
                    {section.title}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {section.items.map((item) => {
                      const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={() => setLocation(item.path)}
                            tooltip={item.label}
                            className={`h-10 rounded-xl px-3 text-sm font-medium transition-all ${
                              isActive
                                ? "bg-primary/15 text-primary font-semibold shadow-xs"
                                : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                            }`}
                          >
                            <item.icon className={`size-[18px] shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                            <span>{item.label}</span>
                            {isActive && !isCollapsed && (
                              <span className="ml-auto size-1.5 rounded-full bg-primary" />
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}

            {/* Settings section */}
            <SidebarGroup className="mt-auto px-0 py-1.5">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={location === "/settings"}
                      onClick={() => setLocation("/settings")}
                      tooltip="システム設定"
                      className={`h-10 rounded-xl px-3 text-sm font-medium transition-all ${
                        location === "/settings"
                          ? "bg-primary/15 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                      }`}
                    >
                      <Settings className={`size-[18px] shrink-0 ${location === "/settings" ? "text-primary" : "text-muted-foreground"}`} />
                      <span>システム設定</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* User Profile / Status Footer */}
          <SidebarFooter className="border-t border-white/[0.06] p-2.5">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.06] group-data-[collapsible=icon]:justify-center"
                    aria-label="ユーザーアカウントメニュー"
                  >
                    <Avatar className="size-8.5 rounded-xl border border-primary/20 bg-primary/10">
                      <AvatarFallback className="rounded-xl bg-transparent text-xs font-semibold text-primary">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">{user.name || "システム担当者"}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{user.email || "ログイン中"}</p>
                      </div>
                    )}
                    {!isCollapsed && <ChevronDown className="size-3.5 text-muted-foreground" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-xl border border-white/[0.1] bg-[#1a1d27] p-1.5 shadow-xl">
                  <DropdownMenuLabel className="px-2.5 py-1.5 text-xs text-muted-foreground">
                    アカウント情報
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/[0.08]" />
                  <DropdownMenuItem onClick={() => setLocation("/settings")} className="cursor-pointer rounded-lg px-2.5 py-2 text-xs">
                    <User className="mr-2 size-4 text-muted-foreground" />
                    ユーザープロファイル
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer rounded-lg px-2.5 py-2 text-xs text-red-400 focus:bg-red-500/10 focus:text-red-300">
                    <LogOut className="mr-2 size-4" />
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => startLogin()}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground group-data-[collapsible=icon]:justify-center"
                aria-label="ログイン"
              >
                <Avatar className="size-8.5 rounded-xl border border-white/10 bg-white/[0.05]">
                  <AvatarFallback className="rounded-xl bg-transparent text-xs text-muted-foreground">NF</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div>
                    <p className="text-xs font-medium text-foreground">ゲスト閲覧中</p>
                    <p className="text-[11px] text-primary">サインインして全機能を利用 →</p>
                  </div>
                )}
              </button>
            )}
          </SidebarFooter>
        </Sidebar>

        {/* Sidebar Resize Handle */}
        <div
          className={`absolute right-0 top-0 z-50 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/40 ${
            isCollapsed ? "hidden" : ""
          }`}
          onMouseDown={() => setIsResizing(true)}
        />
      </div>

      <SidebarInset className="min-w-0 bg-[#0c0e14]">
        {isMobile && (
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#0c0e14]/95 px-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="size-9 rounded-lg hover:bg-white/10" />
              <span className="font-sans text-sm font-semibold text-white">NexaFlow ERP/CRM</span>
            </div>
            <button
              onClick={() => {
                const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
                window.dispatchEvent(event);
              }}
              className="grid size-8 place-items-center rounded-lg bg-white/[0.06] text-muted-foreground"
            >
              <Search className="size-4" />
            </button>
          </header>
        )}
        <main className="min-h-screen">{children}</main>
      </SidebarInset>
    </>
  );
}
