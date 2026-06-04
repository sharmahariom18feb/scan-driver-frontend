import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { ReduxProvider } from "@/redux/provider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://scandriver.in"),
  title: {
    default: "ScanDriver – Your Driver One Scan Away | Delhi NCR",
    template: "%s | ScanDriver",
  },
  description:
    "Delhi NCR's most trusted on-demand driver service. Hire verified, professional drivers hourly, weekly, monthly or for outstation. Book via WhatsApp instantly.",
  keywords:
    "hire driver Delhi NCR, on demand driver Delhi, verified driver Gurgaon, personal driver Noida, monthly driver hire, outstation driver, driver on demand",
  authors: [{ name: "ScanDriver Private Limited" }],
  creator: "ScanDriver Private Limited",
  publisher: "ScanDriver Private Limited",
  openGraph: {
    title: "ScanDriver – Your Driver One Scan Away",
    description:
      "Verified. Professional. On-Demand. Delhi NCR's most trusted driver platform.",
    url: "https://scandriver.in",
    siteName: "ScanDriver",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScanDriver – Your Driver One Scan Away",
    description:
      "Verified. Professional. On-Demand. Delhi NCR's most trusted driver platform.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    // icon: "/icons/logo-sd.png",
    apple: "/icons/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#080808" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="bg-background">
      <body
        className={`${manrope.variable} antialiased`}
        suppressHydrationWarning>
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange={false}>
            {children}
          </ThemeProvider>
        </ReduxProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
