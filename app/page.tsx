"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import memes from "./data/memes";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-xl font-bold">pick your meme</h1>
      <main className="max-w-[1200] grid grid-cols-3 col-auto gap-8 row-start-2 items-center sm:items-start">
        {memes?.map((meme) => (
          <Card className="h-[400] flex flex-col justify-center items-center" key={meme.id}>
            <CardHeader>
              <Image
                className="rounded self-center object-cover w-48 h-48"
                src={meme.template_url.replace("/public", "")}
                width={200}
                height={200}
                alt={meme.description}
              />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <CardTitle className="">{meme.name}</CardTitle>
              <CardDescription>
                {meme.description.substring(0, 120) + "..."}
              </CardDescription>
              <Link href={`/${meme.id}`}><Button>Select template</Button></Link>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
