"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell, BellOff, Loader2, CheckCheck, Trash2,
  Info, CheckCircle, AlertTriangle, XCircle,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Notification {
  id:        string;
  title:     string;
  message:   string;
  type:      string;
  read:      boolean;
  link:      string | null;
  createdAt: string;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  success: <CheckCircle  className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />,
  error:   <XCircle      className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5"   />,
  info:    <Info         className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5"  />,
};

const TYPE_BG: Record<string, string> = {
  success: "bg-green-50  dark:bg-green-950/20",
  warning: "bg-yellow-50 dark:bg-yellow-950/20",
  error:   "bg-red-50    dark:bg-red-950/20",
  info:    "bg-blue-50   dark:bg-blue-950/20",
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [open,          setOpen]          = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json() as { notifications: Notification[]; unreadCount: number };
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  // Poll every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  // Refresh when panel opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    await fetch(`/api/notifications/${id}`, { method: "PATCH" }).catch(() => null);
  };

  const markAllRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    await fetch("/api/notifications/all", { method: "PATCH" }).catch(() => null);
  };

  const deleteNotification = async (id: string) => {
    const n = notifications.find((x) => x.id === id);
    // Optimistic update
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    if (n && !n.read) setUnreadCount((c) => Math.max(0, c - 1));

    await fetch(`/api/notifications/${id}`, { method: "DELETE" }).catch(() => {
      // Revert on failure
      fetchNotifications();
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                onClick={markAllRead}
                title="Mark all as read"
              >
                <CheckCheck className="w-3 h-3" />
                All read
              </Button>
            )}
          </div>
        </div>

        {/* Notification list */}
        <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <BellOff className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground text-center px-6">
                You&apos;ll be notified about important activity on your proposals.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationRow
                key={n.id}
                n={n}
                onMarkRead={() => markAsRead(n.id)}
                onDelete={() => deleteNotification(n.id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border bg-muted/30">
            <p className="text-[10px] text-muted-foreground text-center">
              Showing last 40 · Auto-refreshes every 60s
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({
  n,
  onMarkRead,
  onDelete,
}: {
  n:          Notification;
  onMarkRead: () => void;
  onDelete:   () => void;
}) {
  const Wrapper = n.link ? "a" : "div";
  const wrapperProps = n.link
    ? { href: n.link, onClick: !n.read ? onMarkRead : undefined }
    : {};

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 px-4 py-3 transition-colors",
        !n.read ? cn(TYPE_BG[n.type] ?? TYPE_BG.info, "hover:brightness-95") : "hover:bg-muted/50",
      )}
    >
      {/* Unread dot */}
      {!n.read && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
      )}

      {/* Icon */}
      <div className="mt-0.5">
        {TYPE_ICON[n.type] ?? TYPE_ICON.info}
      </div>

      {/* Content */}
      <Wrapper className="flex-1 min-w-0 cursor-default" {...wrapperProps}>
        <p className={cn("text-xs font-medium leading-snug", !n.read ? "text-foreground" : "text-muted-foreground")}>
          {n.title}
        </p>
        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
          {n.message}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">{timeAgo(n.createdAt)}</p>
      </Wrapper>

      {/* Actions — appear on hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!n.read && (
          <button
            onClick={onMarkRead}
            title="Mark as read"
            className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground"
          >
            <CheckCheck className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={onDelete}
          title="Delete"
          className="p-1 rounded hover:bg-background text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
