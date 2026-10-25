import React from "react";
import type { PromoItem } from "./types";

interface PromotionsSectionProps {
  promos: PromoItem[];
}

export default function PromotionsSection({ promos }: PromotionsSectionProps) {
  return (
    <section className="py-14 bg-[#0a0a12]" id="promotions">
      <div className="max-w-[1280px] mx-auto px-6">
        <h2 className="text-2xl font-bold text-[#f0f0f5] mb-7">Khuyến mãi nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {promos.map((promo) => (
            <div
              key={promo.id}
              id={promo.id}
              className={`p-7 rounded-xl border border-white/[0.06] bg-gradient-to-br ${promo.bg} flex flex-col hover:-translate-y-1 transition-transform duration-200 cursor-default`}
            >
              <h3 className="text-lg font-bold text-[#f0f0f5] mb-2">{promo.label}</h3>
              <p className="text-sm text-white/60 leading-relaxed flex-1">{promo.desc}</p>
              <button
                id={`${promo.id}-btn`}
                className="mt-4 self-start px-4 py-1.5 bg-transparent border border-white/35 rounded-md text-[#d0d0e0] text-xs font-medium hover:border-white/60 transition-colors cursor-pointer"
              >
                Chi tiết
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
