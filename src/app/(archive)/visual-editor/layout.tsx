import { Inter } from "next/font/google";
import { cn } from "@/lib/editor-ui-utils";
import "./editor.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function VisualEditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={cn(inter.variable, "font-sans")}>{children}</div>;
}
