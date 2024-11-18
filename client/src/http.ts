import { Api } from './Api.ts';
import { tokenStorage, TOKEN_KEY } from "./atoms";

export const baseUrl = import.meta.env.VITE_APP_BASE_API_URL

export const api = new Api({
    baseURL: baseUrl,
    headers: {
        "Prefer": "return=representation"
    }
});

const AUTHORIZE_ORIGIN = "/";

api.instance.interceptors.request.use((config) => {
    const jwt = tokenStorage.getItem(TOKEN_KEY, null);
    
    if (jwt && config.url?.startsWith(AUTHORIZE_ORIGIN)) {
        config.headers.Authorization = `Bearer ${jwt}`;
    }
    
    return config;
});