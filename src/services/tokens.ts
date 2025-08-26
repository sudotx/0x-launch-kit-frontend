import { ERC20TokenContract } from '@0x/contract-wrappers';
import { BigNumber } from '@0x/utils';

import { Token, TokenBalance } from '../util/types';

import { getContractWrappers } from './contract_wrappers';

export const tokensToTokenBalances = async (tokens: Token[], address: string): Promise<TokenBalance[]> => {
    const contractWrappers = await getContractWrappers();
    const provider = contractWrappers.getProvider();
    const spender = contractWrappers.contractAddresses.exchangeProxy;

    const results = await Promise.all(
        tokens.map(async t => {
            const erc20 = new ERC20TokenContract(t.address, provider);
            const [balance, allowance] = await Promise.all([
                erc20.balanceOf(address).callAsync(),
                erc20.allowance(address, spender).callAsync(),
            ]);
            const tokenBalance: TokenBalance = {
                token: t,
                balance,
                isUnlocked: allowance.isGreaterThan(0),
            };
            return tokenBalance;
        }),
    );

    return results;
};
export const tokenToTokenBalance = async (token: Token, address: string): Promise<TokenBalance> => {
    const [tokenBalance] = await tokensToTokenBalances([token], address);
    return tokenBalance;
};

export const getTokenBalance = async (token: Token, address: string): Promise<BigNumber> => {
    const balance = await tokenToTokenBalance(token, address);
    return balance.balance;
};