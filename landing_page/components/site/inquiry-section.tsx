import { content } from "@/lib/content";
import type { Branch } from "@/lib/mock-hostel";
import type { ChatContact } from "@/lib/wa";
import { InquiryForm } from "@/components/inquiry-form";
import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/site/shared";

/**
 * Ask about a room — the shared inquiry form inside a hairline
 * "registration card". Submitting opens WhatsApp pre-filled (FR-A8),
 * addressed to this branch's caretaker when the org has one per branch.
 */

const c = content;

export function InquirySection({
  branch,
  contact,
}: {
  branch: Branch;
  contact: ChatContact;
}) {
  return (
    <section id="inquire" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-2xl">
        <SectionTitle>{c.sections.inquire}</SectionTitle>
        <Reveal>
          <p className="mt-6 max-w-lg text-[15.5px] leading-[1.75] text-(--ink-soft)">
            {c.inquiryIntro}
          </p>
        </Reveal>
        <Reveal className="mt-10">
          <div className="border border-(--line-strong) bg-(--bg-soft) p-6 sm:p-10">
            <InquiryForm contact={contact} rooms={branch.rooms} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
