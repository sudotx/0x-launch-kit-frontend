import React from 'react';
import styled from 'styled-components';

import { ColumnNarrow } from './common/column_narrow';
import { ColumnWide } from './common/column_wide';
import { Content } from './erc20/common/content_wrapper';
import { BuySellContainer } from './erc20/marketplace/buy_sell';
import { OrderBookTableContainer } from './erc20/marketplace/order_book';
import { OrderHistoryContainer } from './erc20/marketplace/order_history';
import { WalletBalanceContainer } from './erc20/marketplace/wallet_balance';

const StyledContent = styled(Content)`
    gap: 16px;
`;

const StyledColumnNarrow = styled(ColumnNarrow)`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ErcMarketplace20 = () => {
    return (
        <>
            <StyledContent>
                <StyledColumnNarrow>
                    <WalletBalanceContainer />
                    <BuySellContainer />
                </StyledColumnNarrow>
                <ColumnNarrow>
                    <OrderBookTableContainer />
                </ColumnNarrow>
                <ColumnWide>
                    <OrderHistoryContainer />
                </ColumnWide>
            </StyledContent>
        </>
    );
};

export default ErcMarketplace20;
