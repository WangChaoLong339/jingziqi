cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        item: cc.Node,
    },

    onLoad: function () {
        this.games = []
    },

    onEnable: function () {
        // 场景监听
        SocketCustom.on('stc_sync_hall', this.stcSyncHall.bind(this))
        SocketCustom.on('stc_create_game', this.stcCreateGame.bind(this))
        SocketCustom.on('stc_enter_game', this.stcEnterGame.bind(this))
        // 同步大厅
        SocketCustom.emit('cts_sync_hall')
    },

    onDisable: function () {
        // 取消监听
        SocketCustom.removeListener('stc_sync_hall')
        SocketCustom.removeListener('stc_create_game')
        SocketCustom.removeListener('stc_enter_game')
    },

    showGames: function () {
        this.content.removeAllChildren()
        for (var i = 0; i < this.games.length; i++) {
            let item = cc.instantiate(this.item)
            item.PathChild('roomId', cc.Label).string = this.games[i].id
            item.PathChild('roomOwner', cc.Label).string = `房主ID:${this.games[i].owner}`
            this.content.addChild(item)
        }
    },

    stcSyncHall: function (msg) {
        if (msg.err != '') {
            console.log(msg.err)
            return
        }
        this.games = msg.games || []
        // 
        this.showGames()
    },

    stcCreateGame: function (msg) {
        if (msg.err != '') {
            console.log(msg.err)
            return
        }
        this.games.push(msg.game)
        this.games.sort(function (a, b) { return a.id - b.id })
        // 
        this.showGames()
    },

    stcEnterGame: function (msg) {
        if (msg.err != '') {
            console.log(msg.err)
            return
        }
        // 如果是自己进入房间才切换场景
        if (msg.userId == User.userId) {
            cc.director.loadScene('Game')
        }
    },

    btnCreateRoom: function () {
        SocketCustom.emit('cts_create_game', { userId: User.userId })
    },

    btnEnterRoom: function (event) {
        let gameId = this.games[this.content.children.indexOf(event.target)].id
        SocketCustom.emit('cts_enter_game', { userId: User.userId, gameId: gameId })
    },
});
