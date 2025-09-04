import React from 'react';
import styled from 'styled-components';

import { CardBase } from '../../common/card_base';
import { lightThemeColors } from '../../../themes/default_theme';

interface Props {
    children: React.ReactNode;
}

const DropdownItemsContainer = styled(CardBase)`
    box-shadow: ${lightThemeColors.boxShadow};
    min-width: 240px;
`;

export const DropdownContainer: React.FC<Props> = ({ children }) => {
    return <DropdownItemsContainer>{children}</DropdownItemsContainer>;
};