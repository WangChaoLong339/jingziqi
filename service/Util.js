(function () {
    let Util = {}

    Util.clone = function (obj) {
        return JSON.parse(JSON.stringify(obj))
    }

    Util.randomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min
    }

    module.exports = Util
}())