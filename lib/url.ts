import qs from "query-string"

interface UrlQueryParams {
    params: string;
    key: string;
    value: string;
}

interface RemoveUrlQueryParams {
    params: string;
    keysToRemove: string[];
}

export const  formUrlQuery = ({ params, key, value} : UrlQueryParams) => {
    const { query } = qs.parseUrl(params)
    query[key] = value;
    return qs.stringifyUrl({
        url: window.location.pathname,
        query,
    })
}

export const removekeysFromQuery = ({ params, keysToRemove} : RemoveUrlQueryParams) => {
    const { query } = qs.parseUrl(params)
    keysToRemove.forEach((key) => {
        delete query[key];
    })
    return qs.stringifyUrl({
        url: window.location.pathname,
        query,
    }, { 
        skipNull: true
    })
}