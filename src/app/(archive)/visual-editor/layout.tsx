import { Geist, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/editor-ui-utils";
import "./editor.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-heading",
});

export default function VisualEditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={cn(geist.variable, jetbrainsMono.variable, "font-sans")}>{children}</div>;
}
