const app = require('express')();
const whiteList = require('../config/white-list.json');

const broadCast = (method, path, proxyPort, routerURL) => {
    console.log('Method: \x1b[34m', method, path);
    console.log('Proxy port is: \x1b[32m', `:${proxyPort}`);
    console.log('Redirect to: \x1b[32m', routerURL);
};

const endBoradCast = () => {
    console.log('----------------------------------');
}

app.use((req, res, next) => {
    console.log('The request has entered.');
    console.log('------------------------\\______\n');
    next();
});

// 监听MobileH5V2服务
app.all(/\/mobileH5/, (req, res) => {
    const path = req.path;
    const proxyPort = whiteList[path];
    const originalUrl = req.originalUrl;
    const routerURL = `http://10.8.8.8:${proxyPort}${originalUrl}`;
    broadCast(req.method, path, proxyPort, routerURL);
    res.redirect(routerURL);
    endBoradCast();
});

// 非mobileH5V2服务直接转发至80服务
app.use('/*', (req, res) => {
    console.log('This path is not from /MobileH5: \x1b[31m', req.originalUrl);
    const originalUrl = req.originalUrl;
    const routerURL = `https://test.yangcong345.com${originalUrl}`;
    broadCast(req.method, req.path, '80', routerURL);
    res.redirect(routerURL);
    endBoradCast();
});

app.listen(61234, () => {
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
    console.log('\n\x1b[32mProxy server listen on port: \x1b[34m', '61234');
});