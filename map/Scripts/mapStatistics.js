layui.use(['laydate','element'], function(){
  	var laydate = layui.laydate,
        element = layui.element;

  	laydate.render({
	    elem: '#dateRange'
	    ,range: true
  	});

  	var mapStatistics = {
        orgCode: ko.observable(''),
        startDate: ko.observable(''),
        endDate: ko.observable(''),
        premiumArr: ko.observableArray([])
    };

    var common = {
	 /**
        * 取数组中的最大值
        */
	    arrayMax: function (arr) {
	        var max = arr[0];
	        var len = arr.length;
	        for (var i = 1; i < len; i++) {
	            if (parseFloat(arr[i]) > max) {
	                max = arr[i];
	            }
	        }
	        return max;
	    },
	    /**
         * 判断是否是整数
         */
        isInteger: function (obj) {
            return obj % 1 === 0
        },
         /*
         * 格式化金额，保留2位小数
         */
        fmtDecimal: function (val) {
            if (val != null && val != undefined && !isNaN(val) && val.toString().indexOf('.') > 0) {
                return parseFloat(val).toFixed(2);
            }
            return val;
        }
	};
   
    var mapChart = echarts.init(document.getElementById('main'));  //地图容器
    //34个省、市、自治区的名字拼音映射数组
    var provinces = { "台湾": "taiwan", "河北": "hebei", "山西": "shanxi", "辽宁": "liaoning", "吉林": "jilin", "黑龙江": "heilongjiang", "江苏": "jiangsu", "浙江": "zhejiang", "安徽": "anhui", "福建": "fujian", "江西": "jiangxi", "山东": "shandong", "河南": "henan", "湖北": "hubei", "湖南": "hunan", "广东": "guangdong", "海南": "hainan", "四川": "sichuan", "贵州": "guizhou", "云南": "yunnan", "陕西": "shanxi1", "甘肃": "gansu", "青海": "qinghai", "新疆": "xinjiang", "广西": "guangxi", "内蒙古": "neimenggu", "宁夏": "ningxia", "西藏": "xizang", "北京": "beijing", "天津": "tianjin", "上海": "shanghai", "重庆": "chongqing", "香港": "xianggang", "澳门": "aomen"};
    //直辖市和特别行政区-只有二级地图，没有三级地图
    var special = ["北京","天津","上海","重庆","香港","澳门",'台湾'];
    var mapdata = [];
    var getMapData = getMap.result.data;   // 地图数据API返回

    mapStatistics.getBarStatistics = function (orgCode, startDate, endDate) { // 业务机构出单统计柱状图
        var result = getOrganUrl.result,
            premiumSeries = result.series[0].data,
            issueSeries = result.series[1].data,
            premiumMax = Math.ceil(common.arrayMax(premiumSeries)),
            issueMax = Math.ceil(common.arrayMax(issueSeries)),
            barDom = document.getElementById('barChart'),
            barChart = echarts.init(barDom), barOption = null;

        if (premiumMax % 5 == 0) premiumMax = premiumMax
        else premiumMax = Math.ceil(premiumMax / 5) * 5

        if (issueMax % 5 == 0) issueMax = issueMax
        else issueMax = Math.ceil(issueMax / 5) * 5

        premiumMax = premiumMax > 5 ? premiumMax : 25000;
        issueMax = issueMax > 5 ? issueMax : 5;

        barOption = {
            title: {
                text: result.title,
                x: 'left',
                y: 'top',
                textStyle: {
                    color: '#111',
                    fontSize: 18,
                    fontWeight: 500
                }
            },
            grid: [{
                top: 120,
                containLabel: true
            }],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line',
                    lineStyle: {          // 直线指示器样式设置
                        color: '#ee8312',
                        width: 1,
                        type: 'solid'
                    }
                },
                formatter: function (datas) {
                    var res = datas[0].name + '<br/>', unit = '';
                    for (var i = 0, length = datas.length; i < length; i++) {
                        if (datas[i].seriesName.indexOf("保费") != -1) {
                            unit = '元'
                        } else {
                            unit = '单'
                        }
                        res += datas[i].seriesName + '：'
                           + datas[i].value + unit + '<br/>'
                    }
                    return res
                }
            },
            legend: {
                padding: 50,
                itemGap: 20,
                show: true,
                data: [result.yAxis[1].name, result.yAxis[0].name]
            },
            calculable: true,
            xAxis: [
                {	
                    type: 'category',
                    data: result.xAxis.data,
                    splitLine: { show: false },
                    axisLine: {
                        lineStyle: {
                            color: '#ececec',
                            width: 1
                        }
                    },
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: '#666'
                        }
                    }
                },
            ],
            yAxis: [
                {
                	name: '出单量',
                    type: 'value',
                    max: issueMax,
                    splitNumber: 5,
                    splitLine: { show: false },
                    axisLabel: {
                        formatter: function (value) {
                            var param = '';
                            if (value >= 10000) param = common.isInteger(value / 10000) ? value / 10000 : parseFloat(value / 10000).toFixed(2) ;
                            else param = common.isInteger(value) ? value : parseFloat(value).toFixed(2);
                            return param
                        },
                        fontSize: '12',
                        textStyle: {
                            color: '#888'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#333',
                            width: 0
                        }
                    }
                }, {
                	name: '总保费(万)',
                    type: 'value',
                    max: premiumMax,
                    splitNumber: 5,
                    splitLine: { show: true },
                    axisLabel: {
                        formatter: function (value) {
                            var param = '', maxValue = value / 10000
                            if (value >= 10000) param = common.isInteger(maxValue) ? maxValue : parseFloat(maxValue).toFixed(2) ;
                            else param = common.isInteger(value) ? value : parseFloat(value).toFixed(2);
                            return param
                        },
                        fontSize: '12',
                        textStyle: {
                            color: '#888'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#333',
                            width: 0
                        }
                    }
                }
            ],
            series: [
                {
                    name: result.yAxis[1].name,
                    type: 'bar',
                    data: issueSeries,
                    barWidth: 10,
                    itemStyle: {
                        normal: {
                            color: '#379bfb',
                            barBorderRadius: [2, 2, 0, 0]
                        }, emphasis: {
                            barBorderRadius: [2, 2, 0, 0]
                        }
                    }
                },
                {
                    name: result.yAxis[0].name,
                    type: 'line',
                    data: premiumSeries,
                    barWidth: 10,
                    yAxisIndex: 1,
                    itemStyle: {
                        normal: {
                            color: '#f28b31'
                        }
                    }
                }
            ]
        };

        if (barOption && typeof barOption === "object") barChart.setOption(barOption, true);
    }

    mapStatistics.getPieStatistics = function (orgCode, startDate, endDate) { // 保险公司出单统计饼图
        var result = getInsCmpsUrl.result.datas, insCorpCode = [], premium = [], issue = [], colors = ['#3098ff', '#5f5bf4', '#89ccff', '#30c7c6'];
        for (var i = 0; i < result[0].data.length; i++) {
            var item = result[0].data[i], premiumJson = {};
            premiumJson.name = item.insCorpCode;
            premiumJson.value = item.premium;
            insCorpCode.push(item.insCorpCode);
            premium.push(premiumJson)
        }
        for (var i = 0; i < result[1].data.length; i++) {
            var item = result[1].data[i], issueJson = {};
            issueJson.name = item.insCorpCode;
            issueJson.value = item.policiesQuantity;
            issue.push(issueJson)
        }
        if (premium == '' && issue == '') {
            premium = [{ name: '暂无数据', value: 0 }]
            issue = [{ name: '暂无数据', value: 0 }]
            colors = ['#eee']
        }
        var pieDom = document.getElementById("pieChart");
        var pieChart = echarts.init(pieDom);
        var pieOption = null;
        pieOption = {
            title: [{
                text: '总保费',
                x: '48%',
                y: '32%',
                textAlign: 'center',
                textStyle: {
                    color: '#111',
                    fontSize: 12,
                    fontWeight: 400
                }
            }, {
                text: '出单量',
                x: '48%',
                y: '75%',
                textAlign: 'center',
                textStyle: {
                    color: '#111',
                    fontSize: 12,
                    fontWeight: 400
                }
            }],
            color: colors,
            grid: [{
                top: 100,
                containLabel: true
            },
            {
                top: 100,
                containLabel: true
            }],
            tooltip: {
                trigger: 'item',
                formatter: function (value, v, e, d) {
                    var param = ''
                    if (value.seriesName.indexOf("总保费") != -1) {
                        param = value.name + "： <br/>总保费 : "  + value.value + "元 (" + value.percent + "%)"
                    } else {
                        param = value.name + "： <br/>总出单 : "  + value.value + "单 (" + value.percent + "%)"
                    }

                    return param
                }
            },
            legend: {
                data: insCorpCode,
                itemWidth:5,
                itemHeight:5,
                borderRadius:100
            },
            calculable: true,
            series: [
                {
                    name: '总保费',
                    type: 'pie',
                    radius: [50, 30],
                    center: ['50%', '35%'],
                    data: premium
                },
                {
                    name: '出单量',
                    type: 'pie',
                    radius: [50, 30],
                    center: ['50%', '78%'],
                    data: issue
                }
            ]
        };
        ;
        if (pieOption && typeof pieOption === "object") pieChart.setOption(pieOption, true);
    }

    mapStatistics.getPremiumList = function (orgCode, startDate, endDate) { // 保费排行榜
        var result = getPremURl.result.data, premiumItem = [], premiumArr = [], sum = 0;
        for (var i = 0; i < result.length; i++) {
            var item = result[i], builderJson = {};
            premiumItem.push(item.premium)
        }
        sum = Math.ceil(common.arrayMax(premiumItem));
        for (var i = 0; i < result.length; i++) {
            var item = result[i], builderJson = {};
            builderJson.percent = ((item.premium/sum) * 100).toFixed(2) + '%'
            builderJson.premium = item.premium
            builderJson.orgName = item.orgName
            builderJson.html = '<div class="layui-progress" lay-showPercent="true"><div class="layui-progress-bar" style="width: '+ builderJson.percent +'" lay-percent="'+ builderJson.percent +'"></div></div>'
            premiumArr.push(builderJson)
        }
        
        mapStatistics.premiumArr(premiumArr)
        element.render();
    }

    mapStatistics.renderMap = function (map,data,geoCoordData,symbol){
        var itemStyle = '',symbolSize = 10;
        if(symbol == 'pin'){
            itemStyle = {
                normal: {
                    color: '#fff',
                    borderWidth: 3,
                    borderColor: '#fd9226', 
                }
            };
            symbolSize = 14;
        }else{
            itemStyle = {
                normal: {
                    color: '#fff',
                    borderWidth: 3,
                    borderColor: '#1cd8e6', 
                    barBorderRadius: 50
                }
            };
            symbolSize = 10;
        }
        var option = {
            tooltip: {  
                trigger: 'item',    
                formatter: function(params) {    
                    var res = params.name+'<br/>';    
                    var myseries = option.series;
                    return res;    
                }    
            }, 
            dataRange: {  
                min: 0,  
                max: 30,  
                x: 'right',  
                y: 'bottom',  
                color:['#4298f2','#deecf9'],  
                text:['高','低'],  
                calculable : true  
            }, 
            roamController: {  
                show: true,  
                x: 'right',  
                mapTypeControl: {  
                    map: true  
                }  
            },  
            geo: {  
                map: map,  
                label: {  
                    emphasis: {  
                        show: true  
                    }  
                },  
                itemStyle: {  
                    normal: {  
                        areaColor: '#deecf9',  
                        borderColor: '#deecf9',  
                        borderWidth: 0.8  
                    },  
                    emphasis: {  
                        borderColor: '#deecf9',  
                        areaColor: '#deecf9'  
                    }  
                }  
            }, 
            animationDuration:1000,
            animationEasing:'cubicOut',
            animationDurationUpdate:1000    
        };

        option.series = [    
            {  
                name: '区域',  
                type: 'map',  
                mapType: map,  
                itemStyle:{  
                    normal:{borderColor: '#fff',borderWidth: 1,label: {show: false} },  
                    emphasis:{label:{show:true}}  
                },
                data: data
            },    
            {  
                name: '网点',  
                type: 'scatter',//影响散点  
                symbol: symbol,
                coordinateSystem: 'geo',   
                symbolSize: symbolSize,
                showEffectOn: 'render',  
                rippleEffect: {  
                    brushType: 'stroke'  
                },  
                hoverAnimation: true,  
                label: {  
                    normal: {
                        color: '#f80',  
                        formatter: '{b}',  
                        position: 'right',
                        show: false  
                    },  
                    emphasis: {  
                        show: true  
                    }  
                },
                itemStyle: itemStyle,
                data:geoCoordData
            }  
        ]
        //渲染地图
        mapChart.setOption(option);
    }

    mapStatistics.showChinaMap = function(){ //绘制全国地图
        $.getJSON('static/map/china.json', function(data){
            var d = [];
            var orgArr = [];
            for( var i=0;i<data.features.length;i++ ){
                var provinceJson = {},orgJson = {};
                provinceJson = {
                    name:data.features[i].properties.name,
                    value: Math.round(Math.random())
                }
                for (var j = 0; j < getMapData.length; j++) {
                    var getMapItem = getMapData[j],
                        provinceName = getMapItem.location.provinceName;
                    if( provinceName == provinceJson.name ){
                        provinceJson.name = data.features[i].properties.name;
                        provinceJson.value = 30;
                        orgJson.name = provinceJson.name
                        orgJson.value = [getMapItem.coordinate.longitude,getMapItem.coordinate.latitude,'provinces']
                        orgArr.push(orgJson)
                    }
                }
                
                d.push(provinceJson);
            }
            mapdata = d;
            mapdata.push({name: '南海诸岛',value:1})
            //注册地图
            echarts.registerMap('china', data);
            //绘制地图
            mapStatistics.renderMap('china',d, orgArr, "pin");
        });
    }

    mapStatistics.getVehicleStatistics = function () { // 车辆进场数据监控统计饼图
        $('.circleChart').each(function(index, el) {
            var $this = $(this), value = $this.attr('data-value');
            $this.circleChart({
                size: 60,
                value: value,
                color: "#30C7C6",
                backgroundColor: "#F1F4F7",
                text: 0,
                onDraw: function(el, circle) {
                    circle.text(Math.round(circle.value));
                }
            });
        });
    }

    mapChart.on('click', function (params) {  //地图点击事件
        if( params.name in provinces ){
            //如果点击的是34个省、市、自治区，绘制选中地区的二级地图
            $.getJSON('static/map/province/'+ provinces[params.name] +'.json', function(data){
                echarts.registerMap( params.name, data);
                var d = [],orgCityArr = [];
                for( var i=0;i<data.features.length;i++ ){
                    var cityJson = {};
                    cityJson = {
                        name:data.features[i].properties.name,
                        value: Math.round(Math.random())
                    }
                    for (var j = 0; j < getMapData.length; j++) {
                        var getMapItem = getMapData[j];
                        
                        for (var k = 0; k < getMapItem.city.length; k++) {
                            var cityItem = getMapItem.city[k],orgCityJson = {},
                                cityName = cityItem.location.cityName;

                            if( cityJson.name.indexOf(cityName) >= 0){
                                cityJson.name = cityName;
                                cityJson.value = 30;
                                orgCityJson.name = cityJson.name
                                orgCityJson.value = [cityItem.coordinate.longitude,cityItem.coordinate.latitude,'city']
                                orgCityArr.push(orgCityJson)
                            }
                        }
                    }
                    d.push(cityJson)
                }
                mapStatistics.renderMap(params.name,d,orgCityArr,'pin');
            });
        }else{
            //如果是【直辖市/特别行政区】只有二级下钻
            if(  special.indexOf( params.name ) >=0  ){
                mapStatistics.showChinaMap();
            }else if(cityMap[params.name] != undefined){
                //显示县级地图
                $.getJSON('static/map/city/'+ cityMap[params.name] +'.json', function(data){
                    echarts.registerMap( params.name, data);
                    var d = [], orgDistrictArr = [];
                    for( var i=0;i<data.features.length;i++ ){
                        var districtJson = {}
                        districtJson = {
                            name:data.features[i].properties.name,
                            value: Math.round(Math.random())
                        }
                        for (var j = 0; j < getMapData.length; j++) {
                            var getMapItem = getMapData[j];
                            
                            for (var k = 0; k < getMapItem.city.length; k++) {
                                var cityItem = getMapItem.city[k];

                                for (var g = 0; g < cityItem.district.length; g++) {
                                    var districtItem = cityItem.district[g],orgDistrictJson = {},districtName = districtItem.location.districtName;
                                    if( districtJson.name.indexOf(districtName) >= 0){
                                        districtJson.name = districtName;
                                        districtJson.value = 30;
                                        orgDistrictJson.name = districtJson.name
                                        orgDistrictJson.value = [cityItem.coordinate.longitude,cityItem.coordinate.latitude,'district']
                                        orgDistrictArr.push(orgDistrictJson)
                                    }
                                }
                            }
                        }
                        d.push(districtJson)
                    }
                    mapStatistics.renderMap(params.name,d,orgDistrictArr,'');
                }); 
            }else{
                mapStatistics.showChinaMap();
            }
        }
    });

    window.addEventListener("resize", function () {
        var res;
        if (res){clearTimeout(res)}
        res = setTimeout(function(){
            var mapChart = echarts.getInstanceByDom(document.getElementById('main'));
            var barChart = echarts.getInstanceByDom(document.getElementById('barChart'));
            var pieChart = echarts.getInstanceByDom(document.getElementById('pieChart'));
            mapChart.resize();
            barChart.resize();
            pieChart.resize();
        },1500);
    });

    mapStatistics.load = function (orgCode, startDate, endDate) {
        mapStatistics.getBarStatistics(orgCode, startDate, endDate);
        mapStatistics.getPieStatistics(orgCode, startDate, endDate);
        mapStatistics.getPremiumList(orgCode, startDate, endDate);
        mapStatistics.getVehicleStatistics();
        mapStatistics.showChinaMap();
    }

    mapStatistics.load();

    ko.applyBindings(mapStatistics);
})