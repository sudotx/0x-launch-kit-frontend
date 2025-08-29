
import styled from 'styled-components';

import { ColumnNarrow } from '../common/column_narrow';
import { ColumnWide } from '../common/column_wide';
import { Content } from './common/content_wrapper';
import { BuySellContainer } from './marketplace/buy_sell';
import { OrderBookTableContainer } from './marketplace/order_book';
import { OrderHistoryContainer } from './marketplace/order_history';
import { WalletBalanceContainer } from './marketplace/wallet_balance';

const StyledContent = styled(Content)`
    gap: 16px;
`;

const StyledColumnNarrow = styled(ColumnNarrow)`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const Marketplace = () => {
    return (
        <>
            <StyledContent>
                <ColumnNarrow>
                    <WalletBalanceContainer />
                    <BuySellContainer />
                </ColumnNarrow>
                <StyledColumnNarrow>
                    <OrderBookTableContainer />
                </StyledColumnNarrow>
                <ColumnWide>
                    <OrderHistoryContainer />
                </ColumnWide>
            </StyledContent>
        </>
    )
}


export { Marketplace };
