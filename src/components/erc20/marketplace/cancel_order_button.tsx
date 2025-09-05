import React, { useState } from 'react';
import styled from 'styled-components';

import { useErc20Store } from '../../../store';
import { UIOrder } from '../../../util/types';
import { CloseIcon } from '../../common/icons/close_icon';

interface OwnProps {
    order: UIOrder;
    onCancelStart?: () => void;
    onCancelSuccess?: () => void;
    onCancelError?: (error: string) => void;
}

const Button = styled.button`
    align-items: center;
    background: none;
    border: none;
    display: flex;
    height: 17px;
    justify-content: flex-end;
    margin-left: auto;
    outline: 0;
    padding: 0;
    width: 25px;

    &:hover {
        cursor: pointer;
    }

    &[disabled] {
        cursor: default;
    }
`;

const CancelOrderButton: React.FC<OwnProps> = ({ order, onCancelStart, onCancelSuccess, onCancelError }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { cancelOrder } = useErc20Store();

    const handleCancel = async () => {
        setIsLoading(true);
        onCancelStart?.();
        try {
            await cancelOrder(order);
            onCancelSuccess?.();
        } catch (e: any) {
            onCancelError?.(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button title="Cancel order" type="button" disabled={isLoading} onClick={handleCancel}>
            <CloseIcon />
        </Button>
    );
};

const CancelOrderButtonContainer = React.memo(CancelOrderButton);

export { CancelOrderButton, CancelOrderButtonContainer };
