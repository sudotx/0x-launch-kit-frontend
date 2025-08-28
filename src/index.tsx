// import ReactModal from 'react-modal';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'sanitize.css';

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { http, WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import App from './components/app';
import './index.css';
import { store } from './store';

import { Home, LazyNotFound } from './pages/LazyPages';
import Erc721 from './pages/erc721/Erc721';

// Loading component for Suspense fallback
const LoadingSpinner = () => (
	<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
		<div>Loading...</div>
	</div>
);

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

// ReactModal.setAppElement('#root');

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
										path="/erc721"
										element={
											<Suspense fallback={<LoadingSpinner />}>
												<Erc721 />
											</Suspense>
										}
									/>
									<Route
										path="*"
										element={
											<Suspense fallback={<LoadingSpinner />}>
												<LazyNotFound />
											</Suspense>
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
