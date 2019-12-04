cc.Class({
    extends: cc.Component,

    properties: {
        accEditBox: cc.EditBox,
        pwdEditBox: cc.EditBox,
    },

    onLoad: function () {
    },

    onEnable: function () {
        // 场景监听
        SocketCustom.on('stc_login', this.stcLogin.bind(this))
    },

    onDisable: function () {
        // 取消监听
        SocketCustom.removeListener('stc_login')
    },

    stcLogin: function (msg) {
        if (msg.err != '') {
            console.log(msg.err)
            return
        }
        window.User = { userId: msg.userId }
        cc.director.loadScene('Hall')
    },

    btnLogin: function () {
        let acc = parseInt(this.accEditBox.string)
        if (!acc) {
            return
        }
        let pwd = parseInt(this.pwdEditBox.string)
        if (!pwd) {
            return
        }
        SocketCustom.emit('cts_login', { userId: acc, pwd: pwd })
    },
});
