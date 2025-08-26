import { isAnyOf, Middleware } from '@reduxjs/toolkit';
import { LocalStorage } from '../services/local_storage';
import { getEthAccount, getHasUnreadNotifications, getNotifications } from './selectors';
import { addNotifications, setHasUnreadNotifications, setNotifications } from './ui/reducers';

const localStorage = new LocalStorage(window.localStorage);

export const localStorageMiddleware: Middleware = ({ getState }) => (next) => (action) => {
    const result = next(action);

    // Save when notifications are changed or unread flag updates
    if (
        isAnyOf(
            setHasUnreadNotifications,
            addNotifications
        )(action)
    ) {
        const state = getState();
        const ethAccount = getEthAccount(state);
        const notifications = getNotifications(state);
        const hasUnreadNotifications = getHasUnreadNotifications(state);

        localStorage.saveNotifications(notifications, ethAccount);
        localStorage.saveHasUnreadNotifications(hasUnreadNotifications, ethAccount);
    }

    // Save when notifications list is replaced
    if (setNotifications.match(action)) {
        const state = getState();
        const ethAccount = getEthAccount(state);
        const notifications = getNotifications(state);

        localStorage.saveNotifications(notifications, ethAccount);
    }

    return result;
};
