import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Inbox, Send, PenSquare, ShieldAlert, Trash2,
  ChevronLeft, ChevronRight, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Home", icon: Home, path: "/dashboard" },
  { label: "Inbox", icon: Inbox, path: "/inbox", badge: 2 },
  { label: "Compose", icon: PenSquare, path: "/compose" },
  { label: "Sent", icon: Send, path: "/sent" },
  { label: "Spam", icon: ShieldAlert, path: "/spam" },
  { label: "Recycle Bin", icon: Trash2, path: "/trash" },
  { label: "Security Architecture", icon: BookOpen, path: "/security-architecture" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen sticky top-0 flex flex-col border-r border-border bg-sidebar overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <img src={logo} alt="Quantum Mail" className="w-8 h-8 rounded-lg object-contain" />
              <span className="font-semibold text-foreground text-sm">Quantum Mail</span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <img src={logo} alt="Quantum Mail" className="w-8 h-8 rounded-lg object-contain mx-auto" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative",
                isActive
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full"
                />
              )}
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-accent")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && !collapsed && (
                <span className="ml-auto text-xs font-semibold bg-accent/15 text-accent px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
