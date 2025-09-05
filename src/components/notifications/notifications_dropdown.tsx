import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { useErc20Store } from '../../store';
import { themeDimensions } from '../../themes/commons';
import { CardBase } from '../common/card_base';
import { Dropdown, DropdownPositions } from '../common/dropdown';
import { BellIcon } from '../common/icons/bell_icon';

import { NotificationItem } from './notification_item';

type Props = HTMLAttributes<HTMLDivElement>;

const NotificationsDropdownWrapper = styled(Dropdown)`
    z-index: 100;
`;

const NotificationsDropdownHeader = styled.div`
    align-items: center;
    display: flex;
    position: relative;

    path {
        fill: ${props => props.theme.componentsTheme.notificationIconColor};
    }
`;

const NewNotificationsBadge = styled.div`
    background: ${props => props.theme.componentsTheme.notificationsBadgeColor};
    border-radius: 50%;
    height: 7px;
    position: absolute;
    right: -4px;
    top: 12px;
    width: 7px;
`;

const NotificationsDropdownBody = styled(CardBase)`
    box-shadow: ${props => props.theme.componentsTheme.boxShadow};
    width: 400px;
`;
const NotificationsList = styled.div`
    max-height: 420px;
    overflow: auto;
`;

const NotificationDropdownTitle = styled.h1`
    border-bottom: 1px solid ${props => props.theme.componentsTheme.dropdownBorderColor};
    color: ${props => props.theme.componentsTheme.textColorCommon};
    font-size: 16px;
    font-weight: 600;
    line-height: 1.2;
    margin: 0;
    padding: 15px ${themeDimensions.horizontalPadding};
`;

const NoNotifications = styled.div`
    line-height: 3em;
    text-align: center;
`;

const NotificationsDropdown: React.FC<Props> = props => {
    const {
        gasInfo: { estimatedTimeMs: estimatedTxTimeMs },
        notifications,
        hasUnreadNotifications,
        setHasUnreadNotifications,
    } = useErc20Store();

    const onMarkNotificationsAsRead = () => setHasUnreadNotifications(false);
    const { ...restProps } = props;

    const notificationsList = notifications.map((item, index) => (
        <NotificationItem key={index} item={item} estimatedTxTimeMs={estimatedTxTimeMs} />
    ));

    const header = (
        <NotificationsDropdownHeader>
            <BellIcon />
            {hasUnreadNotifications ? <NewNotificationsBadge /> : null}
        </NotificationsDropdownHeader>
    );

    const body = (
        <NotificationsDropdownBody>
            <NotificationDropdownTitle>Notifications</NotificationDropdownTitle>
            <NotificationsList>
                {notifications.length === 0 ? <NoNotifications>No notifications</NoNotifications> : notificationsList}
            </NotificationsList>
        </NotificationsDropdownBody>
    );

    return (
        <NotificationsDropdownWrapper
            body={body}
            header={header}
            horizontalPosition={DropdownPositions.Right}
            onClick={onMarkNotificationsAsRead}
            {...restProps}
        />
    );
};

const NotificationsDropdownContainer = React.memo(NotificationsDropdown);

export { NotificationsDropdown, NotificationsDropdownContainer };
