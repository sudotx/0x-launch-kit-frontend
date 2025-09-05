import React, { HTMLAttributes, useRef, useState } from 'react';
import styled from 'styled-components';

import { UI_DECIMALS_DISPLAYED_PRICE_ETH } from '../../../common/constants';
import { marketFilters } from '../../../common/markets';
import { useErc20Store } from '../../../store';
import { themeDimensions } from '../../../themes/commons';
import { lightThemeColors } from '../../../themes/default_theme';
import { getKnownTokens } from '../../../util/known_tokens';
import { filterMarketsByString, filterMarketsByTokenSymbol } from '../../../util/markets';
import { CurrencyPair, Filter, Market } from '../../../util/types';
import { CardBase } from '../../common/card_base';
import { Dropdown, DropdownRef } from '../../common/dropdown';
import { ChevronDownIcon } from '../../common/icons/chevron_down_icon';
import { MagnifierIcon } from '../../common/icons/magnifier_icon';
import { TokenIcon } from '../../common/icons/token_icon';
import { CustomTDFirst, CustomTDLast, Table, TBody, THead, THFirst, THLast, TR } from '../../common/table';

interface PropsDivElement extends HTMLAttributes<HTMLDivElement> { }

const rowHeight = '48px';

const MarketsDropdownWrapper = styled(Dropdown)``;

const MarketsDropdownHeader = styled.div`
    align-items: center;
    display: flex;
`;

const MarketsDropdownHeaderText = styled.span`
    color: ${lightThemeColors.textColorCommon};
    font-size: 18px;
    font-weight: 600;
    line-height: 26px;
    margin-right: 10px;
`;

const MarketsDropdownBody = styled(CardBase)`
    box-shadow: ${lightThemeColors.boxShadow};
    max-height: 100%;
    max-width: 100%;
    width: 401px;
`;

const MarketsFilters = styled.div`
    align-items: center;
    border-bottom: 1px solid ${lightThemeColors.dropdownBorderColor};
    display: flex;
    justify-content: space-between;
    min-height: ${rowHeight};
    padding: 8px 8px 8px ${themeDimensions.horizontalPadding};
`;

const MarketsFiltersLabel = styled.h2`
    color: ${lightThemeColors.textColorCommon};
    font-size: 16px;
    font-weight: 600;
    line-height: normal;
    margin: 0 auto 0 0;
`;

const TokenFiltersTabs = styled.div`
    align-items: center;
    display: flex;
    margin-right: 10px;
`;

const TokenFiltersTab = styled.span<{ active: boolean }>`
    color: ${lightThemeColors.textColorCommon};
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.2;
    user-select: none;

    &:after {
        color: ${lightThemeColors.lightGray};
        content: '/';
        margin: 0 6px;
    }

    &:last-child:after {
        display: none;
    }
`;

const searchFieldHeight = '32px';
const searchFieldWidth = '142px';

const SearchWrapper = styled.div`
    height: ${searchFieldHeight};
    position: relative;
    width: ${searchFieldWidth};
`;

const SearchField = styled.input`
    background: ${lightThemeColors.marketsSearchFieldBackgroundColor};
    border-radius: ${themeDimensions.borderRadius};
    border: 1px solid ${lightThemeColors.marketsSearchFieldBorderColor};
    color: ${lightThemeColors.marketsSearchFieldTextColor};
    font-size: 13px;
    height: ${searchFieldHeight};
    left: 0;
    outline: none;
    padding: 0 15px 0 30px;
    position: absolute;
    top: 0;
    width: ${searchFieldWidth};
    z-index: 1;

    &:focus {
        border-color: ${lightThemeColors.marketsSearchFieldBorderColor};
    }
`;

const MagnifierIconWrapper = styled.div`
    line-height: 30px;
    height: 100%;
    left: 11px;
    position: absolute;
    top: 0;
    width: 14px;
    z-index: 12;
`;

const TableWrapper = styled.div`
    max-height: 420px;
    overflow: auto;
    position: relative;
`;

const verticalCellPadding = `
    padding-bottom: 10px;
    padding-top: 10px;
`;

const tableHeaderFontWeight = `
    font-weight: 700;
`;

const TRStyled = styled(TR) <{ active: boolean }>`
    background-color: ${props => props.active ? lightThemeColors.rowActive : 'transparent'};
    cursor: ${props => (props.active ? 'default' : 'pointer')};

    &:hover {
        background-color: ${lightThemeColors.rowActive};
    }

    &:last-child > td {
        border-bottom-left-radius: ${themeDimensions.borderRadius};
        border-bottom-right-radius: ${themeDimensions.borderRadius};
        border-bottom: none;
    }
`;

// Has a special left-padding: needs a specific selector to override the theme
const THFirstStyled = styled(THFirst)`
    ${verticalCellPadding}
    ${tableHeaderFontWeight}

    &, &:last-child {
        padding-left: 21.6px;
    }
`;

const THLastStyled = styled(THLast)`
    ${verticalCellPadding};
    ${tableHeaderFontWeight}
`;

const CustomTDFirstStyled = styled(CustomTDFirst)`
    ${verticalCellPadding};
`;

const CustomTDLastStyled = styled(CustomTDLast)`
    ${verticalCellPadding};
`;

const TokenIconAndLabel = styled.div`
    align-items: center;
    display: flex;
    justify-content: flex-start;
`;

const TokenLabel = styled.div`
    color: ${lightThemeColors.textColorCommon};
    font-size: 14px;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 0 12px;
`;

const DropdownTokenIcon = styled<any>(TokenIcon)`
    margin-right: 10px;
    vertical-align: top;
`;
const TokenIconStyled = styled<any>(TokenIcon)``;

const MarketsDropdown: React.FC<PropsDivElement> = props => {
    const [selectedFilter, setSelectedFilter] = useState<Filter>(marketFilters[0]);
    const [search, setSearch] = useState('');
    const [isUserOnDropdown, setIsUserOnDropdown] = useState(false);
    const dropdownRef = useRef<DropdownRef>(null);

    const { baseToken, currencyPair, markets, setCurrencyPair } = useErc20Store();

    const setUserOnDropdown = () => {
        setIsUserOnDropdown(true);
    };
    const removeUserOnDropdown = () => {
        setIsUserOnDropdown(false);
    };

    const setTokensFilterTab = (filter: Filter) => {
        setSelectedFilter(filter);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.currentTarget.value);
    };

    const setSelectedMarket = (pair: CurrencyPair) => {
        setCurrencyPair(pair);
        if (dropdownRef.current) {
            dropdownRef.current.closeDropdown();
        }
    };

    const getPrice = (market: Market) => {
        if (market.price) {
            return market.price.toFixed(UI_DECIMALS_DISPLAYED_PRICE_ETH);
        }
        return '-';
    };

    const getTokensFilterTabs = () => {
        return (
            <TokenFiltersTabs>
                {marketFilters.map((filter: Filter, index) => (
                    <TokenFiltersTab
                        active={filter === selectedFilter}
                        key={index}
                        onClick={() => setTokensFilterTab(filter)}
                    >
                        {filter.text}
                    </TokenFiltersTab>
                ))}
            </TokenFiltersTabs>
        );
    };

    const getSearchField = () => {
        return (
            <SearchWrapper>
                <MagnifierIconWrapper>{MagnifierIcon()}</MagnifierIconWrapper>
                <SearchField onChange={handleChange} value={search} />
            </SearchWrapper>
        );
    };

    const getMarketsList = () => {
        if (!baseToken || !markets || !currencyPair) {
            return null;
        }

        const filteredMarkets = selectedFilter.value === null ? markets : filterMarketsByTokenSymbol(markets, selectedFilter.value);
        const searchedMarkets = filterMarketsByString(filteredMarkets, search);

        return (
            <Table>
                <THead>
                    <TR>
                        <THFirstStyled styles={{ textAlign: 'left' }}>Market</THFirstStyled>
                        <THLastStyled styles={{ textAlign: 'center' }}>Price</THLastStyled>
                    </TR>
                </THead>
                <TBody>
                    {searchedMarkets.map((market, index) => {
                        const isActive =
                            market.currencyPair.base === currencyPair.base &&
                            market.currencyPair.quote === currencyPair.quote;
                        const token = getKnownTokens().getTokenBySymbol(market.currencyPair.base);
                        const baseSymbol = market.currencyPair.base.toUpperCase();
                        const quoteSymbol = market.currencyPair.quote.toUpperCase();

                        return (
                            <TRStyled active={isActive} key={index} onClick={() => setSelectedMarket(market.currencyPair)}>
                                <CustomTDFirstStyled styles={{ textAlign: 'left', borderBottom: true }}>
                                    <TokenIconAndLabel>
                                        <TokenIconStyled symbol={token.symbol} primaryColor={token.primaryColor} icon={token.icon} />
                                        <TokenLabel>
                                            {baseSymbol} / {quoteSymbol}
                                        </TokenLabel>
                                    </TokenIconAndLabel>
                                </CustomTDFirstStyled>
                                <CustomTDLastStyled styles={{ textAlign: 'center', borderBottom: true, tabular: true }}>
                                    {getPrice(market)}
                                </CustomTDLastStyled>
                            </TRStyled>
                        );
                    })}
                </TBody>
            </Table>
        );
    };

    const header = (
        <MarketsDropdownHeader>
            <MarketsDropdownHeaderText>
                {baseToken ? (
                    <DropdownTokenIcon
                        symbol={baseToken.symbol}
                        primaryColor={baseToken.primaryColor}
                        isInline={true}
                        icon={baseToken.icon}
                    />
                ) : null}
                {currencyPair ? `${currencyPair.base.toUpperCase()}/${currencyPair.quote.toUpperCase()}` : ''}
            </MarketsDropdownHeaderText>
            <ChevronDownIcon />
        </MarketsDropdownHeader>
    );

    const body = (
        <MarketsDropdownBody>
            <MarketsFilters onMouseOver={setUserOnDropdown} onMouseOut={removeUserOnDropdown}>
                <MarketsFiltersLabel>Markets</MarketsFiltersLabel>
                {getTokensFilterTabs()}
                {getSearchField()}
            </MarketsFilters>
            <TableWrapper>{getMarketsList()}</TableWrapper>
        </MarketsDropdownBody>
    );

    return (
        <MarketsDropdownWrapper
            body={body}
            header={header}
            ref={dropdownRef}
            shouldCloseDropdownOnClickOutside={!isUserOnDropdown}
            {...props}
        />
    );
};

const MarketsDropdownContainer = React.memo(MarketsDropdown);

export { MarketsDropdown, MarketsDropdownContainer };
