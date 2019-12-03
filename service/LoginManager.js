/*
    function() {
        数据处理
        ...
        消息回复
    }
*/

(function () {
    let userId2Pwd = {
        1: 1,
        2: 2,
        1000: 123,
        1001: 123,
        4444: 1,
        5555: 1,
    }

    let LoginManager = {}
    LoginManager.login = function (data, responds) {
        let err = ''
        if (typeof userId2Pwd[data.userId] == undefined) {
            err = '账号不存在'
        } else if (userId2Pwd[data.userId] != data.pwd) {
            err = '密码错误'
        }

        responds({ err: err, userId: data.userId })
    }

    module.exports = LoginManager
}())