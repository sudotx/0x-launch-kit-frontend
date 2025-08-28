import React, { useEffect, useState } from 'react';
import TimeAgo from 'react-timeago';
import styled, { css } from 'styled-components';

import { themeDimensions } from '../../themes/commons';
import { CancelablePromise, makeCancelable } from '../../util/cancelable_promises';
import { getEtherscanUrlForNotificationTx } from '../../util/notifications';
import { tokenAmountInUnits } from '../../util/tokens';
import { Notification, NotificationKind, OrderSide } from '../../util/types';
import { NotificationCancelIcon } from '../common/icons/notification_cancel_icon';
import { NotificationCheckmarkIcon } from '../common/icons/notification_checkmark_icon';
import { Interval } from '../common/interval';
import { PendingTime } from '../common/pending_time';
import { Spinner } from '../common/spinner';

interface Props {
    item: Notification;
    estimatedTxTimeMs: number;
}

interface StyledIsActive {
    active?: boolean;
}

const notificationWrapperMixin = css<StyledIsActive>`
    align-items: center;
    background-color: ${props =>
        props.active ? props.theme.componentsTheme.rowActive : props.theme.componentsTheme.dropdownBackgroundColor};
    border-bottom: 1px solid ${props => props.theme.componentsTheme.dropdownBorderColor};
    display: flex;
    justify-content: space-between;
    padding: 20px ${themeDimensions.horizontalPadding};

    &:last-child {
        border-bottom-left-radius: ${themeDimensions.borderRadius};
        border-bottom-right-radius: ${themeDimensions.borderRadius};
        border-bottom: none;
    }
`;

const NotificationWrapperLimit = styled.div<StyledIsActive>`
    ${notificationWrapperMixin}
`;

const NotificationWrapperMarketOrCancel = styled.a<StyledIsActive>`
    ${notificationWrapperMixin}
    text-decoration: none;

    &:hover {
        background-color: ${props => props.theme.componentsTheme.rowActive};
        cursor: pointer;
    }
`;

const NotificationContent = styled.div`
    flex-grow: 1;
    padding-right: 25px;
`;

const NotificationTitle = styled.h2`
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-size: 16px;
    font-weight: 600;
    line-height: 1.2;
    margin: 0 0 8px;
`;

const NotificationText = styled.p`
    color: ${props => props.theme.componentsTheme.textLight};
    font-size: 16px;
    font-weight: 400;
    line-height: 1.2;
    margin: 0;
`;

const NotificationIcon = styled.div`
    flex-shrink: 0;
`;

const NotificationItem: React.FC<Props> = props => {
    const { item, estimatedTxTimeMs } = props;
    const [pending, setPending] = useState(false);

    useEffect(() => {
        let txMined: CancelablePromise<any> | null = null;

        if (item.kind === NotificationKind.Market || item.kind === NotificationKind.CancelOrder) {
            setPending(true);

            txMined = makeCancelable(item.tx);

            txMined.promise.finally(() => setPending(false));
        }

        return () => {
            if (txMined) {
                txMined.cancel();
            }
        };
    }, [item]);

    const getTitleFromItem = (item: Notification): string => {
        let operation: string;

        switch (item.kind) {
            case NotificationKind.Market:
                operation = item.side === OrderSide.Buy ? 'Market Buy' : 'Market Sell';
                break;
            case NotificationKind.CancelOrder:
                operation = 'Cancelled Order';
                break;
            case NotificationKind.Limit:
                operation = item.side === OrderSide.Buy ? 'Limit Buy' : 'Limit Sell';
                break;
            case NotificationKind.OrderFilled:
                operation = item.side === OrderSide.Buy ? 'Buy Order Filled' : 'Sell Order Filled';
                break;
            default: {
                const _exhaustiveCheck: never = item;
                operation = _exhaustiveCheck;
            }
        }

        const amount = tokenAmountInUnits(item.amount, item.token.decimals);
        return `${operation} ${amount} ${item.token.symbol.toUpperCase()}`;
    };

    const getTextFromItem = (item: Notification): React.ReactNode => {
        if (pending) {
            return (
                <Interval delay={1000}>
                    {now => <PendingTime now={now} startTime={item.timestamp} estimatedTimeMs={estimatedTxTimeMs} />}
                </Interval>
            );
        }

        const formatter = (value: number, unit: string, suffix: string) => {
            if (unit === 'second') {
                return 'Just now';
            } else {
                return `${value}  ${unit}${value > 1 ? 's' : ''} ${suffix}`;
            }
        };

        return <TimeAgo date={item.timestamp} formatter={formatter} />;
    };

    const getNotificationIcon = (item: Notification) => {
        if (pending) {
            return <Spinner />;
        } else if (item.kind === NotificationKind.CancelOrder) {
            return <NotificationCancelIcon />;
        } else {
            return <NotificationCheckmarkIcon />;
        }
    };

    const notificationBody = (
        <>
            <NotificationContent>
                <NotificationTitle>{getTitleFromItem(item)}</NotificationTitle>
                <NotificationText>{getTextFromItem(item)}</NotificationText>
            </NotificationContent>
            <NotificationIcon>{getNotificationIcon(item)}</NotificationIcon>
        </>
    );

    return item.kind === NotificationKind.Limit ? (
        <NotificationWrapperLimit active={pending}>{notificationBody}</NotificationWrapperLimit>
    ) : (
        <NotificationWrapperMarketOrCancel
            active={pending}
            href={getEtherscanUrlForNotificationTx(item)}
            target="_blank"
        >
            {notificationBody}
        </NotificationWrapperMarketOrCancel>
    );
};

export { NotificationItem };
