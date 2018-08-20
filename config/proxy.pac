function FindProxyForURL(url, host) {
    return isInNet(dnsResolve(host), "10.8.8.8", "255.255.255.255") ? "PROXY 10.8.8.8:61234" : "DIRECT";
}