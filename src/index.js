const fs = require('fs');
const path = require('path');
const axios = require('axios');
const app = require('express')();
const whiteList = require('../config/white-list.json');

const broadCast = (method, path, proxyPort, routerURL) => {
    console.log('Method: \x1b[34m', method, path);
    console.log('Proxy port is: \x1b[32m', `:${proxyPort}`);
    console.log('Redirect to: \x1b[32m', routerURL);
};

const endBoradCast = () => {
    console.log('-------------------------------\n');
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

app.use((req, res, next) => {
    console.log('\x1b[36mThe request has entered.');
    console.log('===============================');
    next();
});

// pac文件自动配置
app.all('/mobileH5V2-proxy.pac', (req, res) => {
    const pacPath = path.join(__dirname, '..', 'config/proxy.pac');
    fs.readFile(pacPath, 'utf8', (err, data) => {
        if (err) throw err;
        res.send(data);
    });
    console.log('pac file is being configured..');
    endBoradCast();
});

// 监听MobileH5V2服务
app.all(/^\/mobileH5/, (req, res) => {
    const path = req.path;
    let proxyPort = whiteList[path];
    if (proxyPort === void 0) proxyPort = 80;
    let searchParams = getSearchParams(req.query);
    // let routerURL = new URL(`${req.protocol}://10.8.8.8:9050${req.path}${searchParams}`); // for test.
    let routerURL = new URL(`${req.protocol}://${req.headers.host}${req.path}${searchParams}`);
    routerURL.port = proxyPort; // change the port.
    broadCast(req.method, path, proxyPort, routerURL.href);
    axios.get(routerURL.href).then(response => {
        const targetHtmlData = response.data.replace(/src=\//mg, 'src=/9050/').replace(/href=\//mg, 'href=/9050/');
        res.send(targetHtmlData);
    }).catch(error => {
        console.error(error);
    });
    endBoradCast();
});

// 非mobileH5V2服务直接转发至80服务
app.use('/', (req, res) => {
    console.log('This path is not from /MobileH5: \x1b[31m', req.originalUrl);
    broadCast(req.method, req.path, 'original port', req.originalUrl);
    let url = null;
    if (req.path.slice(1, 3) === '90') {
        url = `${req.protocol}://10.8.8.8:${req.path.slice(1, 5)}${req.path.slice(5)}`;
    } else {
        url = `${req.protocol}://10.8.8.8${req.path}`;
    }
    axios({
        url,
        method: 'GET',
        responseType: 'stream'
    }).then(response => {
        const contentType = response.headers['content-type'];
        res.format({
            [contentType]: () => {
                res.set('Proxy-Connection', 'keep-alive');
                response.data.pipe(res);
            }
        });
    }).catch(error => {
        console.error(error);
        if (!!error.response === true) {
            res.sendStatus(error.response.status);
        }
    });
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