import "@rainbow-me/rainbowkit/styles.css";
import 'sanitize.css';
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ReactModal from 'react-modal';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";

import { store } from './store';

import { Home, MyWallet, NotFound } from './pages';

import App from './app';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000,
			gcTime: 1_000 * 60 * 60 * 24,
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

function Web3WrappedApp() {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider>
					<Provider store={store}>
						<BrowserRouter>
							<App>
								<Routes>
									<Route path="/" element={<Home />} />
									<Route
										path="/mywallet"
										element={
											<MyWallet />
										}
									/>
									<Route
										path="*"
										element={
											<NotFound />
										}
									/>
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
