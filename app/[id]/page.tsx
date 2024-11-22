"use client";

import { Button } from "@/components/ui/button";
import { MemeViewer } from "@/components/meme-viewer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import memes from "../data/memes";
import { ToastProvider } from "@/components/ui/toast";

export default function MemePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const meme = memes.find((m) => m.id === params.id);

  if (!meme) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-xl font-bold">Meme not found</h1>
        <Button onClick={() => router.push("/")}>Go back</Button>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex flex-col items-center gap-8 p-8">
        <Link href="/">
          <Button>Go back</Button>
        </Link>
        <MemeViewer meme={meme} />
      </div>
    </ToastProvider>
  );
}
