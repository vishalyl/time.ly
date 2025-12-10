import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { TimerProvider } from "@/context/TimerContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Time.ly - Focus Timer & Productivity Tracker",
  description: "Minimalist Pomodoro timer with ambient sounds, project tracking, and analytics. Stay focused and boost productivity.",
  keywords: ["pomodoro timer", "focus timer", "productivity", "time tracking", "pomodoro technique"],
  authors: [{ name: "Time.ly" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <TimerProvider>
              {children}
            </TimerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
