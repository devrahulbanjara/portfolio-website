import { ImageResponse } from "next/og";
import { person } from "@/content/profile";
import { OG_SIZE, OgFrame, portraitDataUrl } from "@/lib/og";

export const alt = `${person.name} — ${person.role} and ${person.secondaryRole}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(<OgFrame eyebrow={`${person.role} & ${person.secondaryRole}`} title={person.name} footer={`Based in ${person.location}`} photo={await portraitDataUrl()} />, size);
}
