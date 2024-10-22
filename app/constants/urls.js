//export const serverDomain = 'https://flowserver.lerry.site';
export const serverDomain = 'http://192.168.0.104:3000';

export const urls = {
    signup: `${serverDomain}/api/users`,
    signin: `${serverDomain}/api/users/auth`,
    newplayer: `${serverDomain}/api/players/add`,
    getplayers: `${serverDomain}/api/players`,
    getplayer: `${serverDomain}/api/players/player`,
    borrowpay: `${serverDomain}/api/records/record`,
    gettransactions: `${serverDomain}/api/transactions/player`,
    deletetransaction: `${serverDomain}/api/transactions/`,
    search: `${serverDomain}/api/players/search`,
    history: `${serverDomain}/api/transactions/`,
    getpnl: `${serverDomain}/api/pnl/get`,
    newrevenue: `${serverDomain}/api/pnl/add/revenue`,
    newexpense: `${serverDomain}/api/pnl/add/expense`,
    newx: `${serverDomain}/api/pnl/add/x`,
    getselectedpnl: `${serverDomain}/api/pnl/selected`,
    updatepnl: `${serverDomain}/api/pnl/update`,
    deletepnl: `${serverDomain}/api/pnl/delete`,
    monthoperations: `${serverDomain}/api/pnl/monthoperations`,
    overall: `${serverDomain}/api/pnl/overall`,
    lastnet: `${serverDomain}/api/pnl/lastnet`,
}
