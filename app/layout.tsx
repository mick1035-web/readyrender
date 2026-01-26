import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// [NEW] 引入 AuthProvider
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import NetworkStatusBanner from '@/components/NetworkStatusBanner';
import AiGeneratingOverlay from '@/components/ui/AiGeneratingOverlay';
import { SentryInit } from '@/components/SentryInit';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReadyRender - Create Stunning 3D Product Videos",
  description: "Transform your 3D models into professional marketing videos with cinematic camera movements, dynamic text, and custom animations. Export in 4K.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ReadyRender"
  },
  keywords: "3D video, product video, 3D animation, marketing video, product visualization, 3D rendering, video creation, 3D model, product demo",
  authors: [{ name: "ReadyRender" }],
  creator: "ReadyRender",
  publisher: "ReadyRender",

  // PLACEHOLDER: Update with your actual domain
  metadataBase: new URL('https://readyrender.com'),

  // Open Graph (for social media sharing)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://readyrender.com',
    title: 'ReadyRender - 3D Product Video Platform',
    description: 'Create professional 3D product videos in minutes with cinematic camera movements and dynamic animations',
    siteName: 'ReadyRender',
    // PLACEHOLDER: Replace with your actual OG image
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ReadyRender - 3D Product Video Platform',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'ReadyRender - Create Stunning 3D Product Videos',
    description: 'Transform your 3D models into professional marketing videos',
    // PLACEHOLDER: Replace with your actual Twitter image
    images: ['/twitter-image.jpg'],
    // PLACEHOLDER: Add your Twitter handle
    creator: '@readyrender',
  },

  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification (add when you have them)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },
};

export const viewport = {
  themeColor: "#3b82f6"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P73GF9SD');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P73GF9SD"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/* Initialize Sentry client-side */}
        <SentryInit />
        {/* [NEW] 包裹 AuthProvider，讓全站都能取得登入狀態 */}
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <NetworkStatusBanner />
              {children}
              {/* AI Environment Generation Loading Overlay */}
              <AiGeneratingOverlay />
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}