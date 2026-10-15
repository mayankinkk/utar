import "./globals.css";

export const metadata = {
  title: "Uttar — reply drafts for small sellers",
  description:
    "Paste a customer message, get grounded reply drafts in your language and voice. Open-weight models via Ollama. Nothing leaves your machine.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Uttar",
  },
};

export const viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
