(function () {
    var SocketCustom = {}

    SocketCustom.on = function (name, callback) {
        socket.on(name, (msg) => {
            if (callback) {
                callback(msg)
            }
        });
    }

    SocketCustom.emit = function (name, msg) {
        socket.emit(name, msg);
    }

    SocketCustom.removeListener = function (eventName) {
        socket.removeEventListener(eventName)
    }

    module.exports = SocketCustom
})()