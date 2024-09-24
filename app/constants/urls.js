//export const serverDomain = 'https://flowserver2.lerry.site';
export const serverDomain = 'http://192.168.0.104:3000';

export const urls = {
    signup: `${serverDomain}/api/users`,
    signin: `${serverDomain}/api/users/auth`,
    newplayer: `${serverDomain}/api/players/add`,
    getplayers: `${serverDomain}/api/players`,
    getplayer: `${serverDomain}/api/players/player`,
    borrowpay: `${serverDomain}/api/records/record`,
    gettransactions: `${serverDomain}/api/transactions/player`,
    search: `${serverDomain}/api/players/search`,
    history: `${serverDomain}/api/transactions/`,
    getpnl: `${serverDomain}/api/pnl/get`,
    newpnl: `${serverDomain}/api/pnl/add`,
    getselectedpnl: `${serverDomain}/api/pnl/selected`,
    updatepnl: `${serverDomain}/api/pnl/update`,
    deletepnl: `${serverDomain}/api/pnl/delete`,
    monthoperations: `${serverDomain}/api/pnl/monthoperations`,
    overall: `${serverDomain}/api/pnl/overall`,
    nettoday: `${serverDomain}/api/pnl/nettoday`,
}
