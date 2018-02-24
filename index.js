(function(a, b, c) {
    /* node_modules/kit/inc/core/defs.sibilant:53:9 */

    return foo(this);
}).bind(this);

var R = require("ramda");

var {Interface} = require("kit-interface");

var {create, extend, mixin, conditional, cond, partiallyApplyAfter} = require("kit/js/util");

var {Interface} = require("kit-interface");

var {EventEmitter, emit, bubble} = require("kit-events");

var {TreeMap} = require("tree-kit"),
    http = require("http"),
    url = require("url");

var parse = (function parse$(path) {
    /* parse src/index.sibilant:13:0 */

    return (function(parsedUrl) {
        /* node_modules/kit/inc/scope.sibilant:12:9 */

        return mixin(parsedUrl, {
            key: parsedUrl.pathname.split("/")
        });
    })(url.parse(path));
});
var handleRouterError = R.curry(((res, e) => {

    res.writeHead(500);
    return res.end(e.message);

}));
var Http = Interface.define("Http", {
    get(config) {

        return (new Promise(((success, fail) => {

            var resolve = success,
                reject = fail;
            return http.get(config, success).on("error", fail);

        })));

    },
    request(config) {

        var request = http.request(config);
        return {
            request,
            response: (new Promise(((success, fail) => {

                var resolve = success,
                    reject = fail;
                return request.on("response", success).on("error", fail);

            })))
        };

    }
});
Http.Request = Interface.define("Http.Request", {
    init(config = this.config) {

        this.config = config;
        return this;

    }
});
Http.Message = Interface.define("Http.Message", {
    init(request = this.request, response = this.response) {

        this.request = request;
        this.response = response;
        return this;

    },
    get url() {

        return parse(this.request.url);

    },
    get path() {

        return this.url.pathname;

    },
    get key() {

        return this.path.split("/");

    }
});
var notFound404 = (function() {
    /* src/middle-ware.sibilant:7:19 */

    return (function() {
        /* src/macros/pipe.sibilant:66:9 */

        arguments[0].statusCode = 404;
        arguments[0].statusMessage = "Not found";
        return arguments[0];
    })(arguments[0].response).end("resource not found.");
});
var MiddleWare = Interface.define("MiddleWare", {
    init(router = create(Router)()) {

        this.router = router;
        return this;

    },
    _parseKey(k) {

        return k;

    },
    use(k, handler) {

        var key = this._parseKey(k);
        handler.key = key;
        return this.router.add(key, handler);

    },
    send(message) {

        return this.router.send(message);

    }
});
Http.MiddleWare = MiddleWare.define("Http.MiddleWare", {
    _parseKey(path) {

        return path.split("/");

    },
    init(router = create(Router)()) {

        this.router = router;
        router.events.on("noRoute", notFound404).on("emptyKey", notFound404).add("", notFound404);
        return this;

    }
});
Http.Server = Interface.define("Http.Server", {
    init(port = this.port, _server = http.createServer()) {

        this.port = port;
        this._server = _server;
        return this;

    },
    start() {

        return this._server.listen(this.port);

    },
    use(middleWare) {

        return this._server.on("request", ((request, response) => {

            return middleWare.send(create(Http.Message)(request, response));

        }));

    }
});
var keyOf = (function keyOf$(path) {
    /* key-of src/router.sibilant:1:0 */

    return parse(path).key;
});
var Router = Interface.define("Router", {
    init(_tree = create(TreeMap)(), events = create(EventEmitter)()) {

        this._tree = _tree;
        this.events = events;
        return this;

    },
    start() {

        return this.init();

    },
    send(message) {

        var route = this.find(message.key);
        message.route = route;
        return (function() {
            if (!(((route && route.value)))) {
                return this.events.emit("noRoute", message);
            } else if (!(route.value.key)) {
                return this.events.emit("emptyKey", message);
            } else {
                return cond((() => {

                    return typeof route.value === "function";

                }), (function() {
                    /* src/router.sibilant:19:15 */

                    return route.value(arguments[0]);
                }), (() => {

                    return typeof route.value.send === "function";

                }), (function() {
                    /* src/router.sibilant:21:15 */

                    return route.value.send(arguments[0]);
                }))(extend(message, {
                    key: message.key.slice(route.value.key.length)
                }));
            }
        }).call(this);

    },
    add(key = this.key, handler = this.handler, _tree = this._tree) {

        "introduce a new routing node to the tree.";
        _tree.set(key, handler);
        return this;

    },
    find(key = this.key, _tree = this._tree) {

        "locate a route given an array of keys";
        return (function(s) {
            /* node_modules/kit/inc/scope.sibilant:12:9 */

            return (function(child) {
                /* node_modules/kit/inc/scope.sibilant:12:9 */

                return (function() {
                    if (child) {
                        return Router.find(key.slice(1), child);
                    } else {
                        return _tree;
                    }
                }).call(this);
            })(_tree._children.get(s));
        })(key[0]);

    },
    stop() {

    }
});

exports.Router = Router;

var ReadStream = Interface.define("ReadStream", {
    init(stream = this.stream) {

        this.stream = stream;
        return this;

    },
    reduce(f = this.f, value = this.value, stream = this.stream) {

        return ReadStream.each(((chunk) => {

            return value = f(value, chunk);

        }), stream).then((() => {

            return value;

        }));

    },
    each(f = this.f, stream = this.stream) {

        return (new Promise(((success, fail) => {

            var resolve = success,
                reject = fail;
            return stream.on("data", f).on("error", fail).on("end", success);

        })));

    },
    drain(stream = this.stream) {

        return ReadStream.reduce(((value, chunk) => {

            return (value + chunk);

        }), "");

    }
});