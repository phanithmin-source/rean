import React from "react";
import Image from "next/image";

interface ReanLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  useImage?: boolean;
}

export function ReanLogo({
  className = "",
  size = "md",
  showText = true,
  useImage = false,
}: ReanLogoProps) {
  const sizeMap = {
    sm: { icon: 28, text: "text-lg", sub: "text-[10px]" },
    md: { icon: 38, text: "text-xl", sub: "text-xs" },
    lg: { icon: 52, text: "text-2xl", sub: "text-sm" },
    xl: { icon: 72, text: "text-4xl", sub: "text-base" },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Icon-only coding book */}
      {useImage ? (
        <div
          className="relative rounded-lg overflow-hidden border border-[#A8C8B2]/40 shadow-sm bg-[#343D4F]"
          style={{ width: current.icon, height: current.icon }}
        >
          <Image
            src="/images/logo.png"
            alt="Rean Logo"
            fill
            className="object-contain p-0.5"
            priority
          />
        </div>
      ) : (
        <svg
          width={current.icon}
          height={current.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 rounded-lg shadow-sm"
          role="img"
          aria-label="Rean Logo - Coding Book"
        >
          {/* Slate Navy Background */}
          <rect width="48" height="48" rx="10" fill="#343D4F" />

          {/* Pale Cyan Outer Book Glow/Outline */}
          <path
            d="M8 12.5C8 10.5 10 9 12 9H36C38 9 40 10.5 40 12.5V36.5C40 38.5 38 39.5 36 39.5H12C10 39.5 8 38.5 8 36.5V12.5Z"
            stroke="#BCE5E8"
            strokeWidth="1.2"
            strokeOpacity="0.6"
            strokeDasharray="2 2"
          />

          {/* Soft Sage Main Book Body & Center Fold */}
          {/* Left Page Outline */}
          <path
            d="M10 13C10 13 15 11.5 24 13.5V37C15 35 10 36.5 10 36.5V13Z"
            fill="#343D4F"
            stroke="#A8C8B2"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Right Page Outline */}
          <path
            d="M38 13C38 13 33 11.5 24 13.5V37C33 35 38 36.5 38 36.5V13Z"
            fill="#343D4F"
            stroke="#A8C8B2"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Center Spine Fold */}
          <line
            x1="24"
            y1="13.5"
            x2="24"
            y2="37"
            stroke="#A8C8B2"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Pale Cyan Coding Symbols */}
          {/* Left page: < > and // */}
          <path
            d="M16 19L13.5 22L16 25"
            stroke="#BCE5E8"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.5 21.5L20.5 19.5"
            stroke="#BCE5E8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Right page: { } and ; */}
          <path
            d="M32 19L34.5 22L32 25"
            stroke="#BCE5E8"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="28" cy="21" r="1" fill="#BCE5E8" />
          <path
            d="M28 23C28 24 27.5 24.8 26.8 25.2"
            stroke="#BCE5E8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      )}

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span
              className={`font-bold tracking-tight text-navy ${current.text}`}
            >
              Rean
            </span>
            <span className="font-khmer font-semibold text-sage-600 text-sm">
              (រៀន)
            </span>
          </div>
          <span className={`text-muted-foreground font-medium -mt-0.5 ${current.sub}`}>
            Software Learning & Resource Hub
          </span>
        </div>
      )}
    </div>
  );
}
