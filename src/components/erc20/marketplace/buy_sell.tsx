import { BigNumber } from '@0x/utils';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { ZERO } from '../../../common/constants';
import { AppDispatch } from '../../../store';
import { initWallet, startBuySellLimitSteps, startBuySellMarketSteps } from '../../../store/actions';
import { fetchTakerAndMakerFee } from '../../../store/relayer/actions';
import { getCurrencyPair, getOrderPriceSelected, getWeb3State } from '../../../store/selectors';
import { themeDimensions } from '../../../themes/commons';
import { getKnownTokens } from '../../../util/known_tokens';
import { tokenSymbolToDisplayString } from '../../../util/tokens';
import {
    ButtonIcons,
    ButtonVariant,
    CurrencyPair,
    OrderFeeData,
    OrderSide,
    OrderType,
    Web3State,
} from '../../../util/types';
import { BigNumberInput } from '../../common/big_number_input';
import { Button } from '../../common/button';
import { CardBase } from '../../common/card_base';
import { CardTabSelector } from '../../common/card_tab_selector';
import { ErrorCard, ErrorIcons, FontSize } from '../../common/error_card';

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

const TabButton = styled.div<{ isSelected: boolean; side: OrderSide }>`
    align-items: center;
    background-color: ${props =>
        props.isSelected ? 'transparent' : props.theme.componentsTheme.inactiveTabBackgroundColor};
    border-bottom-color: ${props => (props.isSelected ? 'transparent' : props.theme.componentsTheme.cardBorderColor)};
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-right-color: ${props => (props.isSelected ? props.theme.componentsTheme.cardBorderColor : 'transparent')};
    border-right-style: solid;
    border-right-width: 1px;
    color: ${props =>
        props.isSelected
            ? props.side === OrderSide.Buy
                ? props.theme.componentsTheme.green
                : props.theme.componentsTheme.red
            : props.theme.componentsTheme.textLight};
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
        border-left-color: ${props => (props.isSelected ? props.theme.componentsTheme.cardBorderColor : 'transparent')};
        border-left-style: solid;
        border-left-width: 1px;
        border-right: none;
        border-top-right-radius: ${themeDimensions.borderRadius};
    }
`;

const LabelContainer = styled.div`
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
`;

const Label = styled.label<{ color?: string }>`
    color: ${props => props.color || props.theme.componentsTheme.textColorCommon};
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
    background-color: ${props => props.theme.componentsTheme.textInputBackgroundColor};
    border-radius: ${themeDimensions.borderRadius};
    border: 1px solid ${props => props.theme.componentsTheme.textInputBorderColor};
    color: ${props => props.theme.componentsTheme.textInputTextColor};
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
    color: ${props => props.theme.componentsTheme.textInputTextColor};
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
    const [makerAmount, setMakerAmount] = useState<BigNumber | null>(null);
    const [orderType, setOrderType] = useState<OrderType>(OrderType.Market);
    const [price, setPrice] = useState<BigNumber | null>(null);
    const [tab, setTab] = useState<OrderSide>(OrderSide.Buy);
    const [error, setError] = useState<{ btnMsg: string | null; cardMsg: string | null }>({ btnMsg: null, cardMsg: null });

    const dispatch = useDispatch<AppDispatch>();
    const web3State = useSelector(getWeb3State);
    const currencyPair = useSelector(getCurrencyPair);
    const orderPriceSelected = useSelector(getOrderPriceSelected);

    useEffect(() => {
        if (orderPriceSelected && orderType === OrderType.Limit) {
            setPrice(orderPriceSelected);
        }
    }, [orderPriceSelected, orderType]);

    const reset = () => {
        setMakerAmount(null);
        setPrice(null);
    };

    const submit = async () => {
        const orderSide = tab;
        const amount = makerAmount || ZERO;
        const priceValue = price || ZERO;

        const orderFeeData = await dispatch(
            fetchTakerAndMakerFee({ amount, price: priceValue, side: tab }),
        ).unwrap();

        if (orderType === OrderType.Limit) {
            await dispatch(
                startBuySellLimitSteps({ amount, price: priceValue, side: orderSide, orderFeeData }),
            ).unwrap();
        } else {
            try {
                await dispatch(
                    startBuySellMarketSteps({ amount, side: orderSide, orderFeeData }),
                ).unwrap();
            } catch (e: any) {
                setError({ btnMsg: 'Error', cardMsg: e.message });
                setTimeout(() => setError(prev => ({ ...prev, btnMsg: null })), TIMEOUT_BTN_ERROR);
                setTimeout(() => setError(prev => ({ ...prev, cardMsg: null })), TIMEOUT_CARD_ERROR);
            }
        }
        reset();
    };

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

    const isMakerAmountEmpty = makerAmount === null || makerAmount.isZero();
    const isPriceEmpty = price === null || price.isZero();
    const orderTypeLimitIsEmpty = orderType === OrderType.Limit && (isMakerAmountEmpty || isPriceEmpty);
    const orderTypeMarketIsEmpty = orderType === OrderType.Market && isMakerAmountEmpty;

    const btnPrefix = tab === OrderSide.Buy ? 'Buy ' : 'Sell ';
    const btnText = error.btnMsg ? 'Error' : btnPrefix + tokenSymbolToDisplayString(currencyPair.base);

    const decimals = getKnownTokens().getTokenBySymbol(currencyPair.base).decimals;

    return (
        <>
            <BuySellWrapper>
                <TabsContainer>
                    <TabButton isSelected={tab === OrderSide.Buy} onClick={() => setTab(OrderSide.Buy)} side={OrderSide.Buy}>
                        Buy
                    </TabButton>
                    <TabButton isSelected={tab === OrderSide.Sell} onClick={() => setTab(OrderSide.Sell)} side={OrderSide.Sell}>
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
                        disabled={web3State !== Web3State.Done || orderTypeLimitIsEmpty || orderTypeMarketIsEmpty}
                        icon={error.btnMsg ? ButtonIcons.Warning : undefined}
                        onClick={submit}
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
