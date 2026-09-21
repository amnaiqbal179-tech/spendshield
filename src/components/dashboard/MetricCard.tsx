import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
}

export default function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  trendType = "neutral",
}: MetricCardProps) {
  const trendStyles = {
    positive: "bg-[#E8F7F0] text-[#22A06B]",
    negative: "bg-[#FDECEE] text-[#E35D6A]",
    neutral: "bg-[#F4F5FA] text-[#667085]",
  };

  return (
    <div
      className="
        group relative overflow-hidden
        rounded-2xl border border-[#E7E9F0]
        bg-white p-5
        shadow-[0_1px_2px_rgba(16,24,40,0.03)]
        transition-all duration-300
        hover:-translate-y-[2px]
        hover:border-[#D9DCE6]
        hover:shadow-[0_8px_24px_rgba(16,24,40,0.06)]
      "
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEEAFE]">
          <Icon
            size={18}
            strokeWidth={1.8}
            className="text-[#7C5CFC]"
          />
        </div>

        {trend && (
          <div
            className={`
              flex items-center gap-1
              rounded-full px-2.5 py-1
              text-[11px] font-semibold
              ${trendStyles[trendType]}
            `}
          >
            {trendType === "positive" && <ArrowUpRight size={13} />}
            {trendType === "negative" && <ArrowDownRight size={13} />}
            {trend}
          </div>
        )}
      </div>

      <div className="mt-5">
        <p className="text-[12px] font-medium text-[#667085]">
          {label}
        </p>

        <h3 className="mt-1 text-[29px] font-bold tracking-[-0.03em] text-[#171A21]">
          {value}
        </h3>

        <p className="mt-1 text-[12px] text-[#98A2B3]">
          {description}
        </p>
      </div>

      <div
        className="
          absolute bottom-0 left-0 h-[2px] w-0
          bg-[#7C5CFC]
          transition-all duration-300
          group-hover:w-full
        "
      />
    </div>
  );
}