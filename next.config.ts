import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from '@sentry/nextjs';

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development"
});

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Removed output: 'export' to support dynamic routes
  // Will use Firebase Hosting with Cloud Functions for SSR

  // Turbopack configuration (empty to silence warning)
  turbopack: {},

  images: {
    unoptimized: false, // Enable optimization
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        pathname: '/**',
      },
    ],
  },

  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://apis.google.com https://unpkg.com",
              "script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.gstatic.com https://apis.google.com https://unpkg.com",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' blob: data: https://firebasestorage.googleapis.com https://*.googleusercontent.com https://replicate.delivery",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' blob: https://cdn.jsdelivr.net https://*.googleapis.com https://*.firebaseio.com https://firebasestorage.googleapis.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://raw.githack.com https://raw.githubusercontent.com https://*.sentry.io https://replicate.delivery https://unpkg.com",
              "media-src 'self' blob: https://firebasestorage.googleapis.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://*.google.com",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          // {
          //   key: 'Cross-Origin-Embedder-Policy',
          //   value: 'credentialless'
          // },
          // {
          //   key: 'Cross-Origin-Opener-Policy',
          //   value: 'same-origin-allow-popups'
          // },
          // Strict Transport Security (HTTPS only)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
};

// Wrap with PWA first
const configWithPWA = withPWA(nextConfig);

// Wrap with Sentry for error tracking
// @ts-ignore - Sentry types may not match exactly
export default withSentryConfig(configWithPWA);
