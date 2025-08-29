import { ThemeProvider } from 'styled-components';

import { ColumnNarrow } from '../components/common/column_narrow';
import { ColumnWide } from '../components/common/column_wide';
import { GeneralLayout } from '../components/general_layout';
import { Content } from '../components/erc20/common/content_wrapper';
import { ToolbarContentContainer } from '../components/erc20/common/toolbar_content';
import { BuySellContainer } from '../components/erc20/marketplace/buy_sell';
import { OrderBookTableContainer } from '../components/erc20/marketplace/order_book';
import { OrderHistoryContainer } from '../components/erc20/marketplace/order_history';
import { WalletBalanceContainer } from '../components/erc20/marketplace/wallet_balance';
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
            <Content>
                <ColumnNarrow>
                    <WalletBalanceContainer />
                    <BuySellContainer />
                </ColumnNarrow>
                <ColumnNarrow>
                    <OrderBookTableContainer />
                </ColumnNarrow>
                <ColumnWide>
                    <OrderHistoryContainer />
                </ColumnWide>
            </Content>
        </GeneralLayout>
        // <ThemeProvider theme={themeColor}>
        //     <GeneralLayout toolbar={toolbar}>
        //         <ErcMarketplace20 />
        //     </GeneralLayout>
        // </ThemeProvider>
    );
};

export default Home;