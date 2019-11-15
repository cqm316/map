var ownerVehicle = { //车辆信息
    plateNo : ko.observable(""),
    carOwnerName : ko.observable(),
    carOwnerIDNo : ko.observable(),
    carOwnerType : ko.observable(),
    vin : ko.observable(),
    engineNo : ko.observable(),
    fullPriceModel : ko.observable(),
    model : ko.observable(),
    makerModel : ko.observable(''),
    purchasePrice : ko.observable(),
    analogyCarPrice : ko.observable(),
    year : ko.observable(),
    passengerCapacity : ko.observable(),
    registerDate : ko.observable(),
    remark : ko.observable(),
    exhaustMeasure : ko.observable(),
    changedOwner : ko.observable(),
    drivingArea : ko.observable(""),
    changedOwnerDate : ko.observable(),
    brandName : ko.observable(),
    vehicelModelCode : ko.observable('')
};

var ownerInfo = { // 客户信息
    contact: ko.observable(),
    phone1: ko.observable(),
    phone2: ko.observable(),
    email: ko.observable()
}

var applicant = { //投保人字段
    name: ko.observable(),
    idNo: ko.observable(),
    phone: ko.observable(),
    type: ko.observable()
}

var insured = {  //被保人字段
    name: ko.observable(),
    idNo: ko.observable(),
    phone: ko.observable(),
    type: ko.observable()
}

layui.config({
    base: '../../Scripts/',version: new Date().getTime()
}).use(['element', 'layer', 'navbar','laydate' ,'form','validator','common','httpclient','tab'], function () {
    var $ = layui.jquery,
        layer = layui.layer,
        form = layui.form(),
        common = layui.common,
        httpclient = layui.httpclient,
        validator = layui.validator,
        dataQuota = localStorage.getItem('dataQuota'),
        dataQuota = JSON.parse(dataQuota),
        QuotationViewModel = new QuotationViewModel();

    function QuotationViewModel() {
        var self = this,
            postParam = {},
            cps = [],
            getLocalInfo = localStorage.getItem("recordInsuranAdmin");

        self.ownerVehicle = ko.observable(ownerVehicle);
        self.applicant = ko.observable(applicant);
        self.insured = ko.observable(insured);
        self.ownerInfo = ko.observable(ownerInfo);

        self.ownerId = ko.observable(0);
        self.isNonPlateNo = ko.observable(false);
        self.modleErrTipTxt = ko.observable('');
        self.shouldShowModel = ko.observable(false);
        self.shouldModleErrTip = ko.observable(false);
        self.shouldShowNonData = ko.observable(false);
        self.shouldShowModelList = ko.observable(false);
        self.shouldShowTransfer = ko.observable(false);
        self.shouldShowApplicant = ko.observable(false);
        self.shouldShowInsured = ko.observable(false);
        self.shouldShowSaveBtn = ko.observable(false);
        self.shouldShowResult = ko.observable(false);
        self.shouldShowInsurance = ko.observable(true);
        self.isHasInsureInfo = ko.observable(true);
        self.isHasInsuredData = ko.observable(true);
        self.toQuotaBtn = ko.observable(true);
        self.shouldShowBtnArea = ko.observable(false);
        self.modelDataList = ko.observableArray();
        self.jqTime = ko.observable("");
        self.syTime = ko.observable("");
        self.insureId = ko.observable("");
        self.riskKindSArr = ko.observable();
        self.listArray = ko.observableArray();
        self.insCorpsArray = ko.observableArray();
        self.resultDetail = ko.observableArray();
        self.itemCode = ko.observable();
        self.itemDetails = ko.observable({shortName:'', statusDisplay: '--', status: 'loading', details: {}});
        self.indangerQuantity = ko.observable('');
        self.bzBeginDate = ko.observable('');
        self.bsBeginDate = ko.observable('');
        self.bzEndDate = ko.observable('');
        self.bsEndDate = ko.observable('');

        self.judgeCarType = function($this,thisVal,district,isIdCard,isload){ // 实时校验证件号对应属性
            var isApiCheck = false,arro = ["51","52","53","59","11","13","19"],arre = ["91","92","93"];
            var thisVal = thisVal.replace(/\s/g, "");
            function frontCodeFun(frontCode){
                removeErr();
               if (arro.indexOf(frontCode) != -1) {
                    typeShow('Organ');
                }else if(arre.indexOf(frontCode) != -1){
                    typeShow('Enterprise');
                }else{
                    if (isload == true) {
                        removeErrTip();
                    } else {
                        errShow('证件号无效，不是合法的证件号');
                    }
                }
            }
            function typeShow(type){
                if(isIdCard == 0){
                    self.ownerVehicle().carOwnerType(type);
                }else if(isIdCard == 1){
                    self.applicant().type(type);
                }else if(isIdCard == 2){
                    self.insured().type(type);
                }
            }
            function errShow(txt){
                $this.next('.validationMessage').show();
                $this.next('.validationMessage').text(txt);
                $this.focus();
            }
            function removeErr() {
                $this.next('.validationMessage').hide();
                $this.next('.validationMessage').text("");
            }
            if(!thisVal){
                errShow("请输入证件号");
            }else if(thisVal.length >= 10){
                if(validator.isOrganizationCode(thisVal)){
                    var idCardParam = {
                        code: thisVal.toLowerCase(),
                        district: dataQuota.district
                    }
                    if(isApiCheck == false){
                        httpclient.ajax({
                        async: false,
                            type : "GET",
                            data: idCardParam,
                            url : applyUrls.carTypeUrl,
                            success : function(data) {
                                var data = data.result;
                                if(data){
                                    isApiCheck = true;
                                    for (var i = 0; i < data.length; i++) {
                                        var item = data[i];
                                        if(item.orgCode == thisVal){
                                            var frontCode = item.creditCode.substring(0,2);
                                            frontCodeFun(frontCode);
                                        }
                                    }
                                }
                            }
                        });
                    }
                }else if(thisVal.length == 18){
                    if(validator.IsIDCard(thisVal) == true){
                        removeErr();
                        typeShow('Person');
                    }else if(validator.isOrganization(thisVal)){
                        var frontCode = thisVal.substring(0,2);
                        frontCodeFun(frontCode);
                    }else{
                        errShow('证件号无效，不是合法的证件号');
                    }
                }else if(thisVal.length == 15 && validator.IsIDCard(thisVal) == true){
                    removeErr();
                    typeShow('Person');
                }else{
                    errShow('证件号无效，不是合法的证件号');
                }
            }else{
                errShow('证件号无效，不是合法的证件号');
            }
            if(form) form.render('select');
        }

        self.carInfoResult = function(result){  // 历史车辆信息 展示
            var resultData = result.car;
            var registerDate = common.GetDateStr(0);

            ko.mapping.fromJS(resultData, {}, self.ownerVehicle);
            self.ownerVehicle().drivingArea(dataQuota.district);
        
            if(resultData.registerDate){
                registerDate = resultData.registerDate.substring(0, 10);
            }
            self.ownerVehicle().registerDate(registerDate);

            if (result.owner) {
                ko.mapping.fromJS(result.owner, {}, self.ownerInfo);
            }

            if(resultData.passengerCapacity == 0){
                self.ownerVehicle().passengerCapacity('');
            }
            
            if(resultData.changedOwner == true){
                self.shouldShowTransfer(true);
                self.ownerVehicle().changedOwnerDate(resultData.changedOwner);
            }else{
                self.shouldShowTransfer(false);
            }

            self.judgeCarType($('#idCard'),resultData.carOwnerIDNo,dataQuota.district,0,true);

            if(result.applicant && result.applicant != ''){
                self.applicant(ko.mapping.fromJS(result.applicant));
                self.isHasInsureInfo(false);
                self.shouldShowApplicant(true);
                if(result.applicant.idNo){
                    self.judgeCarType($('#insureIdCard'),result.applicant.idNo,dataQuota.district,1,true);
                }
            }else{
                self.isHasInsureInfo(true);
                self.shouldShowApplicant(false);
            }

            if(result.insured && result.insured != ''){
                self.insured(ko.mapping.fromJS(result.insured));
                self.isHasInsuredData(false);
                self.shouldShowInsured(true);
                if(result.insured.idNo){
                    self.judgeCarType($('#insuredIdCard'),result.insured.idNo,dataQuota.district,2,true);
                }
            }else{
                self.isHasInsuredData(true);
                self.shouldShowInsured(false);
            }

            $(".textaModel").each(function () {
                this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
            }).on('input', function () {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
            form.render();
        }

        self.getInsCorps = function(){ // 获取保险公司
            layer.load(2);
            $.getJSON(applyUrls.getInsCorpsUrl, function (data) {
                layer.closeAll('loading');
                if (data.status == 200) {
                    self.insCorpsArray(data.result);
                } else {
                    layer.msg(data.errMsg);
                }
            });
        }

        self.getOwnerInfo = function (){ // 获取客户信息
            var oUrl = applyUrls.getOwnerInfoUrl + '?clerkPhone=' + dataQuota.phone + '&plateNo=' + dataQuota.plateNo + '&insCity=' + dataQuota.district;
            var carInfo = localStorage.getItem("carInfoAdmin");
            if (dataQuota.vin) {
                vin = dataQuota.vin;
                oUrl = oUrl + '&vin=' + vin;
                if (dataQuota.engineNo != '') {
                    engineNo = dataQuota.engineNo;
                    oUrl = oUrl + '&engineNo=' + engineNo;
                }
            }

            $.getJSON(oUrl, function (data) {
                if (data.status == 200) {
                    if (data.result) {
                        self.ownerId(data.result.id);
                        if (!carInfo) {
                            ko.mapping.fromJS(data.result.contactInfo, {}, self.ownerInfo);
                        }
                    }
                }
            });
        }

        self.loadHistoryData = function (){  //获取历史记录
            var carInfo = localStorage.getItem("carInfoNew"),
                getInfoParam = {};

            self.getOwnerInfo();
            if(carInfo){
                layer.closeAll('loading');
                var resultData = JSON.parse(carInfo);
                self.carInfoResult(resultData);
            }

            if (dataQuota.vin) {
                self.isNonPlateNo(true);
                getInfoParam = {
                    plateNo: dataQuota.plateNo,
                    insCityCode: dataQuota.insCityCode,
                    vin: dataQuota.vin,
                    engineNo: dataQuota.engineNo
                }
            } else {
                self.isNonPlateNo(false);
                getInfoParam = {
                    plateNo: dataQuota.plateNo,
                    insCityCode: dataQuota.insCityCode
                }
            }
            postParam.insCityCode = dataQuota.insCityCode;

            setTimeout(function () {
                layer.closeAll('loading');
            }, 40000);

            // httpclient.post(applyUrls.historyCarDataUrl, getParam, function (data) {
            $.getJSON(applyUrls.issueHistoryUrl, function (data) {
                layer.closeAll('loading');
                if (data.status == 200 && "result" in data) {
                    var resultData = data.result,carInfo = localStorage.getItem("carInfoNew");
                    if (carInfo) {
                        var carInfo = JSON.parse(carInfo);
                        self.carInfoResult(carInfo);
                    } else {
                        self.carInfoResult(resultData);
                    }

                    if (getLocalInfo) {
                        self.infoRender(JSON.parse(getLocalInfo));
                    } else {
                        if(resultData.riskKindSelected != ''){
                            if(resultData.bzBeginDate !='' || resultData.bsBeginDate != ''){
                                self.riskKindSArr(resultData.riskKindSelected);
                                self.infoRender(resultData.riskKindSelected);
                            }else{
                                self.getBestInsurances();
                            }
                        }else{
                            self.getBestInsurances();
                        }
                    }
                }
            });
            self.shouldShowBtnArea(true);
            self.bind();
        };

        self.checkIsPlateNo = function(){ // 未上牌切换
            self.isNonPlateNo(!self.isNonPlateNo());
        }

        self.bind = function(){
            $('#idCard').keyup(function(){
                var $this = $(this),
                    thisVal = $this.val();
                self.judgeCarType($this,thisVal,dataQuota.district,0,false);
            });

            $('#insureIdCard').keyup(function(){
                var $this = $(this),
                    thisVal = $this.val();
                self.judgeCarType($this,thisVal,dataQuota.district,1,false);
            });

            $('#insuredIdCard').keyup(function(){
                var $this = $(this),
                    thisVal = $this.val();
                self.judgeCarType($this,thisVal,dataQuota.district,2,false);
            });

            $('input#phone1').on('input propertychange', function () {
                var phone1 = $(this).val();
                var phone2 = $("#phone2").val();
                if ((/^1[34578]\d{9}$/.test(phone1))) {
                    if (phone2 == null || phone2 == '') {
                        $("#phone2").val(phone1);
                        self.ownerInfo().phone2(phone1);
                    } else {
                        $("#phone2").val(phone2);
                        self.ownerInfo().phone2(phone2);
                    }
                }
            });

            // 所属性质
            $('.i-relationPeopleType .layui-anim dd').bind('click', function(){
                var $this = $(this), type = $this.attr('data-type'), layVal = $this.attr('lay-value');
                if(type == 'car'){
                    QuotationViewModel.ownerVehicle().carOwnerType(layVal);
                }else if(type == 'insure'){
                    QuotationViewModel.applicant().type(layVal);
                }else{
                    QuotationViewModel.insured().type(layVal);
                }
            });

            //座位数
            $('#seat').bind('click',function(){
                layer.open({
                  type: 1,
                  title: '座位数',
                  skin: 'layui-layer-rim', //加上边框
                  area: ['400px', '200px'], //宽高
                  content: '<div class="seat-area"><p class="box-tip">目前只有人保、平安、天安、太平洋支持修改座位数报价，其他险企将以默认车座数报价。</p><div class="seat-nums" id="J-seats"><button data-val="2" class="layui-btn layui-btn-primary">2坐</button><button data-val="3" class="layui-btn layui-btn-primary">3坐</button><button data-val="4" class="layui-btn layui-btn-primary">4坐</button><button data-val="5" class="layui-btn layui-btn-primary">5坐</button><button data-val="6" class="layui-btn layui-btn-primary">6坐</button><button data-val="7" class="layui-btn layui-btn-primary">7坐</button><button data-val="8" class="layui-btn layui-btn-primary">8坐</button><button data-val="9" class="layui-btn layui-btn-primary">9坐</button></div></div>'
                });
                var listLi = $('#J-seats .layui-btn'),
                    seatVal = QuotationViewModel.ownerVehicle().passengerCapacity();

                $.each(listLi, function (index, list) {
                    var $this = $(this),
                        dataVal = $this.attr('data-val');
                    if (seatVal == dataVal) {
                        $this.removeClass('layui-btn-primary').siblings().addClass('layui-btn-primary');
                    }
                });
                listLi.bind('click', function () {
                    var $this = $(this),
                        dataVal = $this.attr('data-val');
                    $this.removeClass('layui-btn-primary').siblings().addClass('layui-btn-primary');
                    QuotationViewModel.ownerVehicle().passengerCapacity(dataVal)
                    layer.closeAll();
                });
            });

            //车辆信息折叠
            $('#vehicle-side-down').on('click', function () {
                $('#modCom').addClass('mod-info');
                var sideWidth = $('.mod-ownerVehicle-left').width();
                if (sideWidth === 350) {
                    $('.mod-quote-right').animate({
                        left: '0'
                    }); 
                    $('.mod-ownerVehicle-left').animate({
                        width: '0'
                    });
                    $("#vehicle-side-open").show();
                }
            });

            // 展开车辆信息
            $("#vehicle-side-open").on('click',function(){
                $("#vehicle-side-open").hide();
                $('#modCom').removeClass('mod-info');
                $('.mod-quote-right').animate({
                    left: '350'
                });
                $('.mod-ownerVehicle-left').animate({
                    width: '350'
                });
            });
        }

        self.getModelList = function(){ //车型价格
            self.modelDataList.removeAll();
            layer.load(2);
            var param = { 
                    insCityCode: dataQuota.insCityCode, 
                    model: self.ownerVehicle().model(),
                    vehicelModelCode: self.ownerVehicle().vehicelModelCode(),
                    makerModel: self.ownerVehicle().makerModel()
                };
            $.getJSON(applyUrls.modelListUrl, function (data) {
                layer.closeAll('loading');
                if (data.status == 200) {
                    var data = data.result;
                    if(data){
                        self.shouldShowNonData(false);
                        self.shouldShowModelList(true);
                        self.modelDataList(data);
                    }else{
                        self.shouldShowModelList(false);
                        self.shouldShowNonData(true);
                    }
                    var ihtml = $('.illustration').html();
                    if(layer){
                        layer.open({
                          type: 1,
                          title: '品牌型号查询',
                          skin: 'layui-layer-rim', //加上边框
                          area: ['400px', '400px'], //宽高
                          content: '<div class="model-area">'+ ihtml +'</div>'
                        });
                    }
                    $('.J-m-list').bind('click',function(){  //选择车型价格
                        var $this = $(this);
                        self.ownerVehicle().model($this.attr('data-model'));
                        self.ownerVehicle().brandName($this.attr('data-brandName'));
                        self.ownerVehicle().fullPriceModel($this.attr('data-fullPriceModel'));
                        self.ownerVehicle().makerModel($this.attr('data-makerModel'));
                        self.ownerVehicle().purchasePrice($this.attr('data-purchasePrice'));
                        self.ownerVehicle().passengerCapacity($this.attr('data-passengerCapacity'));
                        layer.closeAll();
                    });
                }else{
                    layer.msg(data.errMsg);
                }
            });
        };

        self.showModelList = function(){  //显示车型价格列表
            var model = $('#model').val();
            if (model == '') {
                self.shouldModleErrTip(true);
                self.modleErrTipTxt('请输入车主的品牌型号');
            } else {
                self.shouldModleErrTip(false);
                self.shouldShowModel(true);
                self.getModelList();
            }
        };

        self.checkYesTransfer = function(){ //是过户车
            self.shouldShowTransfer(true);
            self.ownerVehicle().changedOwner(true);
        };
        
        self.checkNoTransfer = function(){  //不是过户车
            self.shouldShowTransfer(false);
            self.ownerVehicle().changedOwner(false);
        };
        
        self.shouldApplicantForm = function(){  //投保人
            self.shouldShowApplicant(!self.shouldShowApplicant());
            self.isHasInsureInfo(!self.isHasInsureInfo());

            if (self.applicant().name() == undefined && self.applicant().idNo() == undefined && self.applicant().phone() == undefined) {
                self.applicant().name(self.insured().name());
                self.applicant().idNo(self.insured().idNo());
                self.applicant().phone(self.insured().phone());
            }
        };

        self.shouldInsuredForm = function(){ // 被保人
            self.shouldShowInsured(!self.shouldShowInsured());
            self.isHasInsuredData(!self.isHasInsuredData());

            if (self.insured().name() == undefined && self.insured().idNo() == undefined && self.insured().phone() == undefined) {
                self.insured().name(self.applicant().name());
                self.insured().idNo(self.applicant().idNo());
                self.insured().phone(self.applicant().phone());
            }
        }

        self.look = function(data){ // 选择车选方案 保额格式转换
            var numarr=[];
            for(var i=0;i<data.length;i++){
                if(!isNaN(data[i]) && data[i].length>4){
                    s=data[i]/10000+'万'
                }else{
                    s=data[i]
                }
                numarr.push(s)
            }
            return numarr
        };

        self.hideSomeItems = function(){ // 隐藏某些保险项目
            $("#BLX").hide();
            $("#BLX").find(".insureInput").removeAttr("checked");
            $("#ZRX").hide();
            $("#ZRX").find(".insureInput").removeAttr("checked");
            $("#HHX").hide();
            $("#HHX").find(".insureInput").removeAttr("checked");
            $("#SSX").hide();
            $("#SSX").find(".insureInput").removeAttr("checked");
            $("#WFZDDSF").hide();
            $("#WFZDDSF").find(".insureInput").removeAttr("checked");
        }

        self.rendering = function () { //渲染险种
            httpclient.get(applyUrls.getinsureTypeUrl, function (data) {
                var items = data.result[1].insKindRisks;
                self.listArray(items);

                // 不选机动车损失保险
                $('#CSX .item-custom-width').bind('click', function(){
                    var $this = $(this).find('.layui-form-checkbox');
                    if($this.hasClass('layui-form-checked')){
                        $("#BLX").show();
                        $("#ZRX").show();
                        $("#HHX").show();
                        $("#SSX").show();
                        $("#WFZDDSF").show();
                    }else{
                        self.hideSomeItems();
                    }
                });
                form.render();
            });
        };
        
        self.getBestInsurances = function () { // 获取推荐方案
            httpclient.get(applyUrls.bestInsuredUrl, function (data) {
                if (data.status == 200 && "result" in data) {
                    var itemsBest = data.result;
                    self.infoRender(itemsBest);
                }
            });
        };
        
        self.infoRender = function (insureArry) { //险种赋值
            //清空
            $("#jqtype").removeAttr("checked");
            $("#sytype").removeAttr("checked");
            $.each($("#insListing").find("tr"), function (index, txt) {
                var $this = $(this);
                $this.find(".insureInput").removeAttr("checked");
                $this.find(".insureSelect option[value='0']").attr("selected","selected");
                $this.find(".insureCheck").removeAttr("checked");
            })
            //交强险
            if(insureArry.bzBeginDate){
                var jqEffectiveDate = insureArry.bzBeginDate;
                if(jqEffectiveDate.length > 0){
                    var jqEffectiveTime = jqEffectiveDate.substring(0, 10);
                    self.jqTime(jqEffectiveTime);
                    $("#jqtype").attr("checked",true);
                }
                
            }
            //商业险
            if(insureArry.bsBeginDate){
                var syEffectiveDate = insureArry.bsBeginDate,
                    syEffectiveTime = syEffectiveDate.substring(0, 10);
                self.syTime(syEffectiveTime);
                $("#sytype").attr("checked",true);

                //商业险险种
                var bsRiskKindItems = insureArry.bsRiskKindItems;       
                if (bsRiskKindItems) {
                    var hasSyLength = bsRiskKindItems.length,icodeArr = [];
                    for (var i = 0; i < hasSyLength; i++) {
                        var item = bsRiskKindItems[i],
                            insuredCode = item.riskKindItemCode,
                            isDeductible = item.isDeductible,
                            glassMadeInChina = item.glassMadeInChina;
                        icodeArr.push(insuredCode);
                        $.each($("#insListing").find("tr"), function (index, txt) {
                            var $this = $(this),
                                hasId = $this.attr("value");
                            if(insuredCode == hasId){
                                $this.find(".insureInput").attr("checked",true);
                                if(isDeductible == true){//不计免赔
                                   $this.find(".insureCheck").attr("checked",true);
                                } else {
                                  $this.find(".insureCheck").removeAttr("checked");
                                }

                                if (hasId == "BLX") { 
                                    $this.find(".insureSelect option[value='0']").removeAttr("selected");
                                    if (glassMadeInChina == false) {
                                        var glass = "进口";
                                        $this.find(".insureSelect option[value='"+ glass +"']").attr("selected","selected");
                                    } else {
                                        var glass = "国产";
                                        $this.find(".insureSelect option[value='"+ glass +"']").attr("selected","selected");
                                    }
                                }else{
                                    if(item.compensationLimits > 4){
                                        compennum = item.compensationLimits/10000+'万';
                                    }else{
                                        compennum = item.compensationLimits;
                                    }
                                    $this.find(".insureSelect option[value='"+ compennum +"']").attr("selected","selected");
                                }
                                form.render();
                            }
                        });
                    }
                    if(icodeArr.indexOf('CSX') == -1){
                        self.hideSomeItems();
                    }
                }
            }
            form.render();
        };

        self.saveCarData = function () { // 保存车辆信息
            self.ownerVehicle().carOwnerName(self.ownerVehicle().carOwnerName().replace(/\s/g, ""));
            self.ownerVehicle().carOwnerIDNo(self.ownerVehicle().carOwnerIDNo().replace(/\s/g, ""));
            self.ownerVehicle().registerDate($('#registerDate').val());
            self.ownerVehicle().changedOwnerDate($('#changedOwnerDate').val());
            if(self.isNonPlateNo() == true){
                self.ownerVehicle().plateNo('未上牌');
            }
            postParam.car = ko.mapping.toJS(self.ownerVehicle);
            postParam.applicant = '';
            postParam.insured = '';

            if(self.isHasInsureInfo() == false){
                postParam.applicant = ko.mapping.toJS(self.applicant);
            }
            if(self.isHasInsureInfo() == false){
                postParam.insured = ko.mapping.toJS(self.insured);
            }

            var carInfoNew = JSON.stringify(postParam);
            localStorage.setItem("carInfoNew", carInfoNew);
        };

        self.getInsurancesSel = function(){//获取选中数据
            var insurances = [],resultInfo = {},numJson = {},bsBeginDate = {},bzBeginDate = {};

            //判断是否购买交强险
            bzBeginDate = $("#jqTime").val();
            resultInfo.bzBeginDate = bzBeginDate;

            //商业险
            if ($("#sytype").attr("checked") == "checked") {
                bsBeginDate = self.syTime();
                $.each($("#insListing").find("tr"), function (index, txt) {
                    numJson = {};
                    var $this = $(this);
                    if ($this.find(".insureInput").attr("checked") == "checked") {
                        arrnum = $this.attr("value");
                        numJson.riskKindItemCode = arrnum;

                        //取到不计免赔
                        prodeductible = $this.find(".insureCheck");
                        if (prodeductible.length > 0) {
                            if (prodeductible.attr("checked") == "checked") {
                                numJson.isDeductible = true;
                            }
                        }
                        //取到价格
                        selectmoney = $this.find(".insureSelect");
                        if (selectmoney.length > 0) {
                            var numVal = selectmoney.siblings('.layui-unselect').find('.layui-input').val();
                            if (numJson.riskKindItemCode == 'BLX') {
                                if (numVal == "国产") {
                                    numJson.glassMadeInChina = true;
                                } else {
                                    numJson.glassMadeInChina = false;
                                }
                            } else {
                                numVal = String(numVal);
                                if (numVal.indexOf("万") > -1) {
                                    var numV = numVal.substring(0, numVal.length - 1)
                                    numVal = Number(numV) * 10000;
                                } else {
                                    numVal = numVal;
                                }
                                numJson.compensationLimits = numVal;
                            }
                        }
                        insurances.push(numJson);
                    }
                    resultInfo.bsBeginDate = bsBeginDate;
                    resultInfo.bsRiskKindItems = insurances;
                });
            }
            postParam.riskKindSelected = resultInfo;
            localStorage.setItem("recordInsuranAdmin",JSON.stringify(resultInfo));
        };
     
        self.subQuota = function() { //保存 车辆信息，选择车险方案信息
            form.on("submit(save)",
            function(e) {
                self.saveAllInfo(false);
                return false;
            });
        };

        self.saveAllInfo = function(isSub){ //保存 车辆信息，选择车险方案信息
            QuotationViewModel.saveCarData();
            QuotationViewModel.getInsurancesSel();
            postParam = JSON.stringify(postParam);
            layer.load(2);
            $.getJSON(applyUrls.subInsueBillUrl, function (data) {
                layer.closeAll('loading');
                if (data.status == 200) {
                    var insureId = data.result.insureId;
                    self.insureId(insureId);
                    if(isSub == false){
                        layer.msg('已保存');
                    }else{
                        self.insuranceCompany();
                    }
                } else {
                    layer.msg(data.errMsg);
                }
            });
        }

        self.modifyQuota = function(){  // 修改 车辆信息，选择车险方案信息
            QuotationViewModel.shouldShowInsurance(true);
            QuotationViewModel.shouldShowResult(false);
            self.toQuotaBtn(true);
        }

        self.insuranceCompany = function(){ // 展示保险公司弹层
            var insuranceHtml = $('#insuranceCompany').html();
            layer.open({
              type: 1,
              title: '请选择报价的保险公司',
              skin: 'layui-layer-rim', //加上边框
              area: ['400px', '400px'], //宽高
              content: ''+ insuranceHtml +'',
              success: function (layero, index) { form.render(); },
            });
        }

        form.on("submit(sure)",
        function(e) {
            cps = [];
            var insuredInsCorps=[];
            $.each($(".layui-layer-content .selComps"), function (index, txt) {
                var $this = $(this), reCode = {}, calcCmp = {};
                if ($this.attr("checked") == "checked") {
                    var code = $this.attr('code');
                    calcCmp.insCorpCode = code;
                    calcCmp.isToQuota = true;
                    cps.push(code);
                    insuredInsCorps.push(calcCmp);
                }
            });
            if (cps == '') {
                layer.msg('请选择保险公司');
                return false;
            }
            layer.closeAll();
            self.calculateQuota(insuredInsCorps);//报价
            return false;
        });

        self.toQuote = function(){  // 立即报价
            form.on("submit(toQuote)",
            function(e) {
                if(self.insureId() !=''){
                    self.insuranceCompany();
                }else{
                    self.saveAllInfo(true);
                }
                return false;
            });
        };

        self.calculateQuota = function (insCodes) { // 获取支持报价的保险公司
            var url = applyUrls.calculatedPrices + '?insureId=' + self.insureId();
            var calcParam= { insuredInsCorps: insCodes };

            $.getJSON(url, JSON.stringify(calcParam), function (data) {
                if (data.status == 200) {
                        var codes = cps, reCode = {}, res = [];
                        for (var i = 0; i < codes.length; i++) {
                            reCode = {};
                            reCode.code = codes[i];
                            $.each($(".layui-layer-content .selComps"), function (index, txt) {
                                var $this = $(this);
                                if ($this.attr("checked") == "checked") {
                                    var code = $this.attr('code'),
                                        shortName = $this.attr('shortName');
                                   if(reCode.code == code){
                                        reCode.shortName = shortName;
                                   }
                                }
                            });
                            reCode.details = {};
                            reCode.status = 'loading';
                            reCode.isRenewal = false;
                            res.push(reCode);
                            self.resultDetail(res);
                        }
                        layer.load(2);
                        QuotationViewModel.shouldShowInsurance(false);
                        QuotationViewModel.shouldShowResult(true);
                        self.toQuotaBtn(false);
                        layer.closeAll();
                        self.itemCode(self.resultDetail()[0].code);
                        $('#resultDetail li').removeClass('layui-this');
                        $('#resultDetail li:first-child').addClass('layui-this');
                        $('#resultContent .layui-tab-item:first-child').addClass('layui-show');
                        var insCodes = cps.toString();
                        var url = applyUrls.getInsureResultUrl + '?insureId=' + self.insureId() + '&insCorpCodes=' + insCodes;
                        self.quotaResult(url);
                    
                    if (cps.length == 0) {
                        if (!(typeof (Method) == 'undefined')) {
                            clearInterval(Method);
                        }
                    }
                } else {
                    layer.msg(data.errMsg);
                }
            });
        }

        self.quotaResult = function (url) { // 报价详情
            $.getJSON(url, function(data) {
                if(data.status == 200){
                    Method = setTimeout(function () { self.quotaResult(url) }, 5000);
                    if(data.result){
                        var result = data.result,
                            resultList = {},
                            newResult = [];
                        
                        resultList = self.resultDetail();
                        for(var i =0 ;i<resultList.length; i++){
                            var code = resultList[i].code;
                            var item = {
                                code : code,
                                shortName : resultList[i].shortName,
                                details : resultList[i].details,
                                status : resultList[i].status,
                                statusDisplay : resultList[i].statusDisplay,
                                isRenewal : resultList[i].isRenewal
                            };
                            for(var j =0;j< result.length; j ++){
                                var dataItem = result[j],
                                    currCode = dataItem.insCorp.code.toLowerCase();
                                if (currCode == code) {
                                    if (dataItem.underwritingStatus) {
                                        item.status = 'u' + dataItem.underwritingStatus.text;
                                        item.statusDisplay = dataItem.underwritingStatus.display;
                                    }else{
                                        item.status = 'q' + dataItem.quoteStatus.text;
                                        item.statusDisplay = dataItem.quoteStatus.display;
                                    }
                                    item.isRenewal = dataItem.coefficient.isRenewal;
                                    item.details = dataItem;
                                    if (dataItem.coefficient.indangerQuantity) { self.indangerQuantity(dataItem.coefficient.indangerQuantity); }
                                    if (dataItem.bzBeginDate) { self.bzBeginDate(dataItem.bzBeginDate); }
                                    if (dataItem.bsBeginDate) { self.bsBeginDate(dataItem.bsBeginDate) };
                                    if (dataItem.bzEndDate) { self.bzEndDate(dataItem.bzEndDate); }
                                    if (dataItem.bsEndDate) { self.bsEndDate(dataItem.bsEndDate); }
                                    if (currCode == cps[0]) { self.tabChanged(item,true); }
                                    if(self.itemCode() == currCode) { 
                                        self.itemDetails(item); console.log(item)
                                        $('#resultContent .layui-tab-item').addClass('layui-show');
                                    }
                                    common.removeByValue(cps, currCode);
                                    break;
                                }
                            }
                            newResult.push(item);
                        }
                        self.resultDetail(newResult);
                        $('#resultDetail li[code='+ self.itemCode() +']').addClass('layui-this');
                    }
                    if (cps.length == 0) {
                        if (!(typeof (Method) == 'undefined')) {
                            clearInterval(Method);
                        }
                    }
                    form.render();
                }else{
                    layer.msg(data.errMsg);
                }
            });
        }

        self.tabChanged = function (item,isLoad) { // 点击展示详情
            if(isLoad != true){
                self.itemCode(item.code)
            }
            var details = item.details;
            self.itemDetails({
                shortName: item.shortName,
                status: item.status,
                statusDisplay: item.statusDisplay,
                details: common.deepClone(details)
            });
            $('#resultContent .layui-tab-item').addClass('layui-show');
        }

        self.showInsureLayer = function(item){ // 展示核保填写发票信息 弹层
            layer.load(2);
            $.getJSON(applyUrls.subInvoiceFormUrl, function (data) {
                if(data.status == 200){
                    var insCodes = cps.toString();
                    var url = applyUrls.getInsureResultUrl + '?insureId=' + self.insureId() + '&insCorpCodes=' + insCodes;
                    QuotationViewModel.quotaResult(url);
                    QuotationViewModel.shouldShowInsurance(false);
                    QuotationViewModel.shouldShowResult(true);
                    QuotationViewModel.toQuotaBtn(false);
                    layer.closeAll();
                }
            });
        }

        self.showOfferList = function(){
            parent.tab.tabAdd({
                href: '../issue/Views/pay.html',
                title: "支付-" + self.ownerVehicle().plateNo()
            })
        }

        self.getInit = function(district){ // 获取车辆信息初始化
            layer.load(2);
            self.rendering();
            self.loadHistoryData();
            self.getInsCorps();
            form.render();
            if(form) form.render('select');
        };
    }

    QuotationViewModel.getInit();
    ko.applyBindings(QuotationViewModel);

    form.verify({
        carOwnerName: function(e) {
            if(e == '') return "请输入车主姓名";
        },
        plateNo: function (e) {
            if(QuotationViewModel.isNonPlateNo() == false){
                if (!new RegExp(/^[\u4e00-\u9fa5]{1}[A-Z_a-z]{1}[A-H_a-h_J-N_j-n_P-Z_p-z_0-9]{5,6}$/g).test(e)){
                    return "车牌号格式不正确"
                }
            }
        },
        vin: function(e){
            if(e.length != 17) return "请核对您的车架号是否输入正确";
        },
        engineNo: function(e){
            if(e == '') return "请输入发动机号";
        },
        idcard: function(e,v,r){
            var type = $(v).attr('type');
            if (!e) {
                return "请输入证件号";
            }else if(e.length == 10){
                if(!validator.isOrganizationCode(e)){
                    return "请正确填写证件号";
                }
            } else if (e.length > 10){
                if(type == 'vat'){
                    if(!validator.isOrganization(e)) {
                        return "请正确填写证件号";
                    }
                }else{
                    if(!validator.isOrganization(e) && !validator.IsIDCard(e)) {
                        return "请正确填写证件号";
                    }
                }
            }else{
                return "请正确填写证件号";
            }
        },
        carOwnerType: function(e){
            if(e == 'Other') return "请选择所属性质";
        },
        model: function(e){
            if(e == '') return "请输入车主的品牌型号";
        },
        fullPriceModel: function(e){
            if(e == '') return "请选择车主的车型价格";
        },
        passengerCapacity: function(e){
            if(e == '' || e == 0) return "请选择座位数";
        },
        registerDate:function(e){
            if(e == ''){
                return "请填写注册日期";
            }else if(!validator.IsDateTime(e)){
                return "请按照2016-09-03格式书写注册日期";
            }else if(validator.IsLessThanTomorrow(e)>=0){
                return "注册日期不可以大于当前日期";
            }
        },
        changedOwnerDate:function(e){
            if(QuotationViewModel.ownerVehicle().changedOwner()){
                if(e == ''){
                    return "请填写过户日期";
                }else if(!validator.IsDateTime(e)){
                    return "请按照2016-09-03格式书写过户日期";
                }else if(validator.IsLessThanTomorrow(e)>=0){
                    return "过户日期不可以大于当前日期";
                }
            }
        },
        aName: function(e) {
            if(QuotationViewModel.isHasInsureInfo() == false){
                if(e == '') return "请填写投保人姓名";
            }
        },
        aType: function(e) {
            if(QuotationViewModel.isHasInsureInfo()  == false){
                if(e == 'Other') return "请选择投保人证件所属性质";
            }
        },
        aPhone: function(e) {
            if(QuotationViewModel.isHasInsureInfo() == false){
                if (!e) {
                    return "请输入投保人手机号";
                }else if(!validator.IsMobilePhoneNumber(e)){
                    return "请正确填写投保人手机号";
                }
            }
        },
        bName: function(e) {
            if(QuotationViewModel.isHasInsuredData() == false){
                if(e == '') return "请填写被保人姓名";
            }
        },
        bType: function(e) {
            if(QuotationViewModel.isHasInsuredData() == false){
                if(e == 'Other') return "请选择被保人证件所属性质";
            }
        },
        bPhone: function(e) {
            if(QuotationViewModel.isHasInsuredData() == false){
                if (!e) {
                    return "请输入被保人手机号";
                }else if(!validator.IsMobilePhoneNumber(e)){
                    return "请正确填写被保人手机号";
                }
            }
        },
        sumInsured: function(e,v){
            var $input = $(v).closest('td').siblings('td').find(".insureInput");
            if($input.attr("checked") == "checked"){
                if(e == '' || e == '请选择') return "请选择保额";
            }
        },
        jqTime:function(e){
            if($("#jqtype").attr("checked") == "checked"){
                if(e == ''){
                    return "请填写交强险日期"
                }else if(!validator.IsDateTime(e)){
                    return "请按照2016-09-03格式书写注册日期";
                }else if(validator.IsLessThanTomorrow(e)<0){
                    return "交强险日期必须大于当天日期";
                }else if(validator.IsLessThanTomorrow(e)>90){
                    return "您最早可在车险到期前90天来投保。";
                }
            }
        },
        syTime:function(e){
            if($("#sytype").attr("checked") == "checked"){
                if(e == ''){
                    return "请填写商业险日期";
                }else if(!validator.IsDateTime(e)){
                    return "请按照2016-09-03格式书写注册日期";
                }else if(validator.IsLessThanTomorrow(e)<=0){
                    return "商业险日期必须大于当天日期";
                }else if(validator.IsLessThanTomorrow(e)>90){
                    return "您最早可在车险到期前90天来投保。";
                }
            }
        },
        sychecked:function(e){
            if($("#sytype").attr("checked") != "checked"){
                if ($("#CSX").find(".insureInput").attr("checked") == "checked" || $('#SZX').find(".insureInput").attr("checked") == "checked") {
                    return "请选择商业险";
                }
                
            }
        }
    });
});