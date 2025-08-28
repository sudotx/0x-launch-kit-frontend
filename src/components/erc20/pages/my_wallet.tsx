import styled from 'styled-components';

// import { WalletTokenBalancesContainer, WalletWethBalanceContainer } from '../../account';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ColumnNarrow } from '../../common/column_narrow';
import { ColumnWide } from '../../common/column_wide';
import { Content } from '../common/content_wrapper';

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
