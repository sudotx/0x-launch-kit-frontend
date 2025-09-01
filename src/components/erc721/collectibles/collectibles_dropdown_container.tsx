import React from 'react';
import styled from 'styled-components';

import { CardBase } from '../../common/card_base';

interface Props {
    children: React.ReactNode;
}

const DropdownItemsContainer = styled(CardBase)`
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    min-width: 240px;
`;

export const DropdownContainer: React.FC<Props> = ({ children }) => {
    return <DropdownItemsContainer>{children}</DropdownItemsContainer>;
};