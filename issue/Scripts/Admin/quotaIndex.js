var areaViewModels = {
    area: ko.observableArray([]),
    areaList: ko.observableArray([]),
    cityList: ko.observableArray([]),
    city: ko.observable(),
    drivingArea: ko.observable(),
    plateNo: ko.observable(),
    vin: ko.observable(),
    enginePN: ko.observable()
}

layui.config({
    base: '../../Scripts/',
    version: new Date().getTime()
}).use(["httpclient", "form", 'element'], function () {
    var $ = layui.jquery,
        httpclient = layui.httpclient,
        element = layui.element(),
        dataQuota = {};

    var t = layui.form();
    $('.layui-tab-title li').on('mouseenter', function (elem) {
        var $this = $(this),
            index = $this.index();
        $('.layui-tab-title li').removeClass('layui-this');
        $('.layui-tab-item').removeClass('layui-show');

        $this.addClass('layui-this');
        $(".layui-tab-item").eq(index).addClass('layui-show');
    });

    t.on('select(province)', function(data){
        var p = data.value;
        var city = areaViewModels.area().filter(function(o){
            if(o.code==p){
                return o;
            }
        });
        areaViewModels.cityList(city[0].child);
        t.render('select');
    });
    t.on("select(city)", function(data) {
        var v = data.value;
        var p = areaViewModels.area().filter(function(o){
            return o;
        });
        var vi = p[0].child.filter(function(o){
            if(o.code==v){
                return o;
            }
        });
        areaViewModels.plateNo(vi[0].vehiclePlate);
        areaViewModels.city(vi[0].code);
        areaViewModels.drivingArea(vi[0].name);
        t.render("select")
    });

    t.verify({
        plateNo: function (e) {
            if (!new RegExp(/^[\u4e00-\u9fa5]{1}[A-Z_a-z]{1}[A-H_a-h_J-N_j-n_P-Z_p-z_0-9]{5,6}$/g).test(e)) return "车牌号格式不正确"
        },
        vin: function (e) {
            if (e.length != 17) return "请核对您的车架号是否输入正确"
        },
        enginePN: function (e) {
            if (e.length != 6) return "请核对您的发动机号是否输入正确"
        }
    }),
    t.on("submit(subQuota)",
    function (e) {
        var plateNo = areaViewModels.plateNo().toUpperCase();
        
        dataQuota = {
            insCityCode: areaViewModels.city(),
            district: areaViewModels.drivingArea(),
            plateNo: plateNo
        };
        areaViewModels.quickQuote(false);
        return false;
    }),

    t.on("submit(subNonNumQuota)",
    function (e) {
        dataQuota = {
            plateNo: '',
            insCityCode: areaViewModels.city(),
            district: areaViewModels.drivingArea(),
            vin: areaViewModels.vin(),
            engineNo: areaViewModels.enginePN()
        };
        areaViewModels.quickQuote(true);
        return false;
    });
    areaViewModels.quickQuote = function(isNewCar){
        httpclient.get(applyUrls.quickQuoteUrl, function (data) {
            if (data.status == 200) {
                var flowId = data.result.flowId;
                localStorage.setItem('flowIdNew', flowId);
                localStorage.setItem('userByPhone', data.result.sellerMobile);
                dataQuota.phone = data.result.sellerMobile;
                dataQuota = JSON.stringify(dataQuota);
                localStorage.setItem('dataQuota', dataQuota);
                var title_suffix = '';
                if (isNewCar == false) {
                    title_suffix = areaViewModels.plateNo();
                    areaViewModels.vin('');
                    areaViewModels.enginePN('');
                } else {
                    title_suffix = areaViewModels.vin();
                    areaViewModels.plateNo('');
                    areaViewModels.ownerIdCardNo('');
                }
                parent.tab.tabAdd({
                    href: '../issue/Views/Quotation.html',
                    title: "出单-" + title_suffix.toUpperCase()
                })
            } else {
                layer.msg(data.errMsg);
            }
        });
    }
    areaViewModels.loadData = function () {
        httpclient.get(applyUrls.provincesUrl, function (data) {
            var data = data.result;
            areaViewModels.area(data)
            var province = data.map(function(o){
                return {
                    id: o.id,
                    code: o.code,
                    name: o.name
                };
            });
            areaViewModels.areaList(province);
            t.render("select");
        });
    }
    areaViewModels.loadData();
    ko.applyBindings(areaViewModels, document.getElementById("offerForm"));
});