layui.define(function (exports) {
    "use strict";
    var userInfo = "MY_USER_INFO";

    var auth = {
        isLogin: function () {
            var user = localStorage.getItem(userInfo);
            if (user == '' || user == undefined || user == "undefined")
                return false;
            var userObj = JSON.parse(user);
            if (userObj.token == '' || userObj.token == undefined || userObj.token == "undefined")
                return false;
            return true;
        },
        getUser: function () {
            var user = localStorage.getItem(userInfo);
            return JSON.parse(user);
        },
        login: function (user) {
            localStorage.setItem(userInfo, JSON.stringify(user));
        },
        logout: function () {
            localStorage.removeItem(userInfo);
        }
    };

    exports('auth', auth);
});