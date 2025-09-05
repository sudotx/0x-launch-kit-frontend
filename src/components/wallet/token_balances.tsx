import { BigNumber } from '@0x/utils';
import React from 'react';
import styled from 'styled-components';
import { useAccount, useBalance } from 'wagmi';


import { useErc20Store } from '../../store';
import { tokenAmountInUnits, tokenSymbolToDisplayString } from '../../util/tokens';
import { TokenBalance } from '../../util/types';
import { Card } from '../common/card';
import { EmptyContent } from '../common/empty_content';
import { TokenIcon } from '../common/icons/token_icon';
import { LoadingWrapper } from '../common/loading';
import { CustomTD, Table, THead, TH, TR } from '../common/table';

const TokenIconStyled = styled(TokenIcon)``;

const TokenIconAndSymbol = styled.div`
    display: flex;
    align-items: center;
`;

const TokenSymbol = styled.span`
    margin-left: 10px;
`;

const WalletTokenBalances: React.FC = () => {
    const { tokenBalances } = useErc20Store();
    const { address, isConnected, isConnecting } = useAccount();
    const { data: ethBalanceData, isLoading: isLoadingEthBalance } = useBalance({ address });

    const ethBalance = ethBalanceData ? new BigNumber(ethBalanceData.value.toString()) : new BigNumber(0);

    const allBalances: (TokenBalance & { isEth?: boolean })[] = [
        {
            token: {
                address: '',
                symbol: 'ETH',
                name: 'Ether',
                decimals: 18,
                displayDecimals: 4,
                primaryColor: "blue"
            },
            balance: ethBalance,
            isUnlocked: true,
            isEth: true,
        },
        ...tokenBalances,
    ];

    const tokenToRow = (tokenBalance: TokenBalance & { isEth?: boolean }, index: number) => {
        const { token, balance } = tokenBalance;
        const amount = tokenAmountInUnits(balance, token.decimals, token.displayDecimals);

        return (
            <TR key={index}>
                <CustomTD>
                    <TokenIconAndSymbol>
                        {/* <TokenIconStyled symbol={token.symbol} primaryColor={token.primaryColor} icon={token.icon} /> */}
                        <TokenSymbol>{tokenSymbolToDisplayString(token.symbol)}</TokenSymbol>
                    </TokenIconAndSymbol>
                </CustomTD>
                <CustomTD styles={{ textAlign: 'right', tabular: true }}>{amount}</CustomTD>
            </TR>
        );
    };

    let content;
    if (isConnecting || isLoadingEthBalance) {
        content = <LoadingWrapper />;
    } else if (!isConnected) {
        content = <EmptyContent alignAbsoluteCenter={true} text="Connect your wallet to see your balances" />;
    } else {
        content = (
            <Table>
                <THead>
                    <TR>
                        <TH>Token</TH>
                        <TH styles={{ textAlign: 'right' }}>Balance</TH>
                    </TR>
                </THead>
                <tbody>{allBalances.map(tokenToRow)}</tbody>
            </Table>
        );
    }

    return <Card title="Token Balances">{content}</Card>;
};

export const WalletTokenBalancesContainer = React.memo(WalletTokenBalances);