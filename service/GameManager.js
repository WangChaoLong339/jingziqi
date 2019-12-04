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

    getResult = function (gameId) {
        let game = GameManager.gameId2Game[gameId]
        let result = 0
        // 横
        for (var i = 0; i < game.qiPan.length; i += 3) {
            let c0 = game.qiPan[i]
            let c1 = game.qiPan[i + 1]
            let c2 = game.qiPan[i + 2]
            if (c0 != 0 && c0 == c1 && c1 == c2) {
                result = c0
                console.log(`第${i / 3 + 1}排连接`)
                break
            }
        }
        // 竖
        for (var i = 0; i < 3; i++) {
            let c0 = game.qiPan[i]
            let c1 = game.qiPan[i + 3]
            let c2 = game.qiPan[i + 6]
            if (c0 != 0 && c0 == c1 && c1 == c2) {
                result = c0
                console.log(`第${i + 1}列连接`)
                break
            }
        }
        // 斜
        if (game.qiPan[0] != 0 && game.qiPan[0] == game.qiPan[4] && game.qiPan[4] == game.qiPan[8]) {
            result = game.qiPan[4]
            console.log(`坐上右下`)
        } else if (game.qiPan[2] != 0 && game.qiPan[2] == game.qiPan[4] && game.qiPan[4] == game.qiPan[6]) {
            result = game.qiPan[4]
            console.log(`左下右上`)
        }
        return result
    }

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
            /* 胜利玩家 */winner: 0,
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
        let user = { userId: data.userId, seatId: game.freeSeatId.shift(), piece: game.freePiece.shift(), ready: false }
        game.currUserId = game.currUserId || data.userId
        game.users.push(user)
        GameManager.userId2GameId[data.userId] = data.gameId
        responds({ err: '', userId: data.userId, game: game })
    }
    // 离开房间
    GameManager.leaveGame = function (data, responds) {
        let game = GameManager.gameId2Game[GameManager.userId2GameId[data.userId]]
        let user = null
        for (var i = 0; i < game.users.length; i++) {
            if (game.users[i].userId == data.userId) {
                user = game.users[i]
                game.users.splice(i, 1)
                break
            }
        }
        game.freePiece.push(user.piece)
        game.freeSeatId.push(user.seatId)
        game.currUserId = game.currUserId == user.userId ? game.users.length > 0 ? game.users[0].userId : 0 : game.currUserId
        delete GameManager.userId2GameId[data.userId]

        responds({ err: '', userId: user.userId, game: game })
    }
    // 准备
    GameManager.ready = function (data, responds) {
        let game = GameManager.gameId2Game[GameManager.userId2GameId[data.userId]]
        for (var i = 0; i < game.users.length; i++) {
            if (game.users[i].userId == data.userId) {
                game.users[i].ready = data.ready
                break
            }
        }
        let start = game.users.length == 2 && game.users[0].ready && game.users[1].ready
        responds({ err: '', start: start, userId: data.userId, game: game })
    }
    // 落子
    GameManager.fallen = function (data, responds) {
        let game = GameManager.gameId2Game[GameManager.userId2GameId[data.userId]]
        if (game.qiPan[data.idx] != 0) {
            responds({ err: '已有棋子', game: { id: game.id } })
            return
        }
        game.qiPan[data.idx] = data.piece
        let needEnd = false
        let r = getResult(game.id)
        if (r != 0) {
            game.state = State.Result
            game.winner = game.currUserId
            needEnd = true
        }
        game.currUserId = game.users[0].userId == game.currUserId ? game.users[1].userId : game.users[0].userId

        responds({ err: '', state: needEnd, game: game })
        if (r != 0) {
            // 清空数据
            game.users[0].ready = false
            game.users[1].ready = false
            game.qiPan = [0, 0, 0, 0, 0, 0, 0, 0, 0]
            game.state = State.Ready
        }
    }

    module.exports = GameManager
}())