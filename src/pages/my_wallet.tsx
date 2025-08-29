import styled from 'styled-components';

// import { WalletTokenBalancesContainer, WalletWethBalanceContainer } from '../../account';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ColumnNarrow } from '../components/common/column_narrow';
import { ColumnWide } from '../components/common/column_wide';
import { Content } from '../components/erc20/common/content_wrapper';

const ColumnWideMyWallet = styled(ColumnWide)`
    margin-left: 0;

    &:last-child {
        margin-left: 0;
    }
`;

export const MyWallet = () => (
    // <Content>
    //     <ConnectButton />
    //     <ColumnNarrow>
    //         <WalletWethBalanceContainer />
    //     </ColumnNarrow>
    //     <ColumnWideMyWallet>
    //         <WalletTokenBalancesContainer />
    //     </ColumnWideMyWallet>
    // </Content>
    <div>
        hello
    </div>
);
