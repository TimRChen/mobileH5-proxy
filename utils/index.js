const broadCast = (method, path, proxyPort, routerURL) => {
    console.log('Method: \x1b[34m', method, path);
    console.log('Proxy port is: \x1b[32m', `:${proxyPort}`);
    console.log('Redirect to: \x1b[32m', routerURL);
};

const endBoradCast = () => {
    console.log('-------------------------------\n');
};

const LOGO = () => {
    console.log(`
    888    888 888888888                                                    
    888    888 888                                                          
    888    888 888                                                          
    8888888888 8888888b.         88888b.  888d888 .d88b.  888  888 888  888 
    888    888       Y88b        888  88b 888P   d88""88b  Y8bd8P  888  888 
    888    888        888 888888 888  888 888    888  888   X88K   888  888 
    888    888 Y88b  d88P        888 d88P 888    Y88..88P .d8""8b. Y88b 888 
    888    888  "Y8888P"         88888P"  888     "Y88P"  888  888  "Y88888 
                                 888                                    888 
                                 888                               Y8b d88P 
                                 888                                "Y88P" `);
};

const getSearchParams = query => {
    let searchParamList = [];
    for (let param in query) {
        if (query.hasOwnProperty(param)) {
            searchParamList.push(`${param}=${encodeURIComponent(query[param])}`);
        }
    }
    return searchParamList.length === 0 ? '' : `?${searchParamList.join('&')}`;
};

module.exports = {
    getSearchParams,
    endBoradCast,
    broadCast,
    LOGO
};