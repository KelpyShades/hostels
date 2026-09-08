import { formatGhs, type Hostel } from "@/lib/mock-hostel";
import { content } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/site/shared";

/**
 * How to book — the numbered steps beside the payment "folio". The steps
 * and the payment card are per-hostel (`Hostel.guide`, `bookingFee` /
 * `paymentNote`): hostels with a booking fee show the fee card; hostels
 * like Franco, where students pay and send a receipt, show their real
 * process instead. One composition, two truths.
 */

const c = content;

export function GuideSection({ hostel }: { hostel: Hostel }) {
  return (
    <section id="guide" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          <SectionTitle>{c.sections.guide}</SectionTitle>
          <Reveal className="mt-12">
            <div className="border border-(--line-strong) bg-(--bg-soft) p-8">
              {hostel.bookingFee ? (
                <>
                  <p className="text-[13px] font-medium text-(--ink-muted)">{c.booking.feeLabel}</p>
                  <p className="mt-3 text-[2.4rem] font-semibold leading-none tracking-[-0.01em] tabular-nums">
                    {formatGhs(hostel.bookingFee)}
                  </p>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-(--ink-soft)">
                    {c.booking.holdsRoom}
                  </p>
                </>
              ) : (
                <p className="text-[15px] leading-[1.7] text-(--ink-soft)">
                  {hostel.paymentNote}
                </p>
              )}
              <div className="mt-7 border-t border-(--line) pt-6">
                <p className="text-[14.5px] font-semibold">{c.booking.payVia}</p>
                <p className="mt-1.5 text-[15px] text-(--ink-soft)">
                  {hostel.momoName}
                  <br />
                  {hostel.momoNumber}
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal className="mt-8">
            <p className="text-[13px] font-medium text-(--ink-muted)">{c.guide.beforeYouStart}</p>
            <ul className="mt-4 space-y-2">
              {hostel.guide.whatYouNeed.map((item) => (
                <li key={item} className="flex items-baseline gap-3 text-[14.5px] text-(--ink-soft)">
                  <span aria-hidden="true" className="h-1 w-1 shrink-0 -translate-y-px rounded-full bg-(--accent)" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <div className="lg:col-span-7">
          <ol className="mt-2 lg:mt-24">
            {hostel.guide.steps.map((step, i) => (
              <Reveal key={step.title}>
                <li className="grid grid-cols-[3.25rem_1fr] gap-5 border-t border-(--line-strong) py-8 sm:gap-8">
                  <span className="font-(family-name:--font-display) text-[1.75rem] font-medium leading-none text-(--accent)">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-(family-name:--font-display) text-[1.45rem] font-semibold leading-tight tracking-[-0.01em]">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 max-w-md text-[15px] leading-[1.7] text-(--ink-soft)">
                      {step.body}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
            <li aria-hidden="true" className="border-t border-(--line-strong)" />
          </ol>
        </div>
      </div>
    </section>
  );
}
