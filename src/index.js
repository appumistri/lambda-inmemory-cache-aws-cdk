'use strict';

require('./cache');

module.exports.handler = async (event, context) => {
    console.log(JSON.stringify(event));
    console.log(context);

    /* event from event-bridge */
    if (event.source && event.source === "event-bridge") {
        console.log('WarmUP - Lambda is warm!');
        return;
    }

    let cacheAuth;
    const authorization = event.headers && event.headers.Authorization;

    if (authorization && authorization.split(' ').length > 1) {

        cacheAuth = myCache.get(authorization);
        console.log('getting cache value:', cacheAuth);
        if (!cacheAuth) {
            myCache.set(authorization, authorization);
            console.log('setting cache value:', authorization);
        }
    }

    let body = { isCached: false };

    if (cacheAuth) {
        body = { isCached: true, value: cacheAuth };
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(body),
    };

    return response;
};
