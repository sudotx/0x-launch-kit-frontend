import { useEffect } from 'react';
import { Erc721App } from './erc721_app';
import { useReducerInjection } from '../../hooks/useReducerInjection';

// Lazy import reducers
const collectiblesReducer = () => import('../../store/collectibles/reducers').then(m => m.default);

const Erc721 = () => {
    // Inject reducers when this page loads
    useReducerInjection('collectibles', collectiblesReducer);

    return <Erc721App />;
};

export default Erc721;