/** common.js By Beginner Emain:zheng_jinfan@126.com HomePage:http://www.zhengjinfan.cn */
layui.define(function (exports) {
    "use strict";
    var common = {
        /**
		 * 抛出一个异常错误信息
		 * @param {String} msg
		 */
        throwError: function (msg) {
            throw new Error(msg);
            return;
        },

        /**
		 * 弹出一个错误提示
		 * @param {String} msg
		 */
        msgError: function (msg) {
            layer.msg(msg, {
                icon: 5
            });
            return;
        },
        /**
         * 弹层显示
         */
        layerShow: function(t, e, n, r, a) { 
            null != t && "" != t || (t = !1),
            null != r && "" != r || (r = 800),
            null != a && "" != a || (a = $(window).height() - 300),
            layer.open({
                type: 2,
                area: [r + "px", a + "px"],
                maxmin: !0,
                shade: 'layui-layer-rim',
                title: t,
                content: e
            })
        },

        /**
         * 获取连接参数
         * @param {String} name
         */
        getUrlParam: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg); //匹配目标参数
            if (r != null) return unescape(r[2]); return null; //返回参数值
        },

        /**
         * 移除数组中指定值
         * @param {Array} arr
         * @param {String} val
         */
        removeByValue: function (arr, val) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == val) {
                    arr.splice(i, 1);
                    break;
                }
            }
        },

        /**
         * 深度拷贝
         */
        deepClone: function (obj) {
            var _tmp,result;
            _tmp = JSON.stringify(obj);
            result = JSON.parse(_tmp);
            return result;
        },

        // 获取当前日期
        GetDateStr: function(AddDayCount) { //定义时间点
            var dd = new Date(); 
            dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期 
            var y = dd.getFullYear(); 
            var m = dd.getMonth()+1;//获取当前月份的日期 
            var d = dd.getDate(); 
            return y+"-"+m+"-"+d; 
        },

        //new一个Object 封装成json提交
        getArrayInfo: function (data, postParam, pre) {
            for (var i = 0; i < data.length; i++) {
                for (j in data[i]) {
                    postParam[pre + "[" + i + "]." + j] = data[i][j];
                }
            }
        },

        encode: function (str, flag) {
            if (flag) {
                return encodeURIComponent(str);
            } else {
                return encodeURIComponent(encodeURIComponent(str));
            }
        },
    };

    exports('common', common);
});