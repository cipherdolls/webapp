import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { AlertDialogProvider } from './providers/AlertDialogProvider';
import { QueryProvider } from './providers/QueryProvider';
import type { Route } from './+types/root';
import './app.css';
import { CustomToaster } from './components/ui/toast';


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
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <CustomToaster />
        <QueryProvider>
          <AlertDialogProvider>{children}</AlertDialogProvider>
        </QueryProvider>
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
