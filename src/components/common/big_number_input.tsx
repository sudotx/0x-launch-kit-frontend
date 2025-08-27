import { BigNumber } from '@0x/utils';
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { tokenAmountInUnits, unitsInTokenAmount } from '../../util/tokens';

interface Props {
    autofocus?: boolean;
    className?: string;
    decimals: number;
    placeholder?: string;
    max?: BigNumber;
    min?: BigNumber;
    onChange: (newValue: BigNumber) => void;
    step?: BigNumber;
    value: BigNumber | null;
    valueFixedDecimals?: number;
}

const Input = styled.input`
    ::-webkit-inner-spin-button,
    ::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    -moz-appearance: textfield;
`;

export const BigNumberInput: React.FC<Props> = props => {
    const {
        autofocus,
        className,
        decimals,
        placeholder = '0.00',
        max,
        min,
        onChange,
        step,
        value,
        valueFixedDecimals,
    } = props;

    const [currentValueStr, setCurrentValueStr] = useState(
        value ? tokenAmountInUnits(value, decimals, valueFixedDecimals) : '',
    );
    const textInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!value) {
            setCurrentValueStr('');
        } else if (value && !unitsInTokenAmount(currentValueStr || '0', decimals).eq(value)) {
            setCurrentValueStr(tokenAmountInUnits(value, decimals, valueFixedDecimals));
        }
    }, [value, decimals, valueFixedDecimals, currentValueStr]);

    useEffect(() => {
        if (autofocus && textInput.current) {
            textInput.current.focus();
        }
    }, [autofocus]);

    const _updateValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValueStr = e.currentTarget.value;

        const newValue = unitsInTokenAmount(newValueStr || '0', decimals);
        const invalidValue = (min && newValue.isLessThan(min)) || (max && newValue.isGreaterThan(max));
        if (invalidValue) {
            return;
        }

        onChange(newValue);
        setCurrentValueStr(newValueStr);
    };

    const stepStr = step && tokenAmountInUnits(step, decimals);
    const minStr = min && tokenAmountInUnits(min, decimals);
    const maxStr = max && tokenAmountInUnits(max, decimals);

    return (
        <Input
            className={className}
            max={maxStr}
            min={minStr}
            onChange={_updateValue}
            ref={textInput}
            step={stepStr}
            type={'number'}
            value={currentValueStr}
            placeholder={placeholder}
        />
    );
};
