import { createBrowserHistory } from 'history';

export let history;
export default historyConfig => {
    history = createBrowserHistory(historyConfig);
    return history;
};