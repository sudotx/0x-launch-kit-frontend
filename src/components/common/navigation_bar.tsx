import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
    display: flex;
    gap: 20px;
`;

const StyledNavLink = styled(NavLink)`
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;

`;

export const NavigationBar = () => {
    return (
        <Nav>
            <StyledNavLink to="/erc721">ERC721</StyledNavLink>
        </Nav>
    );
};