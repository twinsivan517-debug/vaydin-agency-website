import type { Metadata } from "next";
import { Corner } from "@/components/Corner";

export const metadata: Metadata = { title: "Ask Vaydin", robots: { index: false, follow: false } };

/* The frame's own page: nothing but him, on no background, so the page
   around the frame shows through. */
const SEE_THROUGH = "html,body{background:transparent!important;min-height:0}body::before{display:none}";

export default function CornerPage() {
  return (
    <>
      <style>{SEE_THROUGH}</style>
      <Corner />
    </>
  );
}
