import { useEffect } from 'react';
import { store } from '../store';

export const useReducerInjection = (key: string, reducer: any) => {
    useEffect(() => {
        store.injectReducer(key, reducer);
    }, [key, reducer]);
};
