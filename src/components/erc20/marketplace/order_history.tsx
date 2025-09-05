import { OrderStatus } from '@0x/types';
import React from 'react';
import styled from 'styled-components';
import { useAccount } from 'wagmi';

import { UI_DECIMALS_DISPLAYED_PRICE_ETH } from '../../../common/constants';
import { useErc20Store } from '../../../store';
import { tokenAmountInUnits } from '../../../util/tokens';
import { OrderSide, Token, UIOrder } from '../../../util/types';
import { Card } from '../../common/card';
import { EmptyContent } from '../../common/empty_content';
import { LoadingWrapper } from '../../common/loading';
import { CustomTD, Table, TH, THead, TR } from '../../common/table';

import { CancelOrderButtonContainer } from './cancel_order_button';
import { lightThemeColors } from '../../../themes/default_theme';

const SideTD = styled(CustomTD) <{ side: OrderSide }>`
    color: ${props =>
        props.side === OrderSide.Buy ? lightThemeColors.green : lightThemeColors.red};
`;

const orderToRow = (order: UIOrder, index: number, baseToken: Token) => {
    const sideLabel = order.side === OrderSide.Sell ? 'Sell' : 'Buy';
    const size = tokenAmountInUnits(order.size, baseToken.decimals, baseToken.displayDecimals);
    let status = '--';
    let isOrderFillable = false;

    const filled = order.filled
        ? tokenAmountInUnits(order.filled, baseToken.decimals, baseToken.displayDecimals)
        : null;
    if (order.status) {
        isOrderFillable = order.status === OrderStatus.Fillable;
        status = isOrderFillable ? 'Open' : 'Filled';
    }

    const price = parseFloat(order.price.toString()).toFixed(UI_DECIMALS_DISPLAYED_PRICE_ETH);

    return (
        <TR key={index}>
            <SideTD side={order.side}>{sideLabel}</SideTD>
            <CustomTD styles={{ textAlign: 'right', tabular: true }}>{size}</CustomTD>
            <CustomTD styles={{ textAlign: 'right', tabular: true }}>{filled}</CustomTD>
            <CustomTD styles={{ textAlign: 'right', tabular: true }}>{price}</CustomTD>
            <CustomTD>{status}</CustomTD>
            <CustomTD styles={{ textAlign: 'center' }}>
                {isOrderFillable ? <CancelOrderButtonContainer order={order} /> : ''}
            </CustomTD>
        </TR>
    );
};

const OrderHistory: React.FC = () => {
    const { isConnected, isConnecting, isDisconnected } = useAccount();

    const { baseToken, userOrders, quoteToken } = useErc20Store();
    const orders = userOrders;

    const ordersToShow = orders ? orders.filter(order => order.status === OrderStatus.Fillable) : [];

    let content: React.ReactNode;
    if (isDisconnected || isConnecting || !isConnected) {
        content = <EmptyContent alignAbsoluteCenter={true} text="There are no orders to show" />;
    } else if (isConnected) {
        if (!baseToken || !quoteToken || !orders) {
            content = <LoadingWrapper minHeight="120px" />;
        } else if (ordersToShow.length === 0) {
            content = <EmptyContent alignAbsoluteCenter={true} text="There are no orders to show" />;
        } else {
            content = (
                <Table isResponsive={true}>
                    <THead>
                        <TR>
                            <TH>Side</TH>
                            <TH styles={{ textAlign: 'right' }}>Size ({baseToken.symbol})</TH>
                            <TH styles={{ textAlign: 'right' }}>Filled ({baseToken.symbol})</TH>
                            <TH styles={{ textAlign: 'right' }}>Price ({quoteToken.symbol})</TH>
                            <TH>Status</TH>
                            <TH>&nbsp;</TH>
                        </TR>
                    </THead>
                    <tbody>{ordersToShow.map((order, index) => orderToRow(order, index, baseToken))}</tbody>
                </Table>
            );
        }
    }

    return <Card title="Orders">{content}</Card>;
};

const OrderHistoryContainer = React.memo(OrderHistory);

export { OrderHistory, OrderHistoryContainer };