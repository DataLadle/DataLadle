"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Briefcase, Settings } from "lucide-react";

const navItems = [
  { href: "/contractor", label: "My Jobs", icon: ClipboardList },
  { href: "/contractor/available", label: "Available Work", icon: Briefcase },
  { href: "/contractor/settings", label: "Settings", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  compact,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
        compact ? "flex-col gap-1 text-xs" : ""
      } ${
        isActive
          ? "bg-[#26ADE4]/15 text-[#26ADE4]"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export function ContractorSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="no-print fixed left-0 top-0 z-40 hidden h-full w-56 flex-col border-r border-slate-800/80 bg-slate-950/95 py-4 md:flex md:px-4">
        <Link href="/contractor" className="mb-6 flex items-center gap-2 pl-2">
          <span className="text-lg font-bold text-white">Data Ladle</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== "/contractor" && pathname.startsWith(href));
            return (
              <NavLink key={href} href={href} label={label} icon={Icon} isActive={isActive} compact={false} />
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="no-print fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-800/80 bg-slate-950/95 py-2 md:hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/contractor" && pathname.startsWith(href));
          return (
            <NavLink key={href} href={href} label={label} icon={Icon} isActive={isActive} compact />
          );
        })}
      </nav>

      {/* Mobile top bar */}
      <header className="no-print fixed left-0 right-0 top-0 z-30 flex h-14 items-center border-b border-slate-800/80 bg-slate-950/95 px-4 md:hidden">
        <Link href="/contractor" className="text-lg font-bold text-white">
          Data Ladle
        </Link>
      </header>
    </>
  );
}
