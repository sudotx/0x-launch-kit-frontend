import { BigNumber } from '@0x/utils';

const ETH_MARKET_PRICE_API_ENDPOINT = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';

export const getMarketPriceEther = async (): Promise<BigNumber> => {
    const promisePriceEtherResolved = await fetch(ETH_MARKET_PRICE_API_ENDPOINT);
    if (promisePriceEtherResolved.status === 200) {
        const data = await promisePriceEtherResolved.json();
        if (data && data.ethereum && data.ethereum.usd) {
            return new BigNumber(data.ethereum.usd);
        }
    }

    return Promise.reject('Could not get ETH price');
};
