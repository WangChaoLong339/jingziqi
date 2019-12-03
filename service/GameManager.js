/*
    function() {
        数据处理
        ...
        消息回复
    }
*/

(function () {
    const Util = require('./Util.js')
    let Piece = { None: 0, Bai: 1, Hei: 2 }
    let State = { None: 0, Ready: 1, Gaming: 2, Result: 3 }

    let GameManager = {}
    GameManager.gameId2Game = {}
    GameManager.userId2GameId = {}

    // 同步大厅
    GameManager.syncGames = function (data, responds) {
        let games = []
        for (var i in GameManager.gameId2Game) {
            games.push({ id: i, owner: GameManager.gameId2Game[i].owner })
        }

        responds({ err: '', games: games })
    }
    // 同步房间
    GameManager.syncGame = function (data, responds) {
        let game = GameManager.gameId2Game[GameManager.userId2GameId[data.userId]]
        // TODO 需要过滤数据
        responds({ err: '', game: game })
    }
    // 创建房间
    GameManager.createGame = function (data, responds) {
        let game = {
            /* 游戏房号 */id: Util.randomInt(100000, 1000000),
            /* 房间房主 */owner: data.userId,
            /* 空余位子 */freeSeatId: [0, 1],
            /* 选择棋子 */freePiece: [Piece.Bai, Piece.Hei],
            /* 玩家列表 */users: [],
            /* 当前操作 */currUserId: 0,
            /* 棋盘信息 */qiPan: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            /* 房间状态 */state: State.None,
        }
        // 绑定关系
        GameManager.gameId2Game[game.id] = game
        GameManager.userId2GameId[data.userId] = game.id

        responds({ err: '', game: game })
    }

    // 进入房间
    GameManager.enterGame = function (data, responds) {
        let game = GameManager.gameId2Game[data.gameId]
        game.state = State.Ready
        let user = { userId: data.userId, setId: game.freeSeatId.shift(), piece: game.freePiece.shift() }
        game.currUserId = game.currUserId || data.userId
        game.users.push(user)
        GameManager.userId2GameId[data.userId] = data.gameId

        responds({ err: '', user: user })
    }

    module.exports = GameManager
}())