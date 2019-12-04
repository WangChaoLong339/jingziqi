let Piece = { None: 0, Bai: 1, Hei: 2 }
let State = { None: 0, Ready: 1, Gaming: 2, Result: 3 }

cc.Class({
    extends: cc.Component,

    properties: {
        matchbackground: cc.Node,
        usersRoot: cc.Node,
        countdown: cc.Node,
        ready: cc.Node,
        tips: cc.Node,
    },

    onLoad: function () {
        // 界面数据初始化
        this._gameInit()
        // 同步游戏
        SocketCustom.emit('cts_sync_game', { userId: User.userId })
    },

    onEnable: function () {
        // 场景监听
        cc.game.on(cc.game.EVENT_HIDE, function () { console.log("进入后台"); }, this);
        cc.game.on(cc.game.EVENT_SHOW, function () { console.log("返回游戏"); }, this);
        SocketCustom.on('stc_sync_game', this.stcSyncGame.bind(this))
        SocketCustom.on('stc_enter_game', this.stcEnterGame.bind(this))
        SocketCustom.on('stc_leave_game', this.stcLeaveGame.bind(this))
        SocketCustom.on('stc_ready', this.stcReady.bind(this))
        SocketCustom.on('stc_game_start', this.stcGameStart.bind(this))
        SocketCustom.on('stc_user_fallen', this.stcUserFallen.bind(this))
        SocketCustom.on('stc_game_result', this.stcGameResult.bind(this))
        // 同步游戏
        SocketCustom.emit('cts_sync_game', { userId: User.userId })
    },

    onDisable: function () {
        // 取消监听
        SocketCustom.removeListener('stc_sync_game')
        SocketCustom.removeListener('stc_enter_game')
        SocketCustom.removeListener('stc_leave_game')
        SocketCustom.removeListener('stc_ready')
        SocketCustom.removeListener('stc_game_start')
        SocketCustom.removeListener('stc_user_fallen')
        SocketCustom.removeListener('stc_game_result')
    },

    _gameInit: function () {
        this.game = {}
        this.game.users = []
        // 自己
        this.usersRoot.PathChild('myRoot/nickname', cc.Label).string = ''
        this.usersRoot.PathChild('myRoot/state', cc.Label).string = ''
        SetSpriteFrame(null, this.usersRoot.PathChild('myRoot/piece', cc.Sprite))
        // 对家
        this.usersRoot.PathChild('otherRoot/nickname', cc.Label).string = ''
        this.usersRoot.PathChild('otherRoot/state', cc.Label).string = ''
        SetSpriteFrame(null, this.usersRoot.PathChild('otherRoot/piece', cc.Sprite))
        // 倒计时
        this.countdown.getComponent(cc.Label).string = ''
        // 准备按钮
        this.ready.active = true
        //  结束提示
        this.tips.getComponent(cc.Label).string = ''
    },

    _getUserIdx: function (userId) {
        let idx = null
        for (var i = 0; i < this.game.users.length; i++) {
            if (userId == this.game.users[i].userId) {
                idx = i
                break
            }
        }
        return idx
    },

    showUserInfo: function () {
        for (let i = 0; i < this.game.users.length; i++) {
            let user = this.game.users[i]
            if (user.userId == User.userId) {
                this.ready.PathChild('val', cc.Label).string = user.ready ? '取消' : '准备'
                this.usersRoot.PathChild('myRoot/state', cc.Label).string = user.ready ? '已准备' : '请准备'
                SetSpriteFrame(`piece${user.piece}`, this.usersRoot.PathChild('myRoot/piece', cc.Sprite))
            } else {
                this.usersRoot.PathChild('otherRoot/state', cc.Label).string = user.ready ? '已准备' : '等待中'
                SetSpriteFrame(`piece${user.piece}`, this.usersRoot.PathChild('otherRoot/piece', cc.Sprite))
            }
        }
    },

    showCheckerboard: function () {
        for (var i = 0; i < this.game.qiPan.length; i++) {
            let piece = this.game.qiPan[i]
            piece = piece == 0 ? null : 'piece' + piece
            SetSpriteFrame(piece, this.matchbackground.children[i].PathChild('qizi', cc.Sprite))
        }
    },

    playCurrUserIdAnima: function () {
        this.usersRoot.PathChild('myRoot/piece').stopAllActions()
        this.usersRoot.PathChild('otherRoot/piece').stopAllActions()
        this.usersRoot.PathChild('myRoot/piece').opacity = 255
        this.usersRoot.PathChild('otherRoot/piece').opacity = 255
        let animaNode = this.game.currUserId == User.userId ? this.usersRoot.PathChild('myRoot/piece') : this.usersRoot.PathChild('otherRoot/piece')
        animaNode.runAction(cc.repeatForever(cc.sequence(
            cc.fadeOut(1),
            cc.fadeIn(1),
        )))
    },

    stcSyncGame: function (msg) {
        if (msg.err != '') {
            console.log(msg.err);
            return
        }
        // 同步房间数据
        this.game = msg.game
        // 刷新玩家信息
        this.showUserInfo()
        // 刷新棋盘
        this.showCheckerboard()
    },

    stcEnterGame: function (msg) {
        if (msg.err != '') {
            console.log(msg.err);
            return
        }
        // 同步房间数据
        this.game = msg.game
        // 刷新玩家信息
        this.showUserInfo()
        // 刷新棋盘
        this.showCheckerboard()
    },

    stcLeaveGame: function (msg) {
        if (msg.err != '') {
            console.log(msg.err);
            return
        }
        if (User.userId == msg.userId) {
            this.game = {}
            cc.director.loadScene('Hall')
        } else {
            // 同步房间数据
            this.game = msg.game
            this.usersRoot.PathChild('otherRoot/state', cc.Label).string = ''
            SetSpriteFrame(null, this.usersRoot.PathChild('otherRoot/piece', cc.Sprite))
        }
    },

    stcReady: function (msg) {
        if (msg.err != '') {
            console.log(msg.err);
            return
        }
        // 同步房间数据
        this.game = msg.game
        // 刷新玩家信息
        this.showUserInfo()
        if (msg.userId == User.userId) {
            // 提示
            this.tips.getComponent(cc.Label).string = ''
            // 刷新棋盘
            this.showCheckerboard()
        }
    },

    stcGameStart: function () {
        this.ready.active = false
        this.countdown.runAction(cc.sequence(
            cc.callFunc(() => { this.countdown.getComponent(cc.Label).string = '3' }),
            cc.scaleTo(0.2, 1.1, 1.1),
            cc.scaleTo(0.2, 1, 1),
            cc.delayTime(0.6),
            cc.callFunc(() => { this.countdown.getComponent(cc.Label).string = '2' }),
            cc.scaleTo(0.2, 1.1, 1.1),
            cc.scaleTo(0.2, 1, 1),
            cc.delayTime(0.6),
            cc.callFunc(() => { this.countdown.getComponent(cc.Label).string = '1' }),
            cc.scaleTo(0.2, 1.1, 1.1),
            cc.scaleTo(0.2, 1, 1),
            cc.delayTime(0.6),
            cc.callFunc(() => { this.countdown.getComponent(cc.Label).string = '0' }),
            cc.scaleTo(0.2, 1.1, 1.1),
            cc.scaleTo(0.2, 1, 1),
            cc.delayTime(0.6),
            cc.callFunc(() => {
                this.countdown.getComponent(cc.Label).string = ''
                this.usersRoot.PathChild('myRoot/state', cc.Label).string = ''
                this.usersRoot.PathChild('otherRoot/state', cc.Label).string = ''
                // 棋子闪烁动画
                this.playCurrUserIdAnima()
            }),
        ))
    },

    stcUserFallen: function (msg) {
        if (msg.err != '') {
            console.log(msg.err);
            return
        }
        // 同步房间数据
        this.game = msg.game
        // 棋子闪烁动画
        this.playCurrUserIdAnima()
        // 刷新棋盘
        this.showCheckerboard()
    },

    stcGameResult: function (msg) {
        this.ready.PathChild('val', cc.Label).string = '准备'
        this.ready.active = true
        this.tips.getComponent(cc.Label).string = `${msg.game.winner == User.userId ? '我' : '对手'}胜`
        this.tips.color = msg.game.winner == User.userId ? cc.Color.RED : cc.Color.GREEN
        //
        this.game.users[this._getUserIdx(User.userId)].ready = false
    },

    btnReady: function () {
        let ready = this.game.users[this._getUserIdx(User.userId)].ready
        SocketCustom.emit('cts_ready', { userId: User.userId, ready: !ready })
    },

    btnItem: function (event) {
        if (this.game.currUserId != User.userId) {
            return
        }
        let idx = this.matchbackground.children.indexOf(event.target)
        SocketCustom.emit('cts_user_fallen', { userId: User.userId, piece: this.game.users[this._getUserIdx(User.userId)].piece, idx: idx, });
    },

    btnLeave: function () {
        SocketCustom.emit('cts_leave_game', { userId: User.userId })
    },
});
