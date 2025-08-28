
// import { ThemeProvider } from 'styled-components';
import { Logo } from '../components/common/logo';
import { ToolbarContainer as Toolbar } from '../components/common/toolbar';
import { Marketplace } from '../components/erc20/pages/marketplace';
import { GeneralLayout } from '../components/general_layout';
import { useReducerInjection } from '../hooks/useReducerInjection';
import { getThemeByMarketplace } from '../themes/theme_meta_data_utils';
import { MARKETPLACES } from '../util/types';
import { AdBlockDetector } from '../components/common/adblock_detector';

// Lazy import reducers
const marketReducer = () => import('../store/market/reducers').then(m => m.default);
const relayerReducer = () => import('../store/relayer/reducers').then(m => m.default);

const Home = () => {
    // Inject reducers when this page loads
    useReducerInjection('market', marketReducer);
    useReducerInjection('relayer', relayerReducer);

    // const themeColor = getThemeByMarketplace(MARKETPLACES.ERC20)

    return (
        <GeneralLayout toolbar={<Toolbar logo={<Logo image={<div>🚀</div>} text="Exchange" onClick={() => { }} />} />}>
            <Marketplace />
        </GeneralLayout>
    );
};

export default Home;
