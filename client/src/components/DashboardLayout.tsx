import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  CheckSquare,
  ChevronDown,
  Command,
  ContactRound,
  Handshake,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  ReceiptText,
  Settings2,
  UsersRound,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const menuGroups = [
  {
    label: "WORKSPACE",
    items: [
      { icon: LayoutDashboard, label: "オーバービュー", path: "/" },
      { icon: CheckSquare, label: "フォローアップ", path: "/work" },
    ],
  },
  {
    label: "CRM",
    items: [
      { icon: Building2, label: "顧客アカウント", path: "/crm/companies" },
      { icon: ContactRound, label: "連絡先", path: "/crm/contacts" },
      { icon: Handshake, label: "商談パイプライン", path: "/crm/deals" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { icon: ReceiptText, label: "販売業務", path: "/sales" },
      { icon: Bell, label: "通知センター", path: "/notifications" },
    ],
  },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 256;
const MIN_WIDTH = 208;
const MAX_WIDTH = 420;

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

type DashboardLayoutContentProps = { children: React.ReactNode; setSidebarWidth: (width: number) => void };

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
        <Sidebar collapsible="icon" className="border-r border-white/[0.09]" disableTransition={isResizing}>
          <SidebarHeader className="h-[74px] justify-center border-b border-white/[0.08] px-3">
            <div className="flex w-full items-center gap-3">
              <button onClick={toggleSidebar} className="grid size-9 shrink-0 place-items-center rounded-md border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 transition hover:border-cyan-200/60 hover:bg-cyan-300/15" aria-label="サイドバーを切り替え">
                <Command className="size-4" />
              </button>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold tracking-[0.28em] text-white">NEXAFLOW</span>
                    <span className="font-mono text-[9px] text-fuchsia-300">v0.9</span>
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">CRM / ERP SYSTEM</div>
                </div>
              )}
            </div>
          </SidebarHeader>
          <SidebarContent className="gap-0 px-2 py-3">
            <div className="mb-3 flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-white/45">
              <span className="font-mono text-xs">⌕</span>
              {!isCollapsed && <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.13em]">クイック検索</span>}
              {!isCollapsed && <kbd className="font-mono text-[9px] text-cyan-200/60">⌘ K</kbd>}
            </div>
            {menuGroups.map(group => (
              <SidebarGroup key={group.label} className="px-0 py-2">
                {!isCollapsed && <SidebarGroupLabel className="px-3 font-mono text-[9px] tracking-[0.22em] text-white/30">{group.label}</SidebarGroupLabel>}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map(item => {
                      const active = location === item.path || (item.path !== "/" && location.startsWith(item.path));
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton isActive={active} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-10 rounded-md font-sans text-[13px] text-white/60 transition data-[active=true]:border data-[active=true]:border-cyan-200/25 data-[active=true]:bg-cyan-300/10 data-[active=true]:text-cyan-100 hover:bg-white/[0.05] hover:text-white">
                            <item.icon className="size-[15px] shrink-0" />
                            <span>{item.label}</span>
                            {active && !isCollapsed && <span className="ml-auto size-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#35f1ff]" />}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
            <SidebarGroup className="mt-auto px-0 py-2">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={location === "/settings"} onClick={() => setLocation("/settings")} tooltip="システム設定" className="h-10 rounded-md font-sans text-[13px] text-white/45 hover:bg-white/[0.05] hover:text-white">
                      <Settings2 className="size-[15px]" /><span>システム設定</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-white/[0.08] p-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-white/[0.06] group-data-[collapsible=icon]:justify-center" aria-label="ユーザーメニュー">
                    <Avatar className="size-8 border border-fuchsia-300/40 bg-fuchsia-300/10"><AvatarFallback className="bg-transparent font-mono text-xs text-fuchsia-100">{user.name?.charAt(0).toUpperCase() || "N"}</AvatarFallback></Avatar>
                    {!isCollapsed && <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-white/80">{user.name || "オペレーター"}</p><p className="mt-0.5 truncate font-mono text-[9px] text-white/35">{user.email || "session.active"}</p></div>}
                    {!isCollapsed && <ChevronDown className="size-3 text-white/35" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="border-white/10 bg-[#11131b] text-white/80">
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-200 focus:bg-red-400/10 focus:text-red-100"><LogOut className="mr-2 size-4" />ログアウト</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button onClick={() => startLogin()} className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-white/50 transition hover:bg-white/[0.06] hover:text-white group-data-[collapsible=icon]:justify-center" aria-label="ログイン">
                <Avatar className="size-8 border border-white/15 bg-white/5"><AvatarFallback className="bg-transparent font-mono text-xs text-white/65">NF</AvatarFallback></Avatar>
                {!isCollapsed && <div><p className="text-xs text-white/70">ゲストセッション</p><p className="font-mono text-[9px] text-cyan-200/50">サインイン →</p></div>}
              </button>
            )}
          </SidebarFooter>
        </Sidebar>
        <div className={`absolute right-0 top-0 z-50 h-full w-1 cursor-col-resize transition-colors hover:bg-cyan-300/30 ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => setIsResizing(true)} />
      </div>
      <SidebarInset className="min-w-0 bg-[#07080d]">
        {isMobile && <div className="sticky top-0 z-40 flex h-14 items-center border-b border-white/10 bg-[#07080d]/95 px-2 backdrop-blur"><SidebarTrigger className="size-9 text-white/70" /><span className="ml-2 font-mono text-[10px] tracking-[0.2em] text-cyan-200">NEXAFLOW / MOBILE</span></div>}
        <main className="min-h-screen">{children}</main>
      </SidebarInset>
    </>
  );
}
