/*
    function() {
        数据处理
        ...
        消息回复
    }
*/

(function () {
    const GameManager = require('./GameManager.js')

    let HallManager = {}
    // 大厅同步
    HallManager.syncHall = function (data, responds) {
        GameManager.syncGames(data, responds)
    }

    module.exports = HallManager
}())