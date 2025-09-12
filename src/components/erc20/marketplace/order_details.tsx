import { BigNumber, NULL_BYTES } from '@0x/utils';
import { Web3Wrapper } from '@0x/web3-wrapper';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { ZERO } from '../../../common/constants';
import { useErc20Store } from '../../../store';
import { lightThemeColors } from '../../../themes/default_theme';
import { getKnownTokens } from '../../../util/known_tokens';
import { buildMarketOrders, sumTakerAssetFillableOrders } from '../../../util/orders';
import { tokenAmountInUnits, tokenSymbolToDisplayString } from '../../../util/tokens';
import { CurrencyPair, OrderSide, OrderType } from '../../../util/types';

const Row = styled.div`
    align-items: center;
    border-top: dashed 1px ${lightThemeColors.borderColor};
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    position: relative;
    z-index: 1;

    &:last-of-type {
        margin-bottom: 20px;
    }
`;

const Value = styled.div`
    color: ${lightThemeColors.textColorCommon};
    flex-shrink: 0;
    font-feature-settings: 'tnum' 1;
    font-size: 14px;
    line-height: 1.2;
    white-space: nowrap;
`;

const CostValue = styled(Value)`
    font-feature-settings: 'tnum' 1;
    font-weight: bold;
`;

const LabelContainer = styled.div`
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    margin: 5px 0 10px 0;
`;

const Label = styled.label<{ color?: string }>`
    color: ${props => props.color || lightThemeColors.textColorCommon};
    font-size: 14px;
    font-weight: 500;
    line-height: normal;
    margin: 0;
`;

const MainLabel = styled(Label)``;

const FeeLabel = styled(Label)`
    color: ${lightThemeColors.textColorCommon};
    font-weight: normal;
`;

const CostLabel = styled(Label)`
    font-weight: 700;
`;

interface OwnProps {
    orderType: OrderType;
    tokenAmount: BigNumber;
    tokenPrice: BigNumber;
    orderSide: OrderSide;
    currencyPair: CurrencyPair;
}

const OrderDetails: React.FC<OwnProps> = props => {
    const {
        orderType,
        tokenAmount,
        tokenPrice,
        orderSide,
        currencyPair
    } = props;

    const [makerFeeAmount, setMakerFeeAmount] = useState(ZERO);
    const [takerFeeAmount, setTakerFeeAmount] = useState(ZERO);
    const [makerFeeAssetData, setMakerFeeAssetData] = useState<string | undefined>(NULL_BYTES);
    const [takerFeeAssetData, setTakerFeeAssetData] = useState<string | undefined>(NULL_BYTES);
    const [quoteTokenAmount, setQuoteTokenAmount] = useState(ZERO);
    const [canOrderBeFilled, setCanOrderBeFilled] = useState(true);

    const { orders } = useErc20Store();

    const openSellOrders = orders.filter(o => o.side === OrderSide.Sell).sort((o1, o2) => o2.price.comparedTo(o1.price));
    const openBuyOrders = orders.filter(o => o.side === OrderSide.Buy).sort((o1, o2) => o2.price.comparedTo(o1.price));

    useEffect(() => {
        const updateOrderDetailsState = async () => {
            if (!currencyPair) {
                return;
            }

            if (orderType === OrderType.Limit) {
                const { quote, base } = currencyPair;
                const quoteToken = getKnownTokens().getTokenBySymbol(quote);
                const baseToken = getKnownTokens().getTokenBySymbol(base);
                const priceInQuoteBaseUnits = Web3Wrapper.toBaseUnitAmount(tokenPrice, quoteToken.decimals);
                const baseTokenAmountInUnits = Web3Wrapper.toUnitAmount(tokenAmount, baseToken.decimals);
                const newQuoteTokenAmount = baseTokenAmountInUnits.multipliedBy(priceInQuoteBaseUnits);

                // Fees are now implicitly handled by the relayer when an order is submitted.
                // We can set them to zero here for display purposes in the details view.
                setMakerFeeAmount(ZERO);
                setTakerFeeAmount(ZERO);
                setQuoteTokenAmount(newQuoteTokenAmount);

            } else {
                const { base, quote } = currencyPair;
                const baseToken = getKnownTokens().getTokenBySymbol(base);
                const quoteToken = getKnownTokens().getTokenBySymbol(quote);
                const isSell = orderSide === OrderSide.Sell;
                const [ordersToFill, amountToPayForEachOrder, canBeFilled] = buildMarketOrders(
                    {
                        amount: tokenAmount,
                        orders: isSell ? openBuyOrders : openSellOrders,
                        baseToken,
                        quoteToken,
                    },
                    orderSide,
                );

                const firstOrderWithFees = ordersToFill.find(o => o.takerFeeAssetData !== NULL_BYTES);
                const newTakerFeeAssetData = firstOrderWithFees ? firstOrderWithFees.takerFeeAssetData : NULL_BYTES;
                const newTakerFeeAmount = ordersToFill.reduce((sum, order) => sum.plus(order.takerFee), ZERO);
                const newQuoteTokenAmount = sumTakerAssetFillableOrders(orderSide, ordersToFill, amountToPayForEachOrder);

                setTakerFeeAmount(newTakerFeeAmount);
                setTakerFeeAssetData(newTakerFeeAssetData);
                setQuoteTokenAmount(newQuoteTokenAmount);
                setCanOrderBeFilled(canBeFilled);
            }
        };

        updateOrderDetailsState();
    }, [tokenPrice, orderType, tokenAmount, currencyPair, orderSide, openBuyOrders, openSellOrders]);

    const getFeeStringForRender = () => {
        const feeAssetData = orderType === OrderType.Limit ? makerFeeAssetData : takerFeeAssetData;
        const feeAmount = orderType === OrderType.Limit ? makerFeeAmount : takerFeeAmount;
        if (feeAssetData === NULL_BYTES) {
            return '0.00';
        }
        const feeToken = getKnownTokens().getTokenByAssetData(feeAssetData as string);

        return `${tokenAmountInUnits(
            feeAmount,
            feeToken.decimals,
            feeToken.displayDecimals,
        )} ${tokenSymbolToDisplayString(feeToken.symbol)}`;
    };

    const getCostStringForRender = () => {
        if (orderType === OrderType.Market && !canOrderBeFilled) {
            return `---`;
        }

        const { quote } = currencyPair;
        const quoteToken = getKnownTokens().getTokenBySymbol(quote);
        const costAmount = tokenAmountInUnits(quoteTokenAmount, quoteToken.decimals, quoteToken.displayDecimals);
        return `${costAmount} ${tokenSymbolToDisplayString(quote)}`;
    };

    const fee = getFeeStringForRender();
    const cost = getCostStringForRender();
    const costText = orderSide === OrderSide.Sell ? 'Total' : 'Cost';

    return (
        <>
            <LabelContainer>
                <MainLabel>Order Details</MainLabel>
            </LabelContainer>
            <Row>
                <FeeLabel>Fee</FeeLabel>
                <Value>{fee}</Value>
            </Row>
            <Row>
                <CostLabel>{costText}</CostLabel>
                <CostValue>{cost}</CostValue>
            </Row>
        </>
    );
};

const OrderDetailsContainer = React.memo(OrderDetails);

export { CostValue, OrderDetails, OrderDetailsContainer, Value };
