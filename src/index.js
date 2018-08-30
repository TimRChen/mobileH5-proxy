const fs = require('fs');
const path = require('path');
const axios = require('axios');
const app = require('express')();
const utils = require('../utils');
const whiteList = require('../config/white-list.json');

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
    utils.endBoradCast();
});

// 监听MobileH5V2服务
app.all(/^\/mobileH5/, (req, res) => {
    const path = req.path;
    let proxyPort = whiteList[path];
    if (proxyPort === void 0) proxyPort = 80;
    let searchParams = utils.getSearchParams(req.query);
    let routerURL = new URL(`${req.protocol}://10.8.8.8:9050${req.path}${searchParams}`); // for test.
    // let routerURL = new URL(`${req.protocol}://${req.headers.host}${req.path}${searchParams}`);
    routerURL.port = proxyPort; // change the port.
    utils.broadCast(req.method, path, proxyPort, routerURL.href);
    axios.get(routerURL.href).then(response => {
        const targetHtmlData = response.data.replace(/src=\//mg, 'src=/9050/').replace(/href=\//mg, 'href=/9050/');
        res.send(targetHtmlData);
    }).catch(error => {
        console.error(`${error.response.status} ${error.response.statusText}`);
    });
    utils.endBoradCast();
});

// 非mobileH5V2服务直接转发至80服务
app.use('/', (req, res) => {
    console.log('This path is not from /MobileH5: \x1b[31m', req.originalUrl);
    let url = null;
    if (req.path.slice(1, 3) === '90') {
        url = `${req.protocol}://10.8.8.8:${req.path.slice(1, 5)}${req.path.slice(5)}`;
    } else {
        url = `${req.protocol}://10.8.8.8${req.path}`;
    }
    utils.broadCast(req.method, req.path, 'original port', url);
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
        console.error(`${error.response.status} ${error.response.statusText}`);
        if (!!error.response === true) {
            res.sendStatus(error.response.status);
        }
    });
    utils.endBoradCast();
});


app.listen(61234, () => {
    utils.LOGO();
    console.log('\n\x1b[32mProxy server listen on port: \x1b[34m', '61234');
});