import type { AppProps } from 'next/app';

import 'xeltica-ui/dist/css/xeltica-ui.min.css';
import '@/styles/global.css';

function MyApp({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}

export default MyApp;
