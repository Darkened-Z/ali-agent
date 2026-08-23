import { TopBar } from "@/components/TopBar";
import { LeadForm } from "@/components/LeadForm";

export default function FormPage() {
  return (
    <>
      <TopBar />
      <section className="surface">
        <div className="section-head">
          <div className="section-idx">02 / 03</div>
          <h2 className="section-title">Public lead form — one question at a time, keyboard-first, feels fast.</h2>
          <p className="section-sub">Multi-step. Every question is one big idea. Options are number-keyed (press 1–4). Numbers everywhere in mono. No cards-on-cards, no gradients, no fluff.</p>
        </div>
        <div className="section-body">
          <LeadForm />
        </div>
      </section>
    </>
  );
}
