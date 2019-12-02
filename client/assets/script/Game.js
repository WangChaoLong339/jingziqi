let Piece = { None: 0, Bai: 1, Hei: 2 }
let State = { None: 0, Ready: 1, Gaming: 2, Result: 3 }

cc.Class({
    extends: cc.Component,

    properties: {
        matchbackground: cc.Node,
        usersRoot: cc.Node,
        countdown: cc.Node,
        ready: cc.Node,
    },

    onLoad: function () {
        // 场景监听
        cc.game.on(cc.game.EVENT_HIDE, function () { console.log("进入后台"); }, this);
        cc.game.on(cc.game.EVENT_SHOW, function () { console.log("返回游戏"); }, this);
        SocketCustom.on('stc_sync_game', this.stcSyncGame.bind(this))
        SocketCustom.on('stc_enter_game', this.stcEnterGame.bind(this))
        SocketCustom.on('stc_leave_game', this.stcLeaveGame.bind(this))
        SocketCustom.on('stc_ready', this.stcReady.bind(this))
        SocketCustom.on('stc_game_start', this.stcGameStart.bind(this))
        SocketCustom.on('stc_user_confirm', this.stcUserConfirm.bind(this))
        SocketCustom.on('stc_game_result', this.stcGameResult.bind(this))

        // 界面数据初始化
        this._gameInit()
        // 同步游戏
        SocketCustom.emit('cts_sync_game', { userId: User.userId })
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
            let flag = this.game.qiPan[i]
            flag = flag == 0 ? null : 'piece' + flag
            SetSpriteFrame(flag, this.matchbackground.children[i].PathChild('qizi', cc.Sprite))
        }
    },

    stcSyncGame: function (msg) {
        if (msg.err != '') {
            console.log(msg.err);
            return
        }
        // 同步数据
        this.game = msg.game
        //
        let idx = this._getUserIdx(User.userId)
        this.game.my = this.game.users[idx]
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
        if (this._getUserIdx(msg.userId) == null) {
            this.game.users.push(msg.user)
        }
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
            let idx = this._getUserIdx(msg.userId)
            this.game.users.splice(idx, 1)
            this.usersRoot.PathChild('otherRoot/state', cc.Label).string = ''
            SetSpriteFrame(null, this.usersRoot.PathChild('otherRoot/piece', cc.Sprite))
        }
    },

    stcReady: function (msg) {
        if (msg.err != '') {
            console.log(msg.err);
            return
        }
        let idx = this._getUserIdx(msg.userId)
        this.game.users[idx].ready = msg.ready
        // 界面层
        if (User.userId == msg.userId) {
            this.usersRoot.PathChild('myRoot/state', cc.Label).string = msg.ready ? '已准备' : '请准备'
            this.ready.PathChild('val', cc.Label).string = msg.ready ? '取消' : '准备'
        } else {
            this.usersRoot.PathChild('otherRoot/state', cc.Label).string = msg.ready ? '已准备' : '等待中'
        }
    },

    stcGameStart: function () {
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
            }),
        ))
    },

    stcUserConfirm: function (msg) {
    },

    stcGameResult: function (msg) {
        this.game.currUserId = 0
        console.log(`${msg.result == 1 ? '白' : '黑'}棋胜!!!`)
    },

    btnReady: function () {
        SocketCustom.emit('cts_ready', { userId: User.userId, ready: !this.game.my.ready })
    },

    btnItem: function (event) {
        if (this.game.currUserId != User.userId) {
            return
        }
        let idx = event.target.idx
        SocketCustom.emit('cts_user_confirm', { userId: User.userId, flag: this.game.users[User.userId].flag, idx: idx, });
    },

    btnLeave: function () {
        SocketCustom.emit('cts_leave_room', { userId: User.userId })
    },
});
