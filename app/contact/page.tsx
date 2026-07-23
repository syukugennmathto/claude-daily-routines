import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import FadeIn from "@/components/motion/FadeIn";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "お仕事のご相談、取材のご依頼、そしてただのおたよりも。Honami へのご連絡はこちらから。",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="おたより"
        titleEn="Say Hello"
        lead="お仕事のご相談も、ちょっとした感想も。どうぞお気軽に、お便りください。"
      />

      <section className="container-editorial py-16 md:py-24">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <ContactForm />
          </div>

          <aside className="md:col-span-5 md:pl-8">
            <FadeIn>
              <p className="eyebrow">Elsewhere</p>
              <h2 className="mt-4 font-display text-2xl text-ink">つながる場所</h2>
              <div className="mt-8 space-y-5">
                <a href={`mailto:${site.email}`} className="block border-b border-light-gray pb-4">
                  <span className="text-xs tracking-widest text-dusty-brown">Email</span>
                  <span className="mt-1 block font-serif text-lg italic text-ink">{site.email}</span>
                </a>
                {site.socials.map((s) => (
                  <a
                    key={s.handle}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block border-b border-light-gray pb-4"
                  >
                    <span className="text-xs tracking-widest text-dusty-brown">{s.label}</span>
                    <span className="mt-1 block text-lg text-ink transition-colors group-hover:text-dusty-brown-deep">
                      {s.handle}
                    </span>
                  </a>
                ))}
              </div>
              <p className="mt-10 max-w-sm text-sm leading-loose text-ink-soft">
                お返事には数日いただくことがあります。ゆっくりお待ちいただけたら嬉しいです。
              </p>
            </FadeIn>
          </aside>
        </div>
      </section>
    </>
  );
}
