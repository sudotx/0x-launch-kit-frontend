import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const LogoLink = styled(NavLink)`
    align-items: center;
    display: flex;
    text-decoration: none;
`;

const LogoText = styled.h1`
    font-size: 22px;
    font-weight: 600;
    line-height: 1.2;
    margin: 0 0 0 10px;
`;

interface LogoProps {
    image: React.ReactNode;
    text: string;
    onClick: () => void;
}

export const Logo = (props: LogoProps) => (
    <LogoLink to="/" onClick={props.onClick}>
        {props.image}
        <LogoText>{props.text}</LogoText>
    </LogoLink>
);

