import { lazy } from 'react';

// Lazy load heavy pages
export const LazyErc721 = lazy(() => import('./erc721/Erc721'));
export const LazyNotFound = lazy(() => import('./NotFound'));

// Home can stay non-lazy since it's the landing page
export { default as Home } from './Home';
