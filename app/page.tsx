"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import memes from "./data/memes";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            makeame.me
          </h1>
          {/* add back banner jpeg */}
          <p className="text-xl text-gray-300 mb-8">
            AI-powered meme generator. Select a template, enter a prompt, and let AI do the magic.
          </p>
          <img
            className="w-full max-w-[1200px] self-center m-auto rounded-lg mt-2 h-72 object-cover"
            src="/kX3rlAx1.jpeg"
            width={1000}
            alt="banner"
          />
        </div>

        {/* Meme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memes?.map((meme) => (
            <Card 
              key={meme.id} 
              className="bg-gray-800 border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1"
            >
              <CardHeader className="p-4">
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <Image
                    className="object-cover"
                    src={meme.template_url.replace("public", "")}
                    fill
                    alt={meme.description}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-xl font-bold mb-2 text-white">
                  {meme.name}
                </CardTitle>
                <CardDescription className="text-gray-400 mb-4">
                  {meme.description.substring(0, 120)}...
                </CardDescription>
                <Link href={`/${meme.id}`}>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Select Template
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center mt-20 pb-8 text-gray-400">
          <p>Made with ❤️ by dan goosewin</p>
        </footer>
      </div>
    </div>
  );
}
