import type { Metadata } from "next";
import { Room } from "@/components/Room";
import { ROOMS } from "@/lib/pages";

/* The frame a room's page holds (public/<room>.html): him and his lines, on no
   background, so the page around shows through. Never indexed: the page around
   it carries the same words as text. One file per room in ROOMS. */
export const metadata: Metadata = { title: { absolute: "Vaydin" }, robots: { index: false, follow: false } };
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(ROOMS).map((id) => ({ id }));

const SEE_THROUGH = "html,body{background:transparent!important;min-height:0}body::before{display:none}";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <style>{SEE_THROUGH}</style>
      <Room room={id} />
    </>
  );
}
