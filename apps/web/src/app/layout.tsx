import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { SiteHeader } from "@/src/components/ui/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team APE:RIP Online Studio",
  description:
    "A HOI4 modding collaboration studio focused on organizations, focus trees, localization and long-term extensibility.",
  icons: {
    icon: [
      {
        url: "/branding/apeos-logo.webp",
        sizes: "16x16",
        type: "image/webp",
      },
      {
        url: "/branding/apeos-logo.webp",
        sizes: "32x32",
        type: "image/webp",
      },
      {
        url: "/branding/apeos-logo-large.webp",
        sizes: "48x48",
        type: "image/webp",
      },
      {
        url: "/branding/apeos-logo-large.webp",
        sizes: "64x64",
        type: "image/webp",
      },
      {
        url: "/branding/apeos-logo-large.webp",
        sizes: "128x128",
        type: "image/webp",
      },
      {
        url: "/branding/apeos-logo-large.webp",
        sizes: "256x256",
        type: "image/webp",
      },
    ],
    shortcut: "/branding/apeos-logo.webp",
    apple: [
      {
        url: "/branding/apeos-logo-large.webp",
        sizes: "180x180",
        type: "image/webp",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="site-shell">
            <div className="site-shell__glow site-shell__glow--pink" />
            <div className="site-shell__glow site-shell__glow--purple" />
            <div className="site-shell__glow site-shell__glow--cyan" />
            <div className="site-shell__grid" />
            <SiteHeader />
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}