import { content } from "@/lib/content";
import type { Hostel } from "@/lib/mock-hostel";
import { SectionTitle } from "@/components/site/shared";

/**
 * Good to know — house rules as a hairline list, FAQs as native
 * <details> disclosure (keyboard-accessible, motion answers the action).
 */

const c = content;

export function GoodToKnowSection({ hostel }: { hostel: Hostel }) {
  return (
    <section id="good-to-know" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24 sm:px-8 sm:py-32">
      <SectionTitle>{c.sections.goodToKnow}</SectionTitle>
      <div className="mt-14 grid gap-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <h3 className="text-[15px] font-semibold">{c.sections.rules}</h3>
          <ul className="mt-6 border-t border-(--line-strong)">
            {hostel.houseRules.map((rule) => (
              <li key={rule.title} className="border-b border-(--line) py-5">
                <p className="text-[15px] font-semibold">{rule.title}</p>
                <p className="mt-1.5 text-[14.5px] leading-[1.65] text-(--ink-soft)">
                  {rule.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[15px] font-semibold">{c.sections.questions}</h3>
          <div className="mt-6 border-t border-(--line-strong)">
            {hostel.faqs.map((faq) => (
              <details key={faq.question} className="group border-b border-(--line)">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-(family-name:--font-display) text-[1.4rem] font-medium leading-none text-(--accent) transition-transform duration-300 motion-safe:group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-6 pr-8 text-[14.5px] leading-[1.7] text-(--ink-soft)">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
