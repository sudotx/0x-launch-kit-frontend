import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { WarningSmallIcon } from '../../components/common/icons/warning_small_icon';
import { themeDimensions } from '../../themes/commons';
import { ButtonIcons, ButtonVariant } from '../../util/types';

interface Props extends HTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    disabled?: boolean;
    icon?: ButtonIcons;
    variant?: ButtonVariant;
}

const StyledButton = styled.button<{ variant?: ButtonVariant }>`

    align-items: center;
    border: none;
    cursor: pointer;
    display: flex;
    font-size: 16px;
    font-weight: 600;
    justify-content: center;
    line-height: 1.2;
    padding: 15px;
    transition: background-color 0.25s ease-out;
    user-select: none;

    &:focus {
        outline: none;
    }

    &:disabled {
        cursor: default;
        opacity: 0.5;
    }
`;

const ButtonIcon = styled.span`
    align-items: center;
    display: flex;
    line-height: 1;
    margin-right: 8px;
`;

const getIcon = (icon: ButtonIcons) => {
    let buttonIcon: React.ReactNode = null;

    if (icon === ButtonIcons.Warning) {
        buttonIcon = <WarningSmallIcon />;
    }

    return buttonIcon ? <ButtonIcon>{buttonIcon}</ButtonIcon> : null;
};

export const Button: React.FC<Props> = props => {
    const { children, icon, ...restProps } = props;

    return (
        <StyledButton {...restProps}>
            {icon ? getIcon(icon) : null}
            {children}
        </StyledButton>
    );
};
