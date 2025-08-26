import { Route, Routes } from 'react-router';
import { ThemeProvider } from 'styled-components';

import { ERC20_APP_BASE_PATH } from '../../common/constants';
import { AdBlockDetector } from '../../components/common/adblock_detector';
import { GeneralLayout } from '../../components/general_layout';
import { getThemeByMarketplace } from '../../themes/theme_meta_data_utils';
import { MARKETPLACES } from '../../util/types';

import { ToolbarContentContainer } from './common/toolbar_content';
import { Marketplace } from './pages/marketplace';
import { MyWallet } from './pages/my_wallet';

const toolbar = <ToolbarContentContainer />;

export const Erc20App = () => {
    const themeColor = getThemeByMarketplace(MARKETPLACES.ERC20);

    return (
        <ThemeProvider theme={themeColor}>
            <GeneralLayout toolbar={toolbar}>
                <AdBlockDetector />
                <Routes>
                    <Route path={`${ERC20_APP_BASE_PATH}/`} element={<Marketplace/>} />
                    <Route path={`${ERC20_APP_BASE_PATH}/my-wallet`} element={<MyWallet/>} />
                </Routes>
            </GeneralLayout>
        </ThemeProvider>
    );
};
