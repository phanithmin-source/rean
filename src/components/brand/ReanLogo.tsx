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
  useImage = true,
}: ReanLogoProps) {
  const sizeMap = {
    sm: { icon: 32, text: "text-lg", sub: "text-[11px]", radius: "rounded-lg" },
    md: { icon: 42, text: "text-xl", sub: "text-xs", radius: "rounded-xl" },
    lg: { icon: 54, text: "text-2xl", sub: "text-sm", radius: "rounded-2xl" },
    xl: { icon: 76, text: "text-4xl", sub: "text-base", radius: "rounded-2xl" },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Real PNG brand logo */}
      <div
        className={`relative ${current.radius} overflow-hidden border border-[#A8C8B2]/40 shadow-xs bg-[#343D4F] shrink-0`}
        style={{ width: current.icon, height: current.icon }}
      >
        <Image
          src="/images/logo.png"
          alt="Rean Logo"
          fill
          sizes={`${current.icon}px`}
          className="object-cover"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span
              className={`font-extrabold tracking-tight text-navy ${current.text}`}
            >
              Rean
            </span>
            <span className="font-khmer font-semibold text-sage-600 text-sm tracking-normal">
              (រៀន)
            </span>
          </div>
          <span
            className={`text-muted-foreground/90 font-medium tracking-tight mt-1 leading-none ${current.sub}`}
          >
            Software Learning & Resource Hub
          </span>
        </div>
      )}
    </div>
  );
}

