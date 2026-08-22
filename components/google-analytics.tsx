'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, Suspense } from 'react';

const GA_MEASUREMENT_ID = 'G-J0BVRRSBTG';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

function GAPageViewTracker({ isAdminOrDriver }: { isAdminOrDriver: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isAdminOrDriver) return;
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, isAdminOrDriver]);

  return null;
}

export function GoogleAnalytics() {
  const pathname = usePathname();

  // Exclude admin and partner/driver pages
  const isAdminOrDriver =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/driver-app') ||
    (typeof window !== 'undefined' && window.location.hostname.includes('partner'));

  if (isAdminOrDriver) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <Suspense fallback={null}>
        <GAPageViewTracker isAdminOrDriver={isAdminOrDriver} />
      </Suspense>
    </>
  );
}
