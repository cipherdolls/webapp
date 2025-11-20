import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { AlertDialogProvider } from './providers/AlertDialogProvider';
import { QueryProvider } from './providers/QueryProvider';
import type { Route } from './+types/root';
import './app.css';
import { CustomToaster } from './components/ui/toast';
import { LoginModalProvider } from './context/login-modal-context';

export function meta() {
  return [
    { charset: 'utf-8' },
    { title: 'CipherDolls - Where Privacy Meets Anonymous AI Chat' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    {
      name: 'description',
      content:
        'Chat with AI avatars without compromising your privacy. Completely anonymous, no personal data collected. Pay only for what you use with LOV tokens. No subscriptions.',
    },
    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'CipherDolls - Where Privacy Meets Anonymous AI Chat' },
    {
      property: 'og:description',
      content:
        'Chat with avatars without compromising your privacy. Completely anonymous AI chat platform. Pay per message with LOV tokens. No personal data, no subscriptions.',
    },
    { property: 'og:image', content: 'https://cipherdolls.com/logo.svg' },
    { property: 'og:url', content: 'https://cipherdolls.com' },
    { property: 'og:site_name', content: 'CipherDolls' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'CipherDolls - Privacy-First Anonymous AI Chat' },
    {
      name: 'twitter:description',
      content:
        'Chat with AI avatars without compromising your privacy. Completely anonymous, pay per message with LOV tokens. No personal data collected.',
    },
    { name: 'twitter:image', content: 'https://cipherdolls.com/logo.svg' },
  ];
}

export const links: Route.LinksFunction = () => [
  {
    rel: 'preload',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    as: 'style',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    crossOrigin: 'anonymous',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className='scroll-smooth'>
      <head>
        <Meta />
        <Links />
        <meta name='viewport' content='width=device-width, initial-scale=1.0'/>
      </head>
      <body>
        <CustomToaster />
        <LoginModalProvider>
          <QueryProvider>
            <AlertDialogProvider>{children}</AlertDialogProvider>
          </QueryProvider>
        </LoginModalProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className='pt-16 p-4 container mx-auto'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className='w-full p-4 overflow-x-auto'>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
