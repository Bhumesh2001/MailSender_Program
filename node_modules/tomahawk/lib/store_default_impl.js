module.exports = function () {
    var fs = require('fs');

    function create(app, config, io) {
        if (!config || !config.store) config = {store:{}};
        var interval  = config.store.interval || 1000,
            hash      = {},
            filename  = 'tomahawk.json',
            modified  = false,
            connected = false,
            meta      = {$_id:'tomahawk'};
        
        function status(next) {
            process.nextTick(function () {
                if (next) next(null, {
                    connected : connected,
                    modified  : modified,
                    status    : 'OK'
                });
            });
        }   
        
        function connect(url, next) {
            filename = url + '.json';
            autosave();
            load(function (err, value, meta) {
                connected = true;
                if (next) next(err, value, meta);
            });
        }
        
        function close(next) {
            save(function (err) {
                connected = false;
                if (next) next(err);
            });
        }

        function get(key, next) {
            if (key.indexOf('*') !== -1) {
                var tuples = [],
                    regex  = '^' + key.replace(/\*/g, '.*') + '$';
                for (var name in hash) {
                    if (hash.hasOwnProperty(name) && name.match(regex)) {
                        tuples.push({key: name, value: hash[name]});
                    }
                }      
                process.nextTick(function () {
                    if (next) next(null, tuples, meta);
                });
            } else {
                process.nextTick(function () {
                    if (next) next(null, hash[key], meta);
                });
            }
        }
        
        function set(key, value, next) {
            var keys = key instanceof Array ? key : [key];
            keys.forEach(function (aKey) {
                hash[aKey] = value;
            });
            modified = true;
            process.nextTick(function () {
                if (next) next(null, 'OK', meta);
            });
        }
        
        function del(key, next) {
            var keys = key instanceof Array ? key : [key];
            keys.forEach(function (aKey) {
                delete hash[aKey];    
            });
            modified = true;
            process.nextTick(function () {
                if (next) next(null, 'OK', meta);
            });
        }
        
        //////////////////////////// PRIVATE ///////////////////////////////////
        function save(next) {
            if (modified) {
                try {
                    var payload = JSON.stringify(hash);
                    modified = false;
                    fs.writeFile(config.rootPath + '/' + filename, payload, function (err) {
                        if (next) next(err);
                    });
                } catch (e) {
                    if (next) next(e);
                }
            } else {
                if (next) next(null);
            }
        }
        
        function load(next) {
            fs.readFile(config.rootPath + '/' +  filename, function (err, data) {
                if (!err) {
                    try {
                        hash = JSON.parse(data);
                    } catch (e) {
                        err = e;
                    }
                }
                if (next) next(err);
            });
        }
        
        function autosave() {
            save(function (err) {
                setTimeout(function () {
                    autosave();
                },interval);
            });
        }
        
        ////////////////////////////////////////////////////////////////////////
        return {
            status  : status,
            connect : connect,
            close   : close,
            get     : get,
            set     : set,
            del     : del
        };
    }
    
    return create;
}();