import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ContactSection from "@/components/section/contact-section";
import CredentialsSection from "@/components/section/credentials-section";
import EducationSection from "@/components/section/education-section";
import ExperienceSection from "@/components/section/experience-section";
import SelectedWorkSection from "@/components/section/selected-work-section";
import SkillsSection from "@/components/section/skills-section";
import AboutSection from "@/components/section/about-section";
import { profile } from "@/lib/content";

const DELAY = 0.04;

/** Consistent section shell so headings and spacing stay uniform. */
function Section({
  id,
  title,
  delay,
  children,
}: {
  id: string;
  title?: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id}>
      <div className="flex min-h-0 flex-col gap-y-5">
        {title ? (
          <BlurFade delay={delay}>
            <h2 className="text-xl font-bold">{title}</h2>
          </BlurFade>
        ) : null}
        <BlurFade delay={delay + DELAY}>{children}</BlurFade>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <main className="relative flex min-h-dvh flex-col gap-14">
      <section id="hero">
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex flex-col justify-between gap-2 gap-y-6 md:flex-row">
            <div className="order-2 flex flex-col gap-2.5 md:order-1">
              <BlurFadeText
                delay={DELAY}
                className="text-3xl font-semibold tracking-tighter sm:text-4xl lg:text-5xl"
                yOffset={8}
                text={`Hi, I'm ${profile.name.split(" ")[0]}`}
              />
              <BlurFadeText
                className="text-muted-foreground max-w-[600px] md:text-lg lg:text-xl"
                delay={DELAY * 2}
                text={profile.positioning}
              />
            </div>
            <BlurFade delay={DELAY} className="order-1 md:order-2">
              <Avatar className="size-24 rounded-full border shadow-lg ring-4 ring-muted md:size-32">
                <AvatarImage alt={profile.name} src={profile.avatarUrl} />
                <AvatarFallback>{profile.initials}</AvatarFallback>
              </Avatar>
            </BlurFade>
          </div>
        </div>
      </section>

      <Section id="about" title="About" delay={DELAY * 5}>
        <AboutSection />
      </Section>

      <Section id="experience" title="Experience" delay={DELAY * 7}>
        <ExperienceSection />
      </Section>

      {/* No `title` on the next three: each carries its own centred
          SectionHeader, matching upstream. Passing one too would render a
          left-aligned h2 directly above it. */}
      <Section id="projects" delay={DELAY * 9}>
        <SelectedWorkSection />
      </Section>

      <Section id="skills" title="Skills" delay={DELAY * 10}>
        <SkillsSection />
      </Section>

      <Section id="certifications" delay={DELAY * 11}>
        <CredentialsSection />
      </Section>

      <Section id="education" delay={DELAY * 13}>
        <EducationSection />
      </Section>

      <Section id="contact" delay={DELAY * 15}>
        <ContactSection />
      </Section>
    </main>
  );
}
