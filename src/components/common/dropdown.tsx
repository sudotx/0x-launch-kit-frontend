import React, { HTMLAttributes, useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';

export enum DropdownPositions {
    Center,
    Left,
    Right,
}

interface DropdownWrapperBodyProps {
    horizontalPosition?: DropdownPositions;
}

interface Props extends HTMLAttributes<HTMLDivElement>, DropdownWrapperBodyProps {
    body: React.ReactNode;
    header: React.ReactNode;
    shouldCloseDropdownOnClickOutside?: boolean;
}

const DropdownWrapper = styled.div`
    position: relative;
`;

const DropdownWrapperHeader = styled.div`
    cursor: pointer;
    position: relative;
`;

const DropdownWrapperBody = styled.div<DropdownWrapperBodyProps>`
    position: absolute;
    top: calc(100% + 15px);

    ${props => (props.horizontalPosition === DropdownPositions.Left ? 'left: 0;' : '')}

    ${props => (props.horizontalPosition === DropdownPositions.Center ? 'left: 50%; transform: translateX(-50%);' : '')}

    ${props => (props.horizontalPosition === DropdownPositions.Right ? 'right: 0;' : '')}
`;

export interface DropdownRef {
    closeDropdown: () => void;
}

export const Dropdown = forwardRef<DropdownRef, Props>((props, ref) => {
    const { header, body, horizontalPosition = DropdownPositions.Left, shouldCloseDropdownOnClickOutside = true, ...restProps } = props;
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const closeDropdown = () => {
        setIsOpen(false);
    };

    useImperativeHandle(ref, () => ({
        closeDropdown,
    }));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                if (shouldCloseDropdownOnClickOutside) {
                    closeDropdown();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [shouldCloseDropdownOnClickOutside]);

    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
    };

    const closeDropdownBody = () => {
        if (shouldCloseDropdownOnClickOutside) {
            closeDropdown();
        }
    };

    return (
        <DropdownWrapper ref={wrapperRef} {...restProps}>
            <DropdownWrapperHeader onClick={toggleDropdown}>{header}</DropdownWrapperHeader>
            {isOpen ? (
                <DropdownWrapperBody horizontalPosition={horizontalPosition} onClick={closeDropdownBody}>
                    {body}
                </DropdownWrapperBody>
            ) : null}
        </DropdownWrapper>
    );
});
