import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useAccount, useBalance } from 'wagmi';

import { ZERO } from '../../../common/constants';
import { useErc20Store } from '../../../store';
import { lightThemeColors } from '../../../themes/default_theme';
import { isWeth } from '../../../util/known_tokens';
import { tokenAmountInUnits, tokenSymbolToDisplayString } from '../../../util/tokens';
import { ButtonVariant } from '../../../util/types';
import { Button } from '../../common/button';
import { Card } from '../../common/card';
import { IconType, Tooltip } from '../../common/tooltip';

const LabelWrapper = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
    flex-shrink: 0;
    padding: 8px 0;
`;

const Label = styled.span`
    align-items: center;
    color: ${props => props.theme.componentsTheme.textColorCommon};
    display: flex;
    flex-shrink: 0;
    font-size: 16px;
    line-height: 1.2;
`;

const Value = styled.span`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-feature-settings: 'tnum' 1;
    flex-shrink: 0;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.2;
    text-align: right;
    white-space: nowrap;
`;

const WalletStatusBadge = styled.div<{ connected?: boolean }>`
    border-radius: 50%;
    height: 8px;
    margin-right: 6px;
    width: 8px;
    background-color: ${props =>
        props.connected ? lightThemeColors.green : lightThemeColors.red};
`;

const WalletStatusTitle = styled.h3`
    color: ${props => props.theme.componentsTheme.textLight};
    font-size: 12px;
    font-weight: 500;
    line-height: 1.2;
    margin: 0;
    padding: 0;
    text-align: right;
`;

const WalletStatusContainer = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
`;

const TooltipStyled = styled(Tooltip)`
    margin-left: 10px;
`;

const ButtonStyled = styled(Button)`
    width: 100%;
`;

const getWalletName = () => 'Wallet';

const getWallet = (isConnected: boolean) => (
    <WalletStatusContainer>
        <WalletStatusBadge connected={isConnected} />
        <WalletStatusTitle>{getWalletName()}</WalletStatusTitle>
    </WalletStatusContainer>
);

const getWalletTitle = (isConnected: boolean) => {
    return isConnected ? 'Wallet Balance' : 'Connect Wallet';
};

const WalletBalance: React.FC = () => {
    const theme = useTheme();
    const { isConnected, address, isConnecting } = useAccount();
    const { data: ethBalance } = useBalance({
        address: address,
    });

    const { baseToken, currencyPair, quoteToken, tokenBalances, wethTokenBalance, ethBalance: ethBalanceFromStore } =
        useErc20Store();

    const baseTokenBalance = tokenBalances.find(tb => tb.token.address === baseToken?.address);
    const quoteTokenBalance = tokenBalances.find(tb => tb.token.address === quoteToken?.address);

    const totalEthBalance = (ethBalanceFromStore || ZERO).plus(wethTokenBalance ? wethTokenBalance.balance : ZERO);

    const getWalletContent = () => {
        if (isConnecting) {
            return <ButtonStyled variant={ButtonVariant.Tertiary}>Connecting...</ButtonStyled>;
        }

        if (!isConnected) {
            return <ConnectButton />;
        }

        if (quoteToken && baseToken && baseTokenBalance && quoteTokenBalance) {
            const quoteTokenBalanceAmount =
                isWeth(quoteToken.symbol) && totalEthBalance.gt(0) ? totalEthBalance : quoteTokenBalance.balance;

            const quoteBalanceString = tokenAmountInUnits(
                quoteTokenBalanceAmount,
                quoteToken.decimals,
                quoteToken.displayDecimals,
            );
            const baseBalanceString = tokenAmountInUnits(
                baseTokenBalance.balance,
                baseTokenBalance.token.decimals,
                baseTokenBalance.token.displayDecimals,
            );
            const toolTip = isWeth(quoteToken.symbol) ? (
                <TooltipStyled description="Showing ETH + wETH balance" iconType={IconType.Fill} />
            ) : null;
            const quoteTokenLabel = isWeth(quoteToken.symbol) ? 'ETH' : tokenSymbolToDisplayString(currencyPair.quote);
            return (
                <>
                    <LabelWrapper>
                        <Label>{tokenSymbolToDisplayString(currencyPair.base)}</Label>
                        <Value>{baseBalanceString}</Value>
                    </LabelWrapper>
                    <LabelWrapper>
                        <Label>
                            {quoteTokenLabel}
                            {toolTip}
                        </Label>
                        <Value>{quoteBalanceString}</Value>
                    </LabelWrapper>
                </>
            );
        }

        return null;
    };

    return (
        <Card title={getWalletTitle(isConnected)} action={getWallet(isConnected)} minHeightBody={'0px'}>
            {getWalletContent()}
        </Card>
    );
};

const WalletBalanceContainer = React.memo(WalletBalance);

export { WalletBalance, WalletBalanceContainer };
