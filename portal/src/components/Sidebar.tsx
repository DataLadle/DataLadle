"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Box,
  Bell,
  ClipboardList,
  Settings,
  ChevronDown,
  Radio,
  Router,
  Users,
  FileText,
  Shield,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  links: NavLink[];
}

const navStructure: (NavLink | NavGroup)[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/locations", label: "Locations", icon: MapPin },
  { href: "/assets", label: "Assets", icon: Box },
  {
    label: "Monitoring",
    icon: Bell,
    links: [
      { href: "/alerts", label: "Alerts", icon: Bell },
      { href: "/rules", label: "Rules", icon: ClipboardList },
    ],
  },
  { href: "/maintenance", label: "Maintenance", icon: ClipboardList },
  {
    label: "Settings",
    icon: Settings,
    links: [
      { href: "/settings/devices", label: "Devices", icon: Radio },
      { href: "/settings/gateways", label: "Gateways", icon: Router },
      { href: "/settings/users", label: "Users", icon: Users },
      { href: "/settings/reports", label: "Reports", icon: FileText },
    ],
  },
];

function isGroup(item: NavLink | NavGroup): item is NavGroup {
  return "links" in item;
}

function isPathInGroup(group: NavGroup, pathname: string): boolean {
  return group.links.some(
    (link) => pathname === link.href || pathname.startsWith(link.href + "/")
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const showSuperAdmin = currentUser?.role === "superuser";

  useEffect(() => {
    const toExpand = new Set<string>();
    for (const item of navStructure) {
      if (isGroup(item) && isPathInGroup(item, pathname)) {
        toExpand.add(item.label);
      }
    }
    if (toExpand.size > 0) {
      setExpandedGroups((prev) => new Set([...prev, ...toExpand]));
    }
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <aside className="no-print fixed left-0 top-0 z-40 h-screen w-56 border-r border-slate-800/80 bg-slate-950/95">
      <nav className="flex h-full flex-col gap-1 p-4 pt-20">
        <div className="flex flex-1 flex-col gap-1">
          {navStructure.map((item) => {
          if (isGroup(item)) {
            const isExpanded = expandedGroups.has(item.label);
            const hasActiveChild = isPathInGroup(item, pathname);
            const GroupIcon = item.icon;

            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(item.label)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-left text-sm font-semibold transition-all ${
                    hasActiveChild
                      ? "bg-[#26ADE4]/10 text-[#26ADE4]"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-slate-700/80 pl-3">
                    {item.links.map(({ href, label, icon: Icon }) => {
                      const isActive =
                        pathname === href || pathname.startsWith(href + "/");
                      return (
                        <Link
                          key={href}
                          href={href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                            isActive
                              ? "bg-[#26ADE4]/15 text-[#26ADE4]"
                              : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-200"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const { href, label, icon: Icon } = item;
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#26ADE4]/15 text-[#26ADE4] shadow-[0_0_20px_rgba(38,173,228,0.25)]"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
        </div>
        <div className="mt-auto border-t border-slate-800/80 pt-4">
          {showSuperAdmin && (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-violet-400 transition-all hover:bg-violet-500/10 hover:text-violet-300"
          >
            <Shield className="h-5 w-5 shrink-0" />
            Super Admin
          </Link>
          )}
        </div>
      </nav>
    </aside>
  );
}
