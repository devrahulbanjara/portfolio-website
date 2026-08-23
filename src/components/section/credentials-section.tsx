import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { initialsOf } from "@/lib/utils";
import { certifications } from "@/lib/content";

/**
 * Compact credential rows, per the brief: issuer, name, year, verification link.
 * Deliberately no large certificate images - the verification link is the proof
 * that matters, and a wall of certificate JPEGs reads as padding.
 */
export default function CredentialsSection() {
  return (
    <ul className="flex flex-col gap-3">
      {certifications.map((cert) => (
        <li key={cert.slug}>
          <a
            href={cert.verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3"
          >
            <Logo
              src={cert.issuerLogoUrl}
              alt={cert.issuer}
              fallback={initialsOf(cert.issuer)}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-sm font-medium leading-tight">
                <span className="truncate">{cert.name}</span>
                <ArrowUpRight
                  className="size-3.5 flex-none text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
              </span>
              <span className="text-xs text-muted-foreground">
                {cert.issuer}
              </span>
            </div>
            <span className="flex-none text-xs tabular-nums text-muted-foreground">
              {cert.date}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
