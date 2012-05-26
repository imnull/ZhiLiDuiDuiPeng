var game = {};
game.init = function () {
    if (game.testLocalStorage() == undefined) {
        alert('不支持本地存储');
    }
    game.loadPage('welcome');
};
game.testLocalStorage = function () {
    try {
        if (!!window.localStorage) return window.localStorage;
    } catch (e) {
        return undefined;
    }
}
//加载页面
//页面转换通过此方法控制
game.loadPage = function (page_name) {
    switch (page_name) {
        case "welcome":
            page_welcome.draw();
            break;
        case "select_mode":
            page_select_mode.draw();
            break;
        case "chose_sence":
            page_chose_sence.draw();
            break;
        case "play":
            page_play.draw();
            break;
        default:
    }

};



