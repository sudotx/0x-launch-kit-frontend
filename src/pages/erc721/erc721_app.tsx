import { Route, Routes } from 'react-router';
import styled, { ThemeProvider } from 'styled-components';

import { ERC721_APP_BASE_PATH } from '../../common/constants';
import { getThemeByMarketplace } from '../../themes/theme_meta_data_utils';
import { MARKETPLACES } from '../../util/types';
import { AdBlockDetector } from '../../components/common/adblock_detector';
import { CheckMetamaskStateModalContainer } from '../../components/common/check_metamask_state_modal_container';
import { GeneralLayout } from '../../components/general_layout';

import { CollectibleSellModal } from '../../components/erc721/collectibles/collectible_sell_modal';
import { ToolbarContentContainer } from '../../components/erc721/common/toolbar_content';
import { AllCollectibles } from './all_collectibles';
import { IndividualCollectible } from './individual_collectible';
import { ListCollectibles } from './list_collectibles';
import { MyCollectibles } from './my_collectibles';

const toolbar = <ToolbarContentContainer />;

const GeneralLayoutERC721 = styled(GeneralLayout)`
    background-color: ${props => props.theme.componentsTheme.backgroundERC721};
`;

export const Erc721App = () => {
    const themeColor = getThemeByMarketplace(MARKETPLACES.ERC721);
    return (
        <ThemeProvider theme={themeColor}>
            <GeneralLayoutERC721 toolbar={toolbar}>
                <AdBlockDetector />
                <CollectibleSellModal />
                <CheckMetamaskStateModalContainer
                    onConnectWallet={() => { }}
                    onGoToHome={() => { }}
                />
                <Routes>
                    <Route path={`${ERC721_APP_BASE_PATH}/`} element={<AllCollectibles />} />
                    <Route path={`${ERC721_APP_BASE_PATH}/my-collectibles`} element={<MyCollectibles />} />
                    <Route
                        path={`${ERC721_APP_BASE_PATH}/list-collectibles`}
                        element={<ListCollectibles />}
                    />
                    {/* <Route path={`${ERC721_APP_BASE_PATH}/collectible/:id`}>
                        {({ match }) => match && <IndividualCollectible collectibleId={match.params.id} />}
                    </Route> */}
                </Routes>
            </GeneralLayoutERC721>
        </ThemeProvider>
    );
};
