"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, ShieldCheck } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { title: string; href?: string }[];
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function Header({
  title,
  subtitle,
  breadcrumbs,
  actionLabel,
  actionHref,
  onActionClick,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-[#0b0f19]/90 backdrop-blur-md border-b border-white/5 px-8 py-3.5 flex justify-between items-center select-none">
      {/* Right: Breadcrumbs & Title */}
      <div className="space-y-1">
        {breadcrumbs && (
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-muted font-medium">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={idx}>
                {b.href ? (
                  <Link
                    href={b.href}
                    className="hover:text-primary transition-colors"
                  >
                    {b.title}
                  </Link>
                ) : (
                  <span className="text-on-surface font-semibold">{b.title}</span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <span className="text-outline/40">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-bold text-on-surface">{title}</h1>
          {subtitle && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-on-surface-variant border border-white/5 font-medium">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Left: System Status & Optional Action */}
      <div className="flex items-center gap-3">
        {/* Connection Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-low border border-white/5 text-[11px] text-on-surface-muted">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span>سحابة Firestore متصلة</span>
        </div>

        {/* Primary CTA Button if supplied */}
        {actionLabel && (
          actionHref ? (
            <Link
              href={actionHref}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-[#0b0f19] font-bold text-xs hover:brightness-105 active:scale-95 transition-all shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{actionLabel}</span>
            </Link>
          ) : (
            <button
              onClick={onActionClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-[#0b0f19] font-bold text-xs hover:brightness-105 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{actionLabel}</span>
            </button>
          )
        )}
      </div>
    </header>
  );
}
