import { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps, router }: AppProps) {
  // Handle redirection for static admin routes
  if (router.pathname === '/admin') {
    return (
      <>
        <Head>
          <meta httpEquiv="refresh" content="0;url=/tables-basic.html" />
        </Head>
        <div>
          <p>Redirecting to admin panel...</p>
        </div>
      </>
    );
  }

  return <Component {...pageProps} />;
}

export default MyApp; 