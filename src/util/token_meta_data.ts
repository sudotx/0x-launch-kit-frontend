import { UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION } from '../common/constants';
import { TokenMetaData } from '../common/tokens_meta_data';

import { Token } from './types';

export const getWethTokenFromTokensMetaDataByNetworkId = (
    tokensMetaData: TokenMetaData[],
    networkId: number,
): Token => {
    const tokenMetaData = tokensMetaData.find(t => t.symbol === 'weth');
    if (!tokenMetaData) {
        throw new Error('WETH Token MetaData not found');
    }
    return {
        address: tokenMetaData.addresses[networkId],
        symbol: tokenMetaData.symbol,
        decimals: tokenMetaData.decimals,
        name: tokenMetaData.name,
        primaryColor: tokenMetaData.primaryColor,
        icon: tokenMetaData.icon,
        displayDecimals: tokenMetaData.displayDecimals || UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION,
    };
};

export const mapTokensMetaDataToTokenByNetworkId = (tokensMetaData: TokenMetaData[], networkId: number): Token[] => {
    return tokensMetaData
        .filter(tokenMetaData => tokenMetaData.addresses[networkId])
        .map(
            (tokenMetaData): Token => {
                return {
                    address: tokenMetaData.addresses[networkId],
                    symbol: tokenMetaData.symbol,
                    decimals: tokenMetaData.decimals,
                    name: tokenMetaData.name,
                    primaryColor: tokenMetaData.primaryColor,
                    icon: tokenMetaData.icon,
                    displayDecimals: tokenMetaData.displayDecimals || UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION,
                };
            },
        );
};
