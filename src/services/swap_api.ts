import { BigNumber } from '@0x/utils';
import axios, { AxiosInstance } from 'axios';

const API_URL = 'https://api.0x.org/swap/v1';
const API_KEY = process.env.DOTEXCHANGE_API_KEY;

type BaseParams = {
    buyToken: string;
    sellToken: string;
    takerAddress?: string;
    chainId?: number; // 0x supports multiple chains
};

// Enforce exactly one of buyAmount or sellAmount
export type QuoteParams =
    | (BaseParams & { sellAmount: string; buyAmount?: never })
    | (BaseParams & { buyAmount: string; sellAmount?: never });

export type PriceParams = QuoteParams;

export interface QuoteResponse {
    price: string;
    guaranteedPrice: string;
    to: string;
    data: string;
    value: string;
    gas: string;
    gasPrice: string;
    protocolFee: string;
    buyTokenAddress: string;
    sellTokenAddress: string;
    buyAmount: string;
    sellAmount: string;
    sources: { name: string; proportion: string }[];
    orders: any[]; // Replace with a more specific type if you have one
    allowanceTarget: string;
    sellTokenToEthRate: string;
    buyTokenToEthRate: string;
    [key: string]: any;
}

export interface PriceResponse {
    price: string;
    buyAmount: string;
    sellAmount: string;
    sources: { name: string; proportion: string }[];
    gasPrice: string;
    estimatedGas: string;
    protocolFee: string;
    minimumProtocolFee: string;
    [key: string]: any;
}

export class SwapApi {
    private readonly _client: AxiosInstance;

    constructor(apiKey?: string) {
        this._client = axios.create({
            baseURL: API_URL,
            headers: {
                "Content-Type": "application/json",
                ...(apiKey ? { "0x-api-key": apiKey } : {}),
                "0x-version": "v2",
            },
        });
    }

    public async getQuoteAsync(params: QuoteParams): Promise<QuoteResponse> {
        try {
            const res = await this._client.get<QuoteResponse>("/quote", { params });
            return res.data;
        } catch (err: any) {
            throw err;
        }
    }

    public async getPriceAsync(params: PriceParams): Promise<PriceResponse> {
        try {
            const res = await this._client.get<PriceResponse>("/price", { params });
            return res.data;
        } catch (err: any) {
            throw err;
        }
    }

    public static toBaseUnits(amount: string, decimals: number): string {
        return new BigNumber(amount).multipliedBy(new BigNumber(10).pow(decimals)).toFixed(0);
    }

    public static fromBaseUnits(amount: string, decimals: number): string {
        return new BigNumber(amount).dividedBy(new BigNumber(10).pow(decimals)).toString();
    }
}

let swapApi: SwapApi;


export const getSwapApi = (): SwapApi => {
    if (!swapApi) {
        swapApi = new SwapApi(API_KEY);
    }
    return swapApi;
};
