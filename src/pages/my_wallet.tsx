import styled from 'styled-components';

import { ColumnNarrow } from '../components/common/column_narrow';
import { ColumnWide } from '../components/common/column_wide';
import { Content } from '../components/erc20/common/content_wrapper';
import { WalletTokenBalancesContainer } from '../components/wallet_token_balances';
import { WalletWethBalanceContainer } from '../components/wallet_weth_balance';

const ColumnWideMyWallet = styled(ColumnWide)`
    margin-left: 0;
    &:last-child {
        margin-left: 0;
    }
`;

export const MyWallet = () => (
    <Content>
        <ColumnNarrow>
            <WalletWethBalanceContainer />
        </ColumnNarrow>
        <ColumnWideMyWallet>
            <WalletTokenBalancesContainer />
        </ColumnWideMyWallet>
    </Content>
);
