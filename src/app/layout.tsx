import type { Metadata } from 'next';
import { PT_Sans, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Using next/font for better performance and DX
const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-source-code-pro',
});

export const metadata: Metadata = {
  title: 'FotoClear - AI Background Remover & Resizer',
  description: 'Easily remove backgrounds and resize product photos for e-commerce and social media with FotoClear.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ptSans.variable} ${sourceCodePro.variable}`}>
      <head>
        {/* Favicon links can be added here if needed, but not generating one */}
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
