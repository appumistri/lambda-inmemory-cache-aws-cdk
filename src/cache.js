'use strict';

const NodeCache = require("node-cache");
global.myCache;

if (!global.myCache) {
    global.myCache = new NodeCache({ stdTTL: 600, checkperiod: 60, maxKeys: 5000 });
}
