cc.Class({
    extends: cc.Component,

    properties: {
        val: cc.Label,
    },

    onLoad: function () {
    },

    init: function (val) {
        this.node.opacity = 0
        this.val.string = val

        this.node.stopAllActions()

        this.node.runAction(cc.sequence(
            cc.fadeIn(0.1),
            cc.delayTime(1),
            cc.fadeOut(0.4),
        ))
    },
});
