import { cn } from "@/lib/utils";
import { getMascotConfig } from "@/lib/brand/mascots";

interface MascotImageProps {
  type: "ashley" | "chris" | "both";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
  lazy?: boolean;
}

const sizeMap = {
  sm: {
    width: 120,
    height: 160,
    className: "w-28 h-auto",
  },
  md: {
    width: 200,
    height: 260,
    className: "w-48 h-auto",
  },
  lg: {
    width: 280,
    height: 360,
    className: "w-64 h-auto",
  },
  xl: {
    width: 400,
    height: 520,
    className: "w-96 h-auto",
  },
};

export default function MascotImage({
  type,
  size = "md",
  className,
  priority = false,
  lazy = true,
}: MascotImageProps) {
  const config = getMascotConfig(type);
  const sizeConfig = sizeMap[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        sizeConfig.className,
        className
      )}
      style={{
        aspectRatio: config.aspectRatio,
      }}
    >
      <img
        src={config.src}
        alt={config.alt}
        width={sizeConfig.width}
        height={sizeConfig.height}
        loading={lazy && !priority ? "lazy" : "eager"}
        decoding="async"
        className="w-full h-auto object-contain"
        style={{
          willChange: "auto",
          contain: "layout style paint",
        }}
      />
    </div>
  );
}
