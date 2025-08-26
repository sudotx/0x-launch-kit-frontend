import ReactModal from 'react-modal';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'sanitize.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ERC20_APP_BASE_PATH, ERC721_APP_BASE_PATH, LOGGER_ID } from './common/constants';
import { AppContainer } from './components/app';
import { Erc20App } from './components/erc20/erc20_app';
import { Erc721App } from './components/erc721/erc721_app';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { store } from './store';

// ReactModal.setAppElement('#root');

if (['development', 'production'].includes(process.env.NODE_ENV) && !window.localStorage.debug) {
	// Log only the app constant id to the console
	window.localStorage.debug = `${LOGGER_ID}*`;
}

function Home() {
	return (
		<div>
			<h1>Hello</h1>
		</div>
	)
}

function Web3WrappedApp() {
	return (
		<Provider store={store}>
			<BrowserRouter>
				<AppContainer>
					<Routes>
						<Route path={ERC20_APP_BASE_PATH} element={<Erc20App />} />
						<Route path={ERC721_APP_BASE_PATH} element={<Erc721App />} />
						<Route path="/" element={<Home />} />
					</Routes>
				</AppContainer>
			</BrowserRouter>
		</Provider>
	)
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Web3WrappedApp />
	</StrictMode>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
