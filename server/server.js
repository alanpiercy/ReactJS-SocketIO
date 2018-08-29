/**
 * Server that talks with ReactJS app over socket io.
 * Server watches client src file changes, rebuilds code, and tells client to reload
 */
const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cp = require('child_process');
const watch = require('watch');

const debug = function(msg){console.log(msg);}
const error = function(msg){console.log('error: ' + msg);}

//configuration
const Config = require('./config.json');//pulls from server dir
const HTTP_PORT = Config.server.http;

const CLIENT_DIR = path.resolve('..', Config.client.dir);//resolves to main client dir
const CLIENT_BUILD_DIR = path.resolve(CLIENT_DIR, 'build');
const CLIENT_SOURCE_DIR = path.resolve(CLIENT_DIR, 'src');

//socket messages
const ClientToServer = {
    PING: 'client/ping',
};
const ServerToClient = {
    SRC_CHANGED: 'server/src_changed',
};

/**
 * Start up
 */
const package = require('./package.json');
debug(package.description + " v" + package.version);
/**
 * Web server loads production build from static dir, socketio uses it.
 */
let app = express();
app.use(express.static(CLIENT_BUILD_DIR));
let server = http.createServer(app);
let io = socketio(server);
let gSocket;
io.on('connection', function(socket){
    debug('client socket connection');
    gSocket = socket;
    socket.on(ClientToServer.PING, data => {
        debug(ClientToServer.PING);
    })
});
server.listen(HTTP_PORT, () => console.log('Web server listening on port ' + HTTP_PORT));

/**
 * Watch monitors client source dir changes, build src, emit change notification to client
 */
debug('Watching files at ' + CLIENT_SOURCE_DIR);
watch.createMonitor(CLIENT_SOURCE_DIR, function(monitor){
    monitor.on('created', function(){//new file created
    });
    monitor.on('changed', function(file){//file changed
        debug('Source file changed: ' + file);
        cp.exec('npm run build', {cwd: CLIENT_DIR}, (e) => {
            if (e){
                error('Source file changed. ' + e);
                return;
            }
            if (gSocket){
                debug('Emit source change signal: ');
                gSocket.emit(ServerToClient.SRC_CHANGED, {file: file});
            }
        });
    });
    monitor.on('removed', function(){//file removed
    });
});