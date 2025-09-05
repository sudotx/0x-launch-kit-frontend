import { BigNumber } from '@0x/utils';
import { useCallback, useEffect, useState } from 'react';
import { useErc20Store } from '../store';
import { OrderSide, OrderType, Web3State } from '../util/types';

interface UseBuySellFormProps {
    currencyPair: { base: string; quote: string };
}

export const useBuySellForm = ({ currencyPair }: UseBuySellFormProps) => {
    const [makerAmount, setMakerAmount] = useState<BigNumber | null>(null);
    const [orderType, setOrderType] = useState<OrderType>(OrderType.Market);
    const [price, setPrice] = useState<BigNumber | null>(null);
    const [tab, setTab] = useState<OrderSide>(OrderSide.Buy);
    const [error, setError] = useState<{ btnMsg: string | null; cardMsg: string | null }>({
        btnMsg: null,
        cardMsg: null
    });

    const {
        web3State,
        orderPriceSelected,
        createSignedOrder,
        submitLimitOrder,
        submitMarketOrder,
    } = useErc20Store();

    // Auto-fill price when orderPriceSelected changes for limit orders
    useEffect(() => {
        if (orderPriceSelected && orderType === OrderType.Limit) {
            setPrice(orderPriceSelected);
        }
    }, [orderPriceSelected, orderType]);

    const resetForm = useCallback(() => {
        setMakerAmount(null);
        setPrice(null);
    }, []);

    const clearError = useCallback((type: 'btnMsg' | 'cardMsg') => {
        setError(prev => ({ ...prev, [type]: null }));
    }, []);

    const setErrorWithTimeout = useCallback((btnMsg: string, cardMsg: string) => {
        setError({ btnMsg, cardMsg });
        setTimeout(() => clearError('btnMsg'), 2000);
        setTimeout(() => clearError('cardMsg'), 4000);
    }, [clearError]);

    const submitOrder = useCallback(async () => {
        if (!makerAmount) return;

        try {
            if (orderType === OrderType.Limit) {
                if (!price) return;
                const signedOrder = await createSignedOrder(makerAmount, price, tab);
                if (signedOrder) {
                    await submitLimitOrder(signedOrder, makerAmount, tab);
                }
            } else {
                await submitMarketOrder(makerAmount, tab);
            }
            resetForm();
        } catch (error: any) {
            setErrorWithTimeout('Error', error.message);
        }
    }, [makerAmount, price, tab, orderType, createSignedOrder, submitLimitOrder, submitMarketOrder, resetForm, setErrorWithTimeout]);


    // Validation logic
    const isMakerAmountEmpty = !makerAmount || makerAmount.isZero();
    const isPriceEmpty = !price || price.isZero();
    const isFormInvalid =
        web3State !== Web3State.Done ||
        (orderType === OrderType.Limit && (isMakerAmountEmpty || isPriceEmpty)) ||
        (orderType === OrderType.Market && isMakerAmountEmpty);

    return {
        // State
        makerAmount,
        orderType,
        price,
        tab,
        error,

        // Derived state
        isFormInvalid,

        // Actions
        setMakerAmount,
        setOrderType,
        setPrice,
        setTab,
        submitOrder,
        resetForm,
    };
};