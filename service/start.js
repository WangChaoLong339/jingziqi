const port = 3001;
const io = require('socket.io')(port);

// const Util = require('./Util.js')
const LoginManager = require('./LoginManager.js')
const HallManager = require('./HallManager.js')
const GameManager = require('./GameManager.js')

io.on('connection', (socket) => {
    // 断开
    socket.on('disconnect', (err) => {
    })

    // 登陆
    socket.on('cts_login', (data) => {
        LoginManager.login(data, (msg) => {
            socket.userId = data.userId
            socket.emit('stc_login', msg)
        })
    })

    // 加入大厅分组
    socket.on('group_hall', (data) => {
        socket.join('group_hall')
    })

    // 同步大厅
    socket.on('cts_sync_hall', (data) => {
        HallManager.syncHall(data, (msg) => {
            socket.emit('stc_sync_hall', msg)
        })
    })

    // 创建房间
    socket.on('cts_create_game', (data) => {
        GameManager.createGame(data, (msg) => {
            io.in('group_hall').emit('stc_create_game', msg)
        })
    })

    // 进入房间
    socket.on('cts_enter_game', (data) => {
        GameManager.enterGame(data, (msg) => {
            socket.emit('stc_enter_game', msg)
            socket.leave('group_hall')
            socket.join(data.gameId)
            socket.broadcast.to(data.gameId).emit('stc_enter_game', msg)
        })
    })

    // 同步房间
    socket.on('cts_sync_game', (data) => {
        GameManager.syncGame(data, (msg) => {
            socket.emit('stc_sync_game', msg)
        })
    })
});