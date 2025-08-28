import { BigNumber } from '@0x/utils';
import React, { useEffect, useRef, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import styled, { withTheme } from 'styled-components';

import {
    UI_DECIMALS_DISPLAYED_ORDER_SIZE,
    UI_DECIMALS_DISPLAYED_PRICE_ETH,
    UI_DECIMALS_DISPLAYED_SPREAD_PERCENT,
    ZERO,
} from '../../../common/constants';
import {
    getBaseToken,
    getOrderBook,
    getQuoteToken,
    getSpread,
    getSpreadInPercentage,
    getUserOrders,
    getWeb3State,
} from '../../../store/selectors';
import { setOrderPriceSelected } from '../../../store/ui/reducers';
import { Theme, themeBreakPoints } from '../../../themes/commons';
import { tokenAmountInUnits } from '../../../util/tokens';
import { OrderBook, OrderBookItem, OrderSide, StoreState, Token, UIOrder, Web3State } from '../../../util/types';
import { mockOrderBook, mockBaseToken, mockQuoteToken, mockSpread, mockSpreadPercentage } from '../../../utils/mockData';
import { Card } from '../../common/card';
import { EmptyContent } from '../../common/empty_content';
import { LoadingWrapper } from '../../common/loading';
import { ShowNumberWithColors } from '../../common/show_number_with_colors';
import { CustomTD, CustomTDLast, CustomTDTitle, TH, THLast } from '../../common/table';

import {
    customTDLastStyles,
    customTDStyles,
    customTDTitleStyles,
    GridRowSpread,
    GridRowSpreadContainer,
    GridRowSpreadRef,
} from './grid_row_spread';

interface StateProps {
    orderBook: OrderBook;
    baseToken: Token | null;
    quoteToken: Token | null;
    userOrders: UIOrder[];
    web3State?: Web3State;
    absoluteSpread: BigNumber;
    percentageSpread: BigNumber;
}

interface OwnProps {
    theme: Theme;
}

type Props = OwnProps & StateProps;

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
    background-color: 'transparent';
    cursor: pointer;
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
    overflow: auto;

    @media (min-width: ${themeBreakPoints.xl}) {
        max-height: none;
    }
`;

const ItemsMainContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: center;
    min-height: fit-content;
    position: relative;
    z-index: 1;
`;

const ItemsInnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
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
    // priceColor: string;
    mySizeOrders: OrderBookItem[];
    web3State?: Web3State;
}

const OrderToRow: React.FC<OrderToRowProps> = props => {
    const { order, index, baseToken, mySizeOrders = [], web3State } = props;
    // const { order, index, baseToken, priceColor, mySizeOrders = [], web3State } = props;
    const [isHover, setIsHover] = useState(false);
    const dispatch = useDispatch();

    const handleSetOrderPriceSelected = (price: BigNumber) => {
        dispatch(setOrderPriceSelected(price.toNumber()))
    };

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
    ) : null;

    return (
        <GridRowInner
            key={index}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onClick={() => handleSetOrderPriceSelected(order.price)}
        >
            <CustomTD as="div" styles={{ tabular: true, textAlign: 'right' }}>
                <ShowNumberWithColors isHover={isHover} num={new BigNumber(size)} />
            </CustomTD>
            <CustomTD as="div" styles={{ tabular: true, textAlign: 'right' }}>
                {parseFloat(price).toFixed(UI_DECIMALS_DISPLAYED_PRICE_ETH)}
            </CustomTD>
            {/* <CustomTD as="div" styles={{ tabular: true, textAlign: 'right', color: priceColor }}>
                {parseFloat(price).toFixed(UI_DECIMALS_DISPLAYED_PRICE_ETH)}
            </CustomTD> */}
            {mySizeRow}
        </GridRowInner>
    );
};

const OrderBookTable: React.FC<Props> = props => {
    const {
        orderBook,
        baseToken,
        quoteToken,
        web3State,
        theme,
        absoluteSpread,
        percentageSpread,
    } = props;
    const spreadRowScrollable = useRef<HTMLDivElement>(null);
    const spreadRowFixed = useRef<GridRowSpreadRef>(null);
    const itemsScroll = useRef<HTMLDivElement>(null);
    const hasScrolled = useRef(false);

    const { sellOrders, buyOrders, mySizeOrders } = orderBook;
    const mySizeSellArray = mySizeOrders.filter(order => order.side === OrderSide.Sell);
    const mySizeBuyArray = mySizeOrders.filter(order => order.side === OrderSide.Buy);

    const getColor = (order: OrderBookItem): string => {
        return order.side === OrderSide.Buy ? theme.componentsTheme.green : theme.componentsTheme.red;
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

    if (web3State !== Web3State.Error && (!baseToken || !quoteToken)) {
        content = <CenteredLoading />;
    } else if ((!buyOrders.length && !sellOrders.length) || !baseToken || !quoteToken) {
        content = <EmptyContent alignAbsoluteCenter={true} text="There are no orders to show" />;
    } else {
        const mySizeHeader = web3State !== Web3State.Locked && web3State !== Web3State.NotInstalled ? (
            <THLast as="div" styles={{ textAlign: 'right', borderBottom: true }}>
                My Size
            </THLast>
        ) : null;

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
                    <GridRowSpread
                        ref={spreadRowFixed}
                        spreadAbsValue={spreadAbsFixed}
                        spreadPercentValue={spreadPercentFixed}
                    />
                    <ItemsMainContainer>
                        <TopItems>
                            {sellOrders.map((order, index) => (
                                <OrderToRow
                                    key={index}
                                    order={order}
                                    index={index}
                                    baseToken={baseToken}
                                    // priceColor={getColor(order)}
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
                                    // priceColor={getColor(order)}
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

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        orderBook: mockOrderBook,
        baseToken: mockBaseToken,
        userOrders: [],
        quoteToken: mockQuoteToken,
        web3State: undefined,
        absoluteSpread: mockSpread,
        percentageSpread: mockSpreadPercentage,
    };
};
// const mapStateToProps = (state: StoreState): StateProps => {
//     return {
//         orderBook: getOrderBook(state) || mockOrderBook,
//         baseToken: getBaseToken(state) || mockBaseToken,
//         userOrders: getUserOrders(state) || [],
//         quoteToken: getQuoteToken(state) || mockQuoteToken,
//         web3State: getWeb3State(state) || 'Done',
//         absoluteSpread: getSpread(state) || mockSpread,
//         percentageSpread: getSpreadInPercentage(state) || mockSpreadPercentage,
//     };
// };

const OrderBookTableContainer = withTheme(connect(mapStateToProps)(OrderBookTable));
const OrderBookTableWithTheme = withTheme(OrderBookTable);

export { OrderBookTable, OrderBookTableContainer, OrderBookTableWithTheme };

