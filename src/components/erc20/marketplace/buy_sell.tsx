import React from 'react';
import styled from 'styled-components';

import { ZERO } from '../../../common/constants';
import { getKnownTokens } from '../../../util/known_tokens';
import { tokenSymbolToDisplayString } from '../../../util/tokens';
import {
    ButtonIcons,
    ButtonVariant,
    OrderSide,
    OrderType
} from '../../../util/types';
import { BigNumberInput } from '../../common/big_number_input';
import { Button } from '../../common/button';
import { CardBase } from '../../common/card_base';
import { CardTabSelector } from '../../common/card_tab_selector';
import { ErrorCard, ErrorIcons, FontSize } from '../../common/error_card';

import { useBuySellForm } from '../../../hooks/useBuySellForm';
import { useErc20Store } from '../../../store';
import { themeDimensions } from '../../../themes/commons';
import { lightThemeColors } from '../../../themes/default_theme';
import { OrderDetailsContainer } from './order_details';

const BuySellWrapper = styled(CardBase)`
    margin-bottom: ${themeDimensions.verticalSeparationSm};
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px ${themeDimensions.horizontalPadding};
`;

const TabsContainer = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
`;

const LabelContainer = styled.div`
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
`;

const Label = styled.label<{ color?: string }>`
    color: ${props => props.color || lightThemeColors.textColorCommon};
    font-size: 14px;
    font-weight: 500;
    line-height: normal;
    margin: 0;
`;

const InnerTabs = styled(CardTabSelector)`
    font-size: 14px;
`;

const FieldContainer = styled.div`
    height: ${themeDimensions.fieldHeight};
    margin-bottom: 25px;
    position: relative;
`;

const BigInputNumberStyled = styled<any>(BigNumberInput)`
    background-color: ${lightThemeColors.textInputBackgroundColor};
    border-radius: ${themeDimensions.borderRadius};
    border: 1px solid ${lightThemeColors.textInputBorderColor};;
    color: ${lightThemeColors.textInputTextColor};
    font-feature-settings: 'tnum' 1;
    font-size: 16px;
    height: 100%;
    padding-left: 14px;
    padding-right: 60px;
    position: absolute;
    width: 100%;
    z-index: 1;
`;

const TokenContainer = styled.div`
    display: flex;
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 12;
`;

const TokenText = styled.span`
    color: ${lightThemeColors.textInputTextColor};
    font-size: 14px;
    font-weight: normal;
    line-height: 21px;
    text-align: right;
`;

const BigInputNumberTokenLabel: React.FC<{ tokenSymbol: string }> = ({ tokenSymbol }) => (
    <TokenContainer>
        <TokenText>{tokenSymbolToDisplayString(tokenSymbol)}</TokenText>
    </TokenContainer>
);

const TIMEOUT_BTN_ERROR = 2000;
const TIMEOUT_CARD_ERROR = 4000;

const BuySell: React.FC = () => {
    const { web3State, currencyPair, orderPriceSelected } = useErc20Store();
    const {
        makerAmount,
        orderType,
        price,
        tab,
        error,
        isFormInvalid,
        setMakerAmount,
        setOrderType,
        setPrice,
        setTab,
        submitOrder,
    } = useBuySellForm({ currencyPair });

    const TabButton = styled.div<{ side: OrderSide, isSelected: boolean }>`
        align-items: center;
        background-color: ${props => props.isSelected ? 'transparent' : lightThemeColors.inactiveTabBackgroundColor};
        border-bottom-color: black;
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-right-style: solid;
        border-right-width: 1px;
        border-right-color: ${props => (props.isSelected ? lightThemeColors.cardBorderColor : 'transparent')};
        color: ${props =>
            props.isSelected
                ? props.side === OrderSide.Buy
                    ? lightThemeColors.green
                    : lightThemeColors.red
                : lightThemeColors.textLight}
        cursor: ${props => (props.isSelected ? 'default' : 'pointer')};
        display: flex;
        font-weight: 600;
        height: 47px;
        justify-content: center;
        width: 50%;

        &:first-child {
            border-top-left-radius: ${themeDimensions.borderRadius};
        }

        &:last-child {
            border-left-color: ${props => (props.isSelected ? lightThemeColors.cardBorderColor : 'transparent')};
            border-left-style: solid;
            border-left-width: 1px;
            border-right: none;
            border-top-right-radius: ${themeDimensions.borderRadius};
        }
    `;

    const buySellInnerTabs = [
        {
            active: orderType === OrderType.Market,
            onClick: () => setOrderType(OrderType.Market),
            text: 'Market',
        },
        {
            active: orderType === OrderType.Limit,
            onClick: () => setOrderType(OrderType.Limit),
            text: 'Limit',
        },
    ];

    const btnPrefix = tab === OrderSide.Buy ? 'Buy ' : 'Sell ';
    const btnText = error.btnMsg ? 'Error' : btnPrefix + tokenSymbolToDisplayString(currencyPair.base);

    const decimals = getKnownTokens().getTokenBySymbol(currencyPair.base).decimals;

    return (
        <>
            <BuySellWrapper>
                <TabsContainer>
                    <TabButton onClick={() => setTab(OrderSide.Buy)} side={OrderSide.Buy} isSelected={tab === OrderSide.Buy}>
                        Buy
                    </TabButton>
                    <TabButton onClick={() => setTab(OrderSide.Sell)} side={OrderSide.Sell} isSelected={tab === OrderSide.Sell}>
                        Sell
                    </TabButton>
                </TabsContainer>
                <Content>
                    <LabelContainer>
                        <Label>Amount</Label>
                        <InnerTabs tabs={buySellInnerTabs} />
                    </LabelContainer>
                    <FieldContainer>
                        <BigInputNumberStyled
                            decimals={decimals}
                            min={ZERO}
                            onChange={setMakerAmount}
                            value={makerAmount}
                            placeholder={'0.00'}
                        />
                        <BigInputNumberTokenLabel tokenSymbol={currencyPair.base} />
                    </FieldContainer>
                    {orderType === OrderType.Limit && (
                        <>
                            <LabelContainer>
                                <Label>Price per token</Label>
                            </LabelContainer>
                            <FieldContainer>
                                <BigInputNumberStyled
                                    decimals={0}
                                    min={ZERO}
                                    onChange={setPrice}
                                    value={price}
                                    placeholder={'0.00'}
                                />
                                <BigInputNumberTokenLabel tokenSymbol={currencyPair.quote} />
                            </FieldContainer>
                        </>
                    )}
                    <OrderDetailsContainer
                        orderType={orderType}
                        orderSide={tab}
                        tokenAmount={makerAmount || ZERO}
                        tokenPrice={price || ZERO}
                        currencyPair={currencyPair}
                    />
                    <Button
                        disabled={isFormInvalid}
                        icon={error.btnMsg ? ButtonIcons.Warning : undefined}
                        onClick={submitOrder}
                        variant={
                            error.btnMsg
                                ? ButtonVariant.Error
                                : tab === OrderSide.Buy
                                    ? ButtonVariant.Buy
                                    : ButtonVariant.Sell
                        }
                    >
                        {btnText}
                    </Button>
                </Content>
            </BuySellWrapper>
            {error.cardMsg ? <ErrorCard fontSize={FontSize.Large} text={error.cardMsg} icon={ErrorIcons.Sad} /> : null}
        </>
    );
};

const BuySellContainer = React.memo(BuySell);

export { BuySell, BuySellContainer };
