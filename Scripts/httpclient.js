layui.define(['auth', 'layer'], function (exports) {
    "use strict";
    var $ = layui.jquery,
        auth = layui.auth,
        layer = layui.layer;

    var httpclient = {
        get: function (url, data, callback) {
            return $.get(url, data, callback);
        },
        post: function (url, data, callback) {
            return $.post(url, data, callback);
        },
        delete: function (url, data, callback) {
            return $.delete(url, data, callback);
        },
        put: function (url, data, callback) {
            return $.put(url, data, callback);
        },
        ajax: function (opt) {
            // 备份opt中error和success方法
            var fn = {
                error: function (XMLHttpRequest, textStatus, errorThrown) { },
                success: function (data, textStatus) { }
            };
            if (opt.error) {
                fn.error = opt.error;
            }
            if (opt.success) {
                fn.success = opt.success;
            }

            var _opt = $.extend(opt, {
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    fn.error(XMLHttpRequest, textStatus, errorThrown);
                },
                success: function (data, textStatus) {
                    var status = data.status;
                    var errCode = data.errCode;
                    if (status == 200) {
                        fn.success(data, textStatus);
                    } else if (errCode == 'data_validation_error') {
                        var result = data.result;
                        var msgs = result.map(function (r) {
                            return r.errors.join('<br/>');
                        }).join('<br/>');
                        layer.open({
                            content: msgs || '参数校验错误',
                            zIndex: layer.zIndex,
                            title: '错误提示',
                            success: function (layero) {
                                layer.setTop(layero);
                            }
                        });
                    } else if (status == 401) {
                    } else if (status == 403) {
                    } else if (status == 404) {
                    } else if (status == 500) {
                        layer.open({
                            content: data.errMsg || '服务端发生异常',
                            zIndex: layer.zIndex,
                            title: '错误提示',
                            success: function (layero) {
                                layer.setTop(layero); 
                            }
                        });
                    } else {
                    }
                },
                beforeSend: function (XHR) {
                    if (auth.isLogin()) {
                        XHR.setRequestHeader("Authorization", auth.getUser().token);
                    }
                },
                complete: function (XHR, TS) {
                }
            });
            return $.ajax(_opt);
        }
    };

    $.each(["get", "post", "put", "delete"], function (i, method) {
        $[method] = function (url, data, callback) {
            // Shift arguments if data argument was omitted
            if ($.isFunction(data)) {
                callback = data;
                data = undefined;
            }
            return httpclient.ajax({
                url: url,
                type: method,
                dataType: 'JSON',
                contentType: 'application/json; charset=utf-8',
                data: data,
                success: callback
            });
        };
    });

    exports('httpclient', httpclient);
});