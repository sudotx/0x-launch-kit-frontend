import { BigNumber } from '@0x/utils';
import { OrderBook, OrderSide, Token, UIOrder } from '../util/types';
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
    address: '0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c',
    decimals: 18,
    displayDecimals: 2
};

export const mockQuoteToken: Token = {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    primaryColor: '#3333ff',
    icon: 'assets/icons/weth.svg',
    address: '0x0b1ba0af832d7c05fd64161e0db78e85978e8082',
    decimals: 18,
    displayDecimals: 2
};

export const mockSpread = new BigNumber('100000000000000000'); // 0.1 ETH
export const mockSpreadPercentage = new BigNumber('5'); // 5%

const zrxAssetData = '0xf47261b0000000000000000000000000871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c';
const wethAssetData = '0xf47261b00000000000000000000000000b1ba0af832d7c05fd64161e0db78e85978e8082';

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
