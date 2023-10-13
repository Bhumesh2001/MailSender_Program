module.exports = function () {
    var
        path       = require('path'),
        express    = require('express'),
        connect    = require('connect'),
        http       = require('http'),
        socketio   = require('socket.io'),
        spawn      = require('child_process').spawn,
        opts       = require('node-options'),
        baseConfig = opts.readPackageConfig(path.join(__dirname, '..', 'package.json'));

    function Tomahawk(config) {
        var $this    = this;
        this.config  = opts.mergeEnvironment(opts.merge(config ? config : {}, baseConfig));
        this.meta    = this.config.meta ? this.config.meta : (this.config.name + '-Engine');
        if (this.config.logger) {
            this.logger = this.config.logger
        } else {
            var winston = require('winston'),
                meta = {
                    "module": $this.config.name || $this.meta,
                    "pid": process.pid
                };
            $this.logger = new (winston.Logger)({ transports: [
                new (winston.transports.Console)({
                    "level": $this.config.level || "info",
                    "json": false,
                    "colorize": true
                })
            ]});
        }
        if (!this.config.www || this.config.www === '.') {
            this.config.www = process.cwd();
        }
        this.headers = _parseHTTPHeaders(this.config.headers, this.logger, this.meta);

        this.app     = express();
        this.server  = http.createServer(this.app);
        this.io      = socketio.listen(this.server);

        this.app.configure(function () {
            $this.app.use(express.logger({
                stream : {
                    write : function (message, encoding) {
                        if ($this.logger && $this.logger.log) {
                            $this.logger.log('info', message.replace(/\n/, ''), $this.meta);
                        }
                    }
                }
            }));    //app.use(express.logger('dev'));


            var bodyparser = $this.config.bodyparser instanceof Array ? $this.config.bodyparser : (typeof($this.config.bodyparser) === 'string' ? [$this.config.bodyparser] : ['./bodyparser']);
            for (var i = 0 ; i < bodyparser.length ; ++i) {
                $this.logger.log('bodyparser %s', bodyparser[i], $this.meta);

                require(bodyparser[i])($this.app, $this.config);
            }

            $this.app.use(function(req, res, next) {
                for (var i = 0 ; i < $this.headers.length ; ++i) {
                    res.setHeader($this.headers[i].name, $this.headers[i].value);
                }
                return next();
            });
            if ($this.config.context) {
                $this.app.use($this.config.context, express.static($this.config.www));
            }
            if ($this.level === 'error') {
                $this.app.use(express.errorHandler());
            } else {
                $this.app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
            }
        });

        process.on('exit', function() {
            $this.logger.log('info', 'EXIT', $this.meta);
        });
        process.on('SIGINT', function() {
            $this.logger.log('warn', 'SIGINT', $this.meta);
            process.exit(0);
        });

        $this.io.configure(function () {
	        $this.io.set('log level', {error:0, warn:1, info:2, debug:3}[$this.config.socket.level || "warn"]);
	        $this.logger.log('info', 'log level', {error:0, warn:1, info:2, debug:3}[$this.config.socket.level || "warn"]);
            $this.io.set("transports", $this.config.socket.transports || ["jsonp-polling"]);
            $this.logger.log('info',"transports", $this.config.socket.transports || ["jsonp-polling"]);
            $this.io.set("polling duration", $this.config.socket.pollingduration || 10);
            $this.logger.log('info',"polling duration", $this.config.socket.pollingduration || 10);
        });

        var routes = $this.config.routes instanceof Array ? $this.config.routes : (typeof($this.config.routes) === 'string' ? [$this.config.routes] : []);
        for (var i = 0 ; i < routes.length ; ++i) {
            $this.logger.log('debug', 'loading module: %s', routes[i], $this.meta);
            require(routes[i])($this.app, $this.config, $this.io, $this);
        }
        var cgi = $this.config.cgi instanceof Array ? $this.config.cgi : (typeof($this.config.cgi) === 'string' ? [$this.config.cgi] : []);
        $this.logger.log('debug', 'cgis: %j', cgi, $this.meta);

        function createRouteCGI(app, cgi) {
           var method  = cgi.method || "GET";

           function handler(req, res) {
                var command = cgi.command;
                var args    = cgi.args || [];

                $this.logger.log('debug', 'spawn: %s [args:%j]', command, args, $this.meta);
                var child   = spawn(command, args);

                if (cgi.encoding)
                    child.stdin.setEncoding(cgi.encoding);

                child.stderr.on('data', function (data) {
                    $this.logger.log('debug', 'stderr: %s', (''+data), $this.meta);
                    res.write(data);
                });
                child.stdout.on('data', function (data) {
                    $this.logger.log('debug', 'stdout: %s', (''+data), $this.meta);
                    res.write(data);
                });

                child.on('close', function (code) {
                    $this.logger.log('debug', 'close', $this.meta);
                    res.end();
                });
                req.on('data', function (data) {
                    $this.logger.log('read %s', (''+data), $this.meta);
                    child.stdin.write(data);
                });
                req.on('end', function (data) {
                    $this.logger.log('end %s', (''+data), $this.meta);
                    if (data)
                        child.stdin.end(data);
                    else 
                        child.stdin.end();
                });
            }
            if (method === 'GET') {
                app.get(cgi.route, handler);
            } else if (method === 'POST') {
                app.post(cgi.route, handler);
            } else if (method === 'PUT') {
                app.put(cgi.route, handler);
            } else if (method === 'DELETE') {
                app.delete(cgi.route, handler);
            }

        }
        for (i = 0 ; i < cgi.length ; ++i) {
            createRouteCGI($this.app, cgi[i]);
        }
    }

    Tomahawk.prototype.start = function() {
        this.server.listen(this.config.port, this.config.ip);
        this.logger.log('info', 'listen|root=%s|context=%s|IP=%s|PORT=%d', this.config.www, this.config.context, this.config.ip, this.config.port, this.meta);
        return this.app;
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    function _parseHTTPHeaders(headers, logger, meta) {
        var regex  = /\s*([^\s:]*)\s*:\s*([^\s\n\r]*)/,
            parsedHeaders = [];
        headers = headers instanceof Array ? headers : [headers ? headers : ""];
        for (var i = 0 ; i < headers.length ; ++i) {
            var header = headers[i];
            var match = regex.exec(header);
            if (match && match.length === 3) {
                parsedHeaders.push({name:match[1], value:match[2]});
                logger.log('debug', 'http-header|%s : %s', match[1], match[2], meta);
            } else {
                logger.log('warn', 'http-header|IGNORING-INVALID-HEADER|%s|expecting=type : value', header, meta);
            }
        }
        return parsedHeaders;
    }

    function create(config) {
        return new Tomahawk(config);
    }

    return {
        create : create
    };
}();
