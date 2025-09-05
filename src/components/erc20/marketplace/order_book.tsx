import { BigNumber } from '@0x/utils';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import {
    UI_DECIMALS_DISPLAYED_ORDER_SIZE,
    UI_DECIMALS_DISPLAYED_PRICE_ETH,
    UI_DECIMALS_DISPLAYED_SPREAD_PERCENT,
    ZERO,
} from '../../../common/constants';
import { useErc20Store } from '../../../store';
import { themeBreakPoints } from '../../../themes/commons';
import { tokenAmountInUnits } from '../../../util/tokens';
import { OrderBookItem, OrderSide, Token, Web3State } from '../../../util/types';
import { Card } from '../../common/card';
import { EmptyContent } from '../../common/empty_content';
import { LoadingWrapper } from '../../common/loading';
import { ShowNumberWithColors } from '../../common/show_number_with_colors';
import { CustomTD, CustomTDLast, CustomTDTitle, TH, THLast } from '../../common/table';

import { useOrderBook } from '../../../hooks/useOrderBook';
import { lightThemeColors } from '../../../themes/default_theme';
import {
    customTDLastStyles,
    customTDStyles,
    customTDTitleStyles,
    GridRowSpread,
    GridRowSpreadContainer,
    GridRowSpreadRef,
} from './grid_row_spread';

const OrderbookCard = styled(Card)`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    max-height: 100%;

    > div:first-child {
        flex-grow: 0;
        flex-shrink: 0;
    }

    > div:nth-child(2) {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
        padding-bottom: 0;
        padding-left: 0;
        padding-right: 0;
    }
`;

const GridRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
`;

const GridRowInner = styled(GridRow)`
    background-color: transparent;
    cursor: pointer;
    &:hover {
        background-color: ${lightThemeColors.rowOrderActive};
    }
`;

const GridRowTop = styled(GridRow)`
    flex-grow: 0;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
`;

const CenteredLoading = styled(LoadingWrapper)`
    height: 100%;
`;

const ItemsScroll = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    max-height: 500px;
    overflow: hidden;
    position: relative;

    @media (min-width: ${themeBreakPoints.xl}) {
        max-height: none;
    }
`;

const StickyContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
`;

const ItemsMainContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: fit-content;
    position: relative;
    z-index: 1;
`;

const ItemsInnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
`;

const TopItems = styled(ItemsInnerContainer)`
    justify-content: flex-end;
`;

const BottomItems = styled(ItemsInnerContainer)`
    justify-content: flex-start;
`;

interface OrderToRowProps {
    order: OrderBookItem;
    index: number;
    baseToken: Token;
    priceColor: string;
    mySizeOrders: OrderBookItem[];
    web3State?: Web3State;
}

const OrderToRow: React.FC<OrderToRowProps> = props => {
    const { order, index, baseToken, priceColor, mySizeOrders = [], web3State } = props;
    const [isHover, setIsHover] = useState(false);

    const { setOrderPriceSelected } = useErc20Store();


    const size = tokenAmountInUnits(order.size, baseToken.decimals, UI_DECIMALS_DISPLAYED_ORDER_SIZE);
    const price = order.price.toString();

    const mySize = mySizeOrders.reduce((sumSize, mySizeItem) => {
        if (mySizeItem.price.eq(order.price)) {
            return sumSize.plus(mySizeItem.size);
        }
        return sumSize;
    }, ZERO);

    const mySizeConverted = tokenAmountInUnits(mySize, baseToken.decimals, UI_DECIMALS_DISPLAYED_ORDER_SIZE);
    const isMySizeEmpty = mySize.eq(ZERO);
    const displayColor = isMySizeEmpty ? '#dedede' : undefined;
    const mySizeRow = web3State !== Web3State.Locked && web3State !== Web3State.NotInstalled ? (
        <CustomTDLast as="div" styles={{ tabular: true, textAlign: 'right', color: displayColor }} id="mySize">
            {isMySizeEmpty ? '-' : mySizeConverted}
        </CustomTDLast>
    ) : <div />;

    return (
        <GridRowInner
            key={index}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onClick={() => setOrderPriceSelected(order.price)}
        >
            <CustomTD as="div" styles={{ tabular: true, textAlign: 'right' }}>
                <ShowNumberWithColors ishover={isHover} num={new BigNumber(size)} />
            </CustomTD>
            <CustomTD as="div" styles={{ tabular: true, textAlign: 'right', color: priceColor }}>
                {parseFloat(price).toFixed(UI_DECIMALS_DISPLAYED_PRICE_ETH)}
            </CustomTD>
            {mySizeRow}
        </GridRowInner>
    );
};

const OrderBookTable: React.FC = () => {
    const spreadRowScrollable = useRef<HTMLDivElement>(null);
    const spreadRowFixed = useRef<GridRowSpreadRef>(null);
    const itemsScroll = useRef<HTMLDivElement>(null);
    const hasScrolled = useRef(false);

    const {
        orderBook,
        baseToken,
        quoteToken,
        web3State,
        absoluteSpread,
        percentageSpread,
        isLoading,
    } = useOrderBook();

    const { sellOrders, buyOrders, mySizeOrders } = orderBook;
    const mySizeSellArray = mySizeOrders.filter(order => order.side === OrderSide.Sell);
    const mySizeBuyArray = mySizeOrders.filter(order => order.side === OrderSide.Buy);

    const getColor = (order: OrderBookItem): string => {
        return order.side === OrderSide.Buy ? 'green' : 'red';
    };

    const getSpreadWidth = (): string => {
        return itemsScroll.current ? `${itemsScroll.current.clientWidth}px` : '';
    };

    const getSpreadOffsetTop = (): number => {
        return spreadRowScrollable.current ? spreadRowScrollable.current.offsetTop : 0;
    };

    const getSpreadHeight = (): number => {
        return spreadRowScrollable.current ? spreadRowScrollable.current.clientHeight : 0;
    };

    const getItemsListScroll = (): number => {
        return itemsScroll.current ? itemsScroll.current.scrollTop : 0;
    };

    const getItemsListHeight = (): number => {
        return itemsScroll.current ? itemsScroll.current.clientHeight : 0;
    };

    const getStickySpreadState = () => {
        const spreadOffsetTop = getSpreadOffsetTop();
        const itemsListScroll = getItemsListScroll();
        const topLimit = 0;

        if (spreadOffsetTop - itemsListScroll <= topLimit) {
            return 'top';
        } else if (itemsListScroll + getItemsListHeight() - getSpreadHeight() <= spreadOffsetTop) {
            return 'bottom';
        } else {
            return 'hidden';
        }
    };

    const updateStickySpreadState = () => {
        if (spreadRowFixed.current) {
            spreadRowFixed.current.updateStickSpreadState(getStickySpreadState(), getSpreadWidth());
        }
    };

    const scrollToSpread = () => {
        if (window.outerWidth < parseInt(themeBreakPoints.xl, 10)) {
            return;
        }

        if (spreadRowScrollable.current && !hasScrolled.current) {
            spreadRowScrollable.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
            hasScrolled.current = true;
        }
    };

    useEffect(() => {
        scrollToSpread();
    });

    useEffect(() => {
        if (spreadRowFixed.current && hasScrolled.current) {
            spreadRowFixed.current.updateStickSpreadState(getStickySpreadState(), getSpreadWidth());
        }
    });

    let content: React.ReactNode;

    if (isLoading || (web3State !== Web3State.Error && (!baseToken || !quoteToken))) {
        content = <CenteredLoading />;
    } else if ((!buyOrders.length && !sellOrders.length) || !baseToken || !quoteToken) {
        content = <EmptyContent alignAbsoluteCenter={true} text="There are no orders to show" />;
    } else {
        const mySizeHeader = web3State !== Web3State.Locked && web3State !== Web3State.NotInstalled ? (
            <THLast as="div" styles={{ textAlign: 'right', borderBottom: true }}>
                My Size
            </THLast>
        ) : <div />;

        const spreadAbsFixed = absoluteSpread.toFixed(UI_DECIMALS_DISPLAYED_PRICE_ETH);
        const spreadPercentFixed = percentageSpread.toFixed(UI_DECIMALS_DISPLAYED_SPREAD_PERCENT);

        content = (
            <>
                <GridRowTop as="div">
                    <TH as="div" styles={{ textAlign: 'right', borderBottom: true }}>
                        Trade size
                    </TH>
                    <TH as="div" styles={{ textAlign: 'right', borderBottom: true }}>
                        Price ({quoteToken.symbol})
                    </TH>
                    {mySizeHeader}
                </GridRowTop>
                <ItemsScroll ref={itemsScroll} onScroll={updateStickySpreadState}>
                    <StickyContainer>
                        <GridRowSpread
                            ref={spreadRowFixed}
                            spreadAbsValue={spreadAbsFixed}
                            spreadPercentValue={spreadPercentFixed}
                        />
                    </StickyContainer>
                    <ItemsMainContainer>
                        <TopItems>
                            {sellOrders.map((order, index) => (
                                <OrderToRow
                                    key={index}
                                    order={order}
                                    index={index}
                                    baseToken={baseToken}
                                    priceColor={getColor(order)}
                                    mySizeOrders={mySizeSellArray}
                                    web3State={web3State}
                                />
                            ))}
                        </TopItems>
                        <GridRowSpreadContainer ref={spreadRowScrollable}>
                            <CustomTDTitle as="div" styles={customTDTitleStyles}>
                                Spread
                            </CustomTDTitle>
                            <CustomTD as="div" styles={customTDStyles}>
                                {spreadAbsFixed}
                            </CustomTD>
                            <CustomTDLast as="div" styles={customTDLastStyles}>
                                {spreadPercentFixed}%
                            </CustomTDLast>
                        </GridRowSpreadContainer>
                        <BottomItems>
                            {buyOrders.map((order, index) => (
                                <OrderToRow
                                    key={index}
                                    order={order}
                                    index={index}
                                    baseToken={baseToken}
                                    priceColor={getColor(order)}
                                    mySizeOrders={mySizeBuyArray}
                                    web3State={web3State}
                                />
                            ))}
                        </BottomItems>
                    </ItemsMainContainer>
                </ItemsScroll>
            </>
        );
    }

    return <OrderbookCard title="Orderbook">{content}</OrderbookCard>;
};

const OrderBookTableContainer = OrderBookTable;

export { OrderBookTable, OrderBookTableContainer };
