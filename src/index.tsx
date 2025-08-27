import ReactModal from 'react-modal';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'sanitize.css';

import { ConnectButton, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { http, WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ERC20_APP_BASE_PATH, ERC721_APP_BASE_PATH, LOGGER_ID } from './common/constants';
import App from './components/app';
import { Erc20App } from './components/erc20/erc20_app';
import { Erc721App } from './components/erc721/erc721_app';
import './index.css';
import { store } from './store';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000, // 30 seconds for DeFi data
			gcTime: 1_000 * 60 * 60 * 24, // 24 hours
			networkMode: 'offlineFirst',
			refetchOnWindowFocus: false,
			retry: 0,
		},
		mutations: { networkMode: 'offlineFirst' },
	}
});


export const config = getDefaultConfig({
	appName: "Exchange",
	projectId: process.env.PROJECT_ID || "8X1df9Wbcqj6A7LWG71Ra5yLYj-1eL7y",
	chains: [sepolia],
	transports: {
		[sepolia.id]: http(),
	}
});

ReactModal.setAppElement('#root');

if (['development', 'production'].includes(process.env.NODE_ENV || 'development') && !window.localStorage.debug) {
	// Log only the app constant id to the console
	window.localStorage.debug = `${LOGGER_ID}*`;
}

function Home() {
	return (
		<div>
			<ConnectButton />
			<h1>Hello Exchange</h1>
		</div>
	)
}


function Web3WrappedApp() {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider>
					<Provider store={store}>
						<BrowserRouter>
							<App>
								<Routes>
									<Route path={ERC20_APP_BASE_PATH} element={<Erc20App />} />
									<Route path={ERC721_APP_BASE_PATH} element={<Erc721App />} />
									<Route path="/" element={<Home />} />
								</Routes>
							</App>
						</BrowserRouter>
					</Provider>
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	)
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Web3WrappedApp />
	</StrictMode>
)
