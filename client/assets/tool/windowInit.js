cc.Class({
    extends: cc.Component,

    onLoad: function () {
        // window.socket = window.io('http://175.24.14.66:3001')
        window.socket = window.io('http://localhost:3001')

        window.SocketCustom = require('SocketCustom')

        window.Clone = function (obj) {
            return JSON.parse(JSON.stringify(obj))
        }

        // 随机一个左闭右开的数字
        window.GetLimiteRandom = function (min, max) {
            return Math.floor(Math.random() * (max - min)) + min
        }

        window.IsEmpty = function (obj) {
            for (var i in obj) {
                return false
            }
            return true
        }

        window.SetSpriteFrame = function (path, sprite) {
            if (!path) {
                sprite.spriteFrame = null
                return
            }
            cc.loader.loadRes(path, cc.SpriteFrame, function (err, spriteFrame) {
                if (err) {
                    console.log(err)
                    return
                }
                sprite.spriteFrame = spriteFrame
            })
        }


        /*--------------------------------------------------分割线-------------------------------------------------*/
        /*
                                                       分割线以上是常用方法
                                                       分割线以下是扩展方法
        */
        /*--------------------------------------------------分割线-------------------------------------------------*/


        cc.Node.prototype.PathChild = function (path, componentName) {
            let names = path.split('/')
            let nd = null

            for (let i = 0; i < names.length; i++) {
                if (nd) {
                    nd = nd.getChildByName(names[i])
                } else {
                    nd = this.getChildByName(names[i])
                }
            }

            if (componentName) {
                return nd.getComponent(componentName)
            } else {
                return nd
            }
        }
    },
});