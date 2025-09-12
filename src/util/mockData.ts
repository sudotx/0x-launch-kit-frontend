import { BigNumber } from '@0x/utils';
import { Collectible, CurrencyPair, Market, OrderBook, OrderSide, Token, UIOrder } from './types';
import { OrderStatus } from '@0x/types';
import { SignedOrder } from '@0x/connect';

export const mockOrderBook: OrderBook = {
    buyOrders: [
        {
            price: new BigNumber('2000000000000000000'), // 2 ETH
            size: new BigNumber('100000000000000000000'), // 100 ZRX
            side: OrderSide.Buy,
        },
        {
            price: new BigNumber('1950000000000000000'), // 1.95 ETH
            size: new BigNumber('50000000000000000000'), // 50 ZRX
            side: OrderSide.Buy,
        },
    ],
    sellOrders: [
        {
            price: new BigNumber('2100000000000000000'), // 2.1 ETH
            size: new BigNumber('75000000000000000000'), // 75 ZRX
            side: OrderSide.Sell,
        },
        {
            price: new BigNumber('2200000000000000000'), // 2.2 ETH
            size: new BigNumber('25000000000000000000'), // 25 ZRX
            side: OrderSide.Sell,
        },
    ],
    mySizeOrders: [],
};

export const mockBaseToken: Token = {
    symbol: 'ZRX',
    name: '0x Protocol Token',
    primaryColor: '#333333',
    icon: 'assets/icons/zrx.svg',
    address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
    decimals: 18,
    displayDecimals: 2
};

export const mockQuoteToken: Token = {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    primaryColor: '#3333ff',
    icon: 'assets/icons/weth.svg',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18,
    displayDecimals: 2
};

export const mockDaiToken: Token = {
    symbol: 'DAI',
    name: 'Dai',
    primaryColor: '#f4b731',
    icon: 'assets/icons/dai.svg',
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    decimals: 18,
    displayDecimals: 2,
};

export const mockRepToken: Token = {
    symbol: 'REP',
    name: 'Augur',
    primaryColor: '#4b384e',
    icon: 'assets/icons/rep.svg',
    address: '0x1985365e9f78359a9B6AD760e32412f4a445E862',
    decimals: 18,
    displayDecimals: 2,
};

export const mockCurrencyPair: CurrencyPair = {
    base: 'ZRX',
    quote: 'WETH',
};

export const mockMarkets: Market[] = [
    {
        currencyPair: { base: 'ZRX', quote: 'WETH' },
        price: new BigNumber('0.0005'),
    },
    {
        currencyPair: { base: 'REP', quote: 'WETH' },
        price: new BigNumber('0.008'),
    },
    {
        currencyPair: { base: 'ZRX', quote: 'DAI' },
        price: new BigNumber('2'),
    },
];

export const mockSpread = new BigNumber('100000000000000000'); // 0.1 ETH
export const mockSpreadPercentage = new BigNumber('5'); // 5%

const zrxAssetData = '0xf47261b0000000000000000000000000E41d2489571d322189246DaFA5ebDe1F4699F498';
const wethAssetData = '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

const partialSignedOrder: Omit<SignedOrder, 'signature' | 'makerAssetAmount' | 'takerAssetAmount' | 'makerAssetData' | 'takerAssetData' | 'salt'> = {
    senderAddress: '0x0000000000000000000000000000000000000000',
    makerAddress: '0x0000000000000000000000000000000000000000',
    takerAddress: '0x0000000000000000000000000000000000000000',
    makerFee: new BigNumber(0),
    takerFee: new BigNumber(0),
    makerFeeAssetData: '0x',
    takerFeeAssetData: '0x',
    exchangeAddress: '0x48bacb9266a570d521063ef5dd96e616862e5881',
    feeRecipientAddress: '0x1000000000000000000000000000000000000001',
    expirationTimeSeconds: new BigNumber(Math.floor(Date.now() / 1000) + 3600),
    chainId: 1
};

export const mockUserOrders: UIOrder[] = [
    {
        rawOrder: {
            ...partialSignedOrder,
            makerAssetData: zrxAssetData,
            takerAssetData: wethAssetData,
            makerAssetAmount: new BigNumber('100000000000000000000'), // 100 ZRX
            takerAssetAmount: new BigNumber('200000000000000000000'), // 200 WETH
            salt: new BigNumber('1'),
            signature: '0x'
        },
        side: OrderSide.Sell,
        size: new BigNumber('100000000000000000000'), // 100 ZRX
        filled: new BigNumber('50000000000000000000'), // 50 ZRX
        price: new BigNumber('2'), // Price of 1 ZRX is 2 WETH
        status: OrderStatus.Fillable,
    },
    {
        rawOrder: {
            ...partialSignedOrder,
            makerAssetData: wethAssetData,
            takerAssetData: zrxAssetData,
            makerAssetAmount: new BigNumber('97500000000000000000'), // 97.5 WETH
            takerAssetAmount: new BigNumber('50000000000000000000'), // 50 ZRX
            salt: new BigNumber('2'),
            signature: '0x'
        },
        side: OrderSide.Buy,
        size: new BigNumber('50000000000000000000'), // 50 ZRX
        filled: new BigNumber('0'),
        price: new BigNumber('1.95'), // Price of 1 ZRX is 1.95 WETH
        status: OrderStatus.Fillable,
    },
    {
        rawOrder: {
            ...partialSignedOrder,
            makerAssetData: zrxAssetData,
            takerAssetData: wethAssetData,
            makerAssetAmount: new BigNumber('75000000000000000000'), // 75 ZRX
            takerAssetAmount: new BigNumber('157500000000000000000'), // 157.5 WETH
            salt: new BigNumber('3'),
            signature: '0x'
        },
        side: OrderSide.Sell,
        size: new BigNumber('75000000000000000000'), // 75 ZRX
        filled: new BigNumber('75000000000000000000'), // 75 ZRX
        price: new BigNumber('2.1'),
        status: OrderStatus.FullyFilled,
    },
];

export const mockOpenBuyOrders: UIOrder[] = [
    {
        rawOrder: {
            ...partialSignedOrder,
            makerAssetData: wethAssetData, // Maker is giving WETH
            takerAssetData: zrxAssetData,  // Taker is giving ZRX
            makerAssetAmount: new BigNumber('19000000000000000000'), // 19 WETH
            takerAssetAmount: new BigNumber('10000000000000000000'), // 10 ZRX
            salt: new BigNumber('101'),
            signature: '0x'
        },
        side: OrderSide.Buy,
        size: new BigNumber('10000000000000000000'), // 10 ZRX
        filled: new BigNumber('0'),
        price: new BigNumber('1.9'), // Price of 1 ZRX is 1.9 WETH
        status: OrderStatus.Fillable,
    },
    {
        rawOrder: {
            ...partialSignedOrder,
            makerAssetData: wethAssetData,
            takerAssetData: zrxAssetData,
            makerAssetAmount: new BigNumber('36000000000000000000'), // 36 WETH
            takerAssetAmount: new BigNumber('20000000000000000000'), // 20 ZRX
            salt: new BigNumber('102'),
            signature: '0x'
        },
        side: OrderSide.Buy,
        size: new BigNumber('20000000000000000000'), // 20 ZRX
        filled: new BigNumber('5000000000000000000'), // 5 ZRX filled
        price: new BigNumber('1.8'), // Price of 1 ZRX is 1.8 WETH
        status: OrderStatus.Fillable,
    },
];

export const mockOpenSellOrders: UIOrder[] = [
    {
        rawOrder: {
            ...partialSignedOrder,
            makerAssetData: zrxAssetData, // Maker is giving ZRX
            takerAssetData: wethAssetData, // Taker is giving WETH
            makerAssetAmount: new BigNumber('15000000000000000000'), // 15 ZRX
            takerAssetAmount: new BigNumber('31500000000000000000'), // 31.5 WETH
            salt: new BigNumber('103'),
            signature: '0x'
        },
        side: OrderSide.Sell,
        size: new BigNumber('15000000000000000000'), // 15 ZRX
        filled: new BigNumber('0'),
        price: new BigNumber('2.1'), // Price of 1 ZRX is 2.1 WETH
        status: OrderStatus.Fillable,
    },
    {
        rawOrder: {
            ...partialSignedOrder,
            makerAssetData: zrxAssetData,
            takerAssetData: wethAssetData,
            makerAssetAmount: new BigNumber('25000000000000000000'), // 25 ZRX
            takerAssetAmount: new BigNumber('55000000000000000000'), // 55 WETH
            salt: new BigNumber('104'),
            signature: '0x'
        },
        side: OrderSide.Sell,
        size: new BigNumber('25000000000000000000'), // 25 ZRX
        filled: new BigNumber('10000000000000000000'), // 10 ZRX filled
        price: new BigNumber('2.2'), // Price of 1 ZRX is 2.2 WETH
        status: OrderStatus.Fillable,
    },
];

export const mockCollectible: Collectible = {
    name: 'CryptoKitty',
    color: '#f0f0f0',
    image: 'https://www.cryptokitties.co/images/kitty-eth.svg',
    order: {
        ...partialSignedOrder,
        makerAssetData: zrxAssetData,
        takerAssetData: wethAssetData,
        makerAssetAmount: new BigNumber('1000000000000000000'), // 1 ETH
        takerAssetAmount: new BigNumber('1'),
        salt: new BigNumber('4'),
        signature: '0x'
    },
    tokenId: '1',
    assetUrl: '',
    currentOwner: '',
    description: ''
};

export const mockCollectible2: Collectible = {
    name: 'Another Kitty',
    color: '#f0f0f0',
    image: 'https://www.cryptokitties.co/images/kitty-eth.svg',
    order: {
        ...partialSignedOrder,
        makerAssetData: zrxAssetData,
        takerAssetData: wethAssetData,
        makerAssetAmount: new BigNumber('2000000000000000000'), // 2 ETH
        takerAssetAmount: new BigNumber('1'),
        salt: new BigNumber('5'),
        signature: '0x'
    },
    tokenId: '2',
    assetUrl: '',
    currentOwner: '',
    description: ''
};

export const mockCollectible3: Collectible = {
    name: 'Third Kitty',
    color: '#f0f0f0',
    image: 'https://www.cryptokitties.co/images/kitty-eth.svg',
    order: null,
    tokenId: '3',
    assetUrl: '',
    currentOwner: '',
    description: ''
};

export const mockCollectibles: Collectible[] = [mockCollectible, mockCollectible2, mockCollectible3];

export const mockCollectiblesMap: { [key: string]: Collectible } = {
    '1': mockCollectible,
    '2': mockCollectible2,
    '3': mockCollectible3,
};

export const mockTokensConfig = [
    {
        "symbol": "zrx",
        "name": "0x Protocol Token",
        "primaryColor": "#333333",
        "icon": "assets/icons/zrx.svg",
        "addresses": {
            "1": "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
            "3": "0xff67881f8d12f372d91baae9752eb3631ff0ed00",
            "4": "0x8080c7e4b81ecf23aa6f877cfbfd9b0c228c6ffa",
            "42": "0x2002d3812f58e35f0ea1ffbf80a75a38c32175fa",
            "50": "0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c"
        },
        "decimals": 18,
        "displayDecimals": 2
    },
    {
        "symbol": "weth",
        "name": "Wrapped Ether",
        "primaryColor": "#3333ff",
        "icon": "assets/icons/weth.svg",
        "addresses": {
            "1": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "3": "0xc778417e063141139fce010982780140aa0cd5ab",
            "4": "0xc778417e063141139fce010982780140aa0cd5ab",
            "42": "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
            "50": "0x0b1ba0af832d7c05fd64161e0db78e85978e8082"
        },
        "decimals": 18,
        "displayDecimals": 2
    },
    {
        "decimals": 18,
        "symbol": "dai",
        "name": "Dai",
        "icon": "assets/icons/dai.svg",
        "primaryColor": "#DEA349",
        "addresses": {
            "1": "0x6b175474e89094c44da98b954eedeac495271d0f",
            "3": "0xfc8862446cd3e4a2e7167e7d97df738407fead07",
            "4": "0x6f2d6ff85efca691aad23d549771160a12f0a0fc",
            "42": "0xc4375b7de8af5a38a93548eb8453a498222c4ff2",
            "50": "0x34d402f14d58e001d8efbe6585051bf9706aa064"
        }
    },
    {
        "decimals": 18,
        "symbol": "mkr",
        "name": "Maker",
        "primaryColor": "#68CCBB",
        "icon": "assets/icons/mkr.svg",
        "addresses": {
            "1": "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
            "3": "0x06732516acd125b6e83c127752ed5f027e1b276e",
            "4": "0xb763e26cd6dd09d16f52dc3c60ebb77e46b03290",
            "42": "0x7B6B10CAa9E8E9552bA72638eA5b47c25afea1f3",
            "50": "0x34d402f14d58e001d8efbe6585051bf9706aa064"
        }
    },
    {
        "decimals": 18,
        "symbol": "rep",
        "name": "Augur",
        "icon": "assets/icons/rep.svg",
        "primaryColor": "#512D80",
        "addresses": {
            "1": "0x1985365e9f78359a9B6AD760e32412f4a445E862",
            "3": "0xb0b443fe0e8a04c4c85e8fda9c5c1ccc057d6653",
            "4": "0x6a732d537daf79d75efaeae286d30fc578fa98d0",
            "42": "0x8CB3971b8EB709C14616BD556Ff6683019E90d9C",
            "50": "0x25b8fe1de9daf8ba351890744ff28cf7dfa8f5e3"
        }
    },
    {
        "decimals": 9,
        "symbol": "dgx",
        "name": "DigixDao",
        "icon": "assets/icons/dgx.svg",
        "primaryColor": "#E1AA3E",
        "addresses": {
            "1": "0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A",
            "3": "0xc4895a5aafa2708d6bc1294e20ec839aad156b1d",
            "4": "0xc40a46ca4bc8e6057ed571e39cf400f3f935e4d5",
            "42": "0xA4f468c9c692eb6B4b8b06270dAe7A2CfeedcDe9",
            "50": "0xcdb594a32b1cc3479d8746279712c39d18a07fc0"
        }
    },
    {
        "decimals": 18,
        "symbol": "mln",
        "name": "Melon",
        "icon": "assets/icons/mln.svg",
        "primaryColor": "#333333",
        "addresses": {
            "1": "0xec67005c4E498Ec7f55E092bd1d35cbC47C91892",
            "3": "0x823ebe83d39115536274a8617e00a1ff3544fd63",
            "4": "0x521c0941300a18a4edc697368f43a6a870be1f3d",
            "42": "0x17e394D1Df6cE29d042195Ea38411A98ff3Ead94",
            "50": "0x1e2f9e10d02a6b8f8f69fcbf515e75039d2ea30d"
        }
    }
];

export const mockPairsConfig = [
    {
        "base": "zrx",
        "quote": "weth"
    },
    {
        "base": "zrx",
        "quote": "dai"
    },
    {
        "base": "weth",
        "quote": "dai"
    },
    {
        "base": "mkr",
        "quote": "weth"
    },
    {
        "base": "mln",
        "quote": "weth"
    },
    {
        "base": "dgx",
        "quote": "weth"
    },
    {
        "base": "rep",
        "quote": "weth"
    }
];

export const mockMarketFiltersConfig = [
    {
        "text": "ETH",
        "value": "weth"
    },
    {
        "text": "DAI",
        "value": "dai"
    }
];

export const mockConfigFile = {
    general: {
        title: 'Launch Kit',
    },
    tokens: mockTokensConfig,
    pairs: mockPairsConfig,
    marketFilters: mockMarketFiltersConfig,
};
