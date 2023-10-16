module.exports = function () {
    function create(app, config, io) {
        var context  = config.store.context  || '/store/api/v1',
            interval = config.store.interval || interval,
            url      = config.store.url      || 'store',
            store    = config.store.impl;

        store.connect(url);
        
        // GET
        app.get(context + '/key/:key?', function (req, res) {
            var key   = req.params.key || '*',
                exact = key.indexOf('*') === -1;
            res.header('X-tomahawk-http-method', 'GET');
            res.header('X-tomahawk-operation', 'get');
            res.header('X-tomahawk-multi-key', !exact);
            res.header('X-tomahawk-key', key);

            store.get(key, function (err, values) {
                if (err) {
                    return res.status(500).json({key:key,error:err}).end();
                }
                if (values) {
                    return res.set('Content-Type', 'text/plain; charset=utf8').send(values).end();
                }
                return res.status(404).json({key:key}).end();
            });
        });

        // POST
        app.post(context + '/key', function (req, res) {
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                    return v.toString(16);
                }),
                tuples = getFormData(uuid, req),
                keys   = tuples.map(function (object) {return object.key}).join(',');
                
            res.header('X-tomahawk-http-method', 'POST');
            res.header('X-tomahawk-operation', 'set');
            res.header('X-tomahawk-multi-key', tuples.length > 1);
            res.header('X-tomahawk-key', keys);
            set(req, res, tuples, keys);
        });

        // PUT
        app.put(context + '/key/:key', function (req, res) {
            var tuples = getFormData(req.params.key, req),
                keys   = tuples.map(function (object) {return object.key}).join(',');

            res.header('X-tomahawk-http-method', 'PUT');
            res.header('X-tomahawk-operation', 'set');
            res.header('X-tomahawk-multi-key', tuples.length > 1);
            res.header('X-tomahawk-key', keys);
            set(req, res, tuples, keys);
        });

        // DELETE
        app.delete(context + '/key/:key?', function (req, res) {
            var key   = req.params.key || '*',
                exact = key.indexOf('*') === -1;
            res.header('X-tomahawk-http-method', 'DELETE');
            res.header('X-tomahawk-operation', 'del');
            res.header('X-tomahawk-multi-key', !exact);
            res.header('X-tomahawk-key', key);

            if (key === '*' && req.query.force !== 'true') {
                return res.status(400).json({error:"To delete all the entries, you must use the 'force' option"}).end();
            }
                
            store.del(key, function (err, value) {
                if (err) {
                    return res.status(500).json({key:key,error:err}).end();
                }
                io.sockets.emit('/del', {key:key});
                return res.status(204).end();
            });
        });

        // GET status
        app.get(context + '/status', function (req, res) {
            res.header('X-tomahawk-http-method', 'GET');
            res.header('X-tomahawk-operation', 'status');
            store.status(function (err, value) {
                if (err) {
                    return res.status(500).json({error:err}).end();
                }
                return res.status(200).json(value).end();
            });
        });
        /////////////////////////// PRIVATE ///////////////////////////////////

        function getFormData(defaultKey, req) {
            var tuples = [];
            console.log('content-type:', req.xContentType);
            if (req.xContentType === 'application/x-www-form-urlencoded') {
                for (var name in req.body) {
                    if (req.body.hasOwnProperty(name)) {
                        tuples.push({key: name, value: req.body[name]});
                    }
                }
                // Invalid Post using something like curl
                console.log('tuples:',tuples);
                if (tuples.length === 1 && !tuples[0].value) {
                    tuples[0].value = tuples[0].key;
                    tuples[0].key   = defaultKey;
                }
                console.log('*tuples:',tuples);
                return tuples;
            } else {
                console.log('body:', req.body);
                tuples.push({key:req.params.key ? req.params.key : defaultKey, value:req.body});
            }
            return tuples;
        }
        
        function set(req, res, tuples, keys, emitSuffix) {
            var errors = [];
            tuples.forEach(function (tuple) {
                store.set(tuple.key, tuple.value, function (err) {
                    if (!err) {
                        io.sockets.emit(context + '/set', {key:tuple.keys, value: tuple.value});
                    }
                    errors.push(err);
                    
                    // last 'store.set()' to complete
                    //
                    if (errors.length === tuples.length) {
                        var realErrors = errors.filter(function (e) {
                            if (e) return true;
                            return false;
                        });
                        if (realErrors.length > 0) {
                            return res.status(500).json({key:keys,error:realErrors}).end();
                        }
                        res.status(204).end();
                    }
                });
            });
        }
        ////////////////////////////////////////////////////////////////////////        
        return {
            shutdown : function (next) {
                store.close(next);
            }
        };
    }

    return create;
}();
