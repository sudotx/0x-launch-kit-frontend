import React from 'react';
import styled from 'styled-components';
import { lightThemeColors } from '../../../themes/default_theme';

const Badge = styled.div`
    align-items: center;
    background: ${lightThemeColors.cardBackgroundColor};
    border-radius: 16px;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.04);
    display: flex;
    height: 31px;
    justify-content: center;
    min-width: 84px;
    padding: 8px 12px;
    position: absolute;
    left: 10px;
    top: 10px;
`;

const BadgeValue = styled.span`
    color: ${lightThemeColors.cardTitleOwnerColor};
    font-size: 14px;
    font-weight: 400;
    line-height: 14px;
`;

export const OwnerBadge = () => {
    return (
        <Badge>
            <BadgeValue>You Own</BadgeValue>
        </Badge>
    );
};
