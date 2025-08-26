import { ethers } from "ethers";
import { sleep } from "../util/sleep";

let provider: ethers.providers.Web3Provider | null = null;
let signer: ethers.Signer | null = null;

export const isMetamaskInstalled = (): boolean => {
    const { ethereum } = window as any;
    return Boolean(ethereum && ethereum.isMetaMask);
};

export const initializeProvider = async (): Promise<ethers.providers.Web3Provider | null> => {
    const { ethereum, location } = window as any;

    if (provider) {
        return provider;
    }

    if (ethereum) {
        try {
            // Create ethers provider
            provider = new ethers.providers.Web3Provider(ethereum);

            // Request account access
            await provider.send("eth_requestAccounts", []);

            // Get signer
            signer = await provider.getSigner();

            // Register listeners
            ethereum.on("accountsChanged", () => {
                location.reload();
            });
            ethereum.on("chainChanged", () => {
                location.reload();
            });

            return provider;
        } catch (error) {
            console.error("User denied account access or error:", error);
            return null;
        }
    } else {
        // The user does not have MetaMask installed
        return null;
    }
};

export const getProvider = async (): Promise<ethers.providers.Web3Provider> => {
    while (!provider) {
        await sleep(100);
    }
    return provider!;
};

export const getSigner = async (): Promise<ethers.Signer> => {
    while (!signer) {
        await sleep(100);
    }
    return signer!;
};
