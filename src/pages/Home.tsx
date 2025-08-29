
import { ToolbarContentContainer } from '../components/erc20/common/toolbar_content';
import { Marketplace } from '../components/erc20/marketplace';
import { GeneralLayout } from '../components/general_layout';
import { useReducerInjection } from '../hooks/useReducerInjection';
import { getThemeByMarketplace } from '../themes/theme_meta_data_utils';
import { MARKETPLACES } from '../util/types';

// Lazy import reducers
const marketReducer = () => import('../store/market/reducers').then(m => m.default);
const relayerReducer = () => import('../store/relayer/reducers').then(m => m.default);

const toolbar = <ToolbarContentContainer />;

const Home = () => {
    // Inject reducers when this page loads
    useReducerInjection('market', marketReducer);
    useReducerInjection('relayer', relayerReducer);

    const themeColor = getThemeByMarketplace(MARKETPLACES.ERC20);

    return (
        <GeneralLayout toolbar={toolbar}>
            <Marketplace />
        </GeneralLayout>
    );
};

export default Home;