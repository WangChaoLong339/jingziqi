cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        item: cc.Node,
    },

    onLoad: function () {
        // 场景监听
        SocketCustom.on('stc_sync_hall', this.stcSyncHall.bind(this))
        SocketCustom.on('stc_create_game', this.stcCreateGame.bind(this))
        SocketCustom.on('stc_enter_game', this.stcEnterGame.bind(this))

        this.module = { games: [] }
        // 加入大厅分组
        SocketCustom.emit('group_hall')
        // 同步大厅
        SocketCustom.emit('cts_sync_hall')
    },

    showGames: function () {
        this.content.removeAllChildren()
        for (var i = 0; i < this.module.games.length; i++) {
            let item = cc.instantiate(this.item)
            item.PathChild('roomId', cc.Label).string = this.module.games[i].id
            item.PathChild('roomOwner', cc.Label).string = `房主ID:${this.module.games[i].owner}`
            this.content.addChild(item)
        }
    },

    stcSyncHall: function (msg) {
        if (msg.err != '') {
            console.log(msg.err)
            return
        }
        this.module.games = msg.games || []
        // 
        this.showGames()
    },

    stcCreateGame: function (msg) {
        if (msg.err != '') {
            console.log(msg.err)
            return
        }
        this.module.games.push(msg.game)
        this.module.games.sort(function (a, b) { return a.id - b.id })
        // 
        this.showGames()
    },

    stcEnterGame: function (msg) {
        if (msg.err != '') {
            console.log(msg.err)
            return
        }
        // 如果是自己进入房间才切换场景
        if (msg.user.userId == User.userId) {
            cc.director.loadScene('Game')
        }
    },

    btnCreateRoom: function () {
        SocketCustom.emit('cts_create_game', { userId: User.userId })
    },

    btnEnterRoom: function (event) {
        let gameId = this.module.games[this.content.children.indexOf(event.target)].id
        SocketCustom.emit('cts_enter_game', { userId: User.userId, gameId: gameId })
    },
});
