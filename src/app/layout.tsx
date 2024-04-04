import { GoogleAnalytics } from '@next/third-parties/google';

import { type Metadata, type Viewport } from 'next';

import themeInitializer from './theme-initializer';
import './globals.css';

const title = 'JS Playground';
const description = 'A no-fuss JavaScript playground with instant feedback';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.jsplayground.dev'),
  title: `${title} — ${description}`,
  description,
  keywords: [
    'js',
    'javascript',
    'js playground',
    'javascript playground',
    'javascript repl',
  ],
  alternates: {
    canonical: '/',
  },
  icons: '/logo.svg',
  openGraph: {
    title,
    description,
    url: '/',
    siteName: title,
    type: 'website',
    images: '',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: '/social-1024x512.png',
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full min-h-full" lang="en" suppressHydrationWarning>
      <body className="h-full child-[*]:h-full">
        <script
          dangerouslySetInnerHTML={{
            __html: `(${themeInitializer.toString()})()`,
          }}
        />

        {/* This was once shown but let's keep it in the document in case SEO engines still parse it */}
        <section className="hidden">
          <h2>What is JSPlayground.dev?</h2>

          <p>
            It is a web application that provides a minimal and fast{' '}
            <span>JavaScript playground</span> for free. You can think of it as
            a tiny editor for you to quickly test any JavaScript supported by
            your browser. It works pretty much as a{' '}
            <abbr title="Read-eval-print loop">REPL</abbr>, where you are given
            instant feedback on the <span>Console</span> screen as you change
            your code. This makes it ideal for quick prototyping and
            experimentation without needing to launch another tool for the job.
          </p>
        </section>

        {children}

        <GoogleAnalytics gaId="G-HCSQCJFEZL" />
      </body>
    </html>
  );
}
