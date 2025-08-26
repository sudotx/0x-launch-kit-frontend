import { ContractWrappers } from '@0x/contract-wrappers';

import { CHAIN_ID } from '../common/constants';

import { getProvider } from './web3_wrapper';

let contractWrappers: ContractWrappers;

export const getContractWrappers = async (): Promise<ContractWrappers> => {
    if (!contractWrappers) {
        const ethersProvider = await getProvider();
        const eip1193Provider = (ethersProvider as any).provider;
        contractWrappers = new ContractWrappers(eip1193Provider, { chainId: CHAIN_ID });
    }

    return contractWrappers;
};