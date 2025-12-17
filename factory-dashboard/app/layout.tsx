import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Factory Dashboard",
  description: "Real-time monitoring and analytics for smart factory automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
