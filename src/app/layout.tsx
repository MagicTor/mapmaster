import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "MapMaster - Test Your Geography Knowledge",
  description: "A modern browser-based geography game where players test their knowledge of world geography through interactive map challenges.",
  keywords: ["geography", "game", "map", "educational", "quiz"],
  openGraph: {
    title: "MapMaster",
    description: "Test your geography knowledge with MapMaster",
    url: "https://mapmaster.com",
    siteName: "MapMaster",
    images: [
      {
        url: "https://mapmaster.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MapMaster",
    description: "Test your geography knowledge with MapMaster",
    images: ["https://mapmaster.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
