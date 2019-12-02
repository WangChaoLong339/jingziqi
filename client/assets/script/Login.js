cc.Class({
    extends: cc.Component,

    properties: {
        accEditBox: cc.EditBox,
        pwdEditBox: cc.EditBox,
    },

    onLoad: function () {
        // 场景监听
        SocketCustom.on('stc_login', this.stcLogin.bind(this))
    },

    stcLogin: function (msg) {
        if (msg.err != '') {
            console.log(msg.err)
            return
        }
        console.log('登陆成功');
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
