import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Shared pieces for social share images (1200×630). */
export const OG_SIZE = { width: 1200, height: 630 };

let portrait: Promise<string> | null = null;
export function portraitDataUrl() {
  portrait ??= readFile(join(process.cwd(), "public", "portrait.png"), "base64").then((b) => `data:image/png;base64,${b}`);
  return portrait;
}

export function OgFrame({ eyebrow, title, footer, photo }: { eyebrow: string; title: string; footer: string; photo?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg, #a9a9a7, #858583)", color: "#fff", fontFamily: "sans-serif", position: "relative" }}>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element -- satori renders plain img
        <img src={photo} alt="" width={540} height={631} style={{ position: "absolute", right: 0, bottom: 0, height: 630, width: 540, objectFit: "cover", objectPosition: "top" }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: photo ? 720 : 1200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, opacity: 0.95 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#fff" }} />
          {eyebrow}
        </div>
        <div style={{ display: "flex", fontSize: title.length > 60 ? 56 : 72, lineHeight: 1.05, letterSpacing: -2, fontWeight: 600, textShadow: "0 2px 24px rgba(0,0,0,0.15)" }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26 }}>
          <div style={{ display: "flex", padding: "12px 22px", borderRadius: 999, background: "#1c1d20" }}>{footer}</div>
        </div>
      </div>
    </div>
  );
}
