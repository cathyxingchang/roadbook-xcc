/**
 * Created by yangchao on 22/07/2017.
 */

app.controller('RoadBookController', function($scope, CommonService) {
    var map;
    var locationMarkers=[];
    var latitude;
    var longitude;
    window.mapCallback = function(){
        AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker){
            map = new AMap.Map('container', {
                center: [117.000923, 36.675807],
                zoom: 6,
                resizeEnable: true
            });
            map.plugin(["AMap.ToolBar"], function() {
                map.addControl(new AMap.ToolBar());
            });
            /*添加一个固定不动的选址组件,固定在地图中心*/
            var positionPicker = new PositionPicker({
                mode:'dragMap',//设定为拖拽地图模式，可选'dragMap'、'dragMarker'，默认为'dragMap'
                map:map,        //依赖地图对象
                iconStyle:{//自定义外观
                    url:'//webapi.amap.com/ui/1.0/assets/position-picker2.png',//图片地址
                    size:[48,48],  //要显示的点大小，将缩放图片
                    ancher:[24,40]//锚点的位置，即被size缩放之后，图片的什么位置作为选中的位置
                }
            });
            positionPicker.start();
            map.panBy(0, 1);
            positionPicker.on('success', function(positionResult) {
                $scope.centerInfo.longitude = positionResult.position.getLng();
                $scope.centerInfo.latitude= positionResult.position.getLat();
                $scope.centerInfo.address=positionResult.address;
            });
            positionPicker.on('fail', function(positionResult) {
                //alert("1")
            });


        });


        /**
         * 为地图注册click事件获取鼠标点击出的经纬度坐标
        var clickEventListener = map.on('click', function(e) {
            alert(e.lnglat.getLng() + ',' + e.lnglat.getLat());
             在点击的地方调用高德api 绘制一个点
            showPointMarker(e.lnglat.getLng(),e.lnglat.getLat());

        });
        */



    };

    function showPointMarker(lng,lat) {
        //在显示新的标记点的时候，先删除旧的
        map.remove(locationMarkers);
        var marker = new AMap.Marker({
            icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
            position: [lng, lat]
            //map: map 也可以在这里设置放置在哪个地图上
        });
        marker.setMap(map);
        locationMarkers.push(marker);
    }


    <!--根据查询结果显示个人信息-->
    // 教程 http://blog.csdn.net/chenshu0/article/details/53004560
    // 使用列表表示信息

    // 显示和隐藏个人信息
    var infoState = false;// 初始状态下，显示个人信息的列表信息是关闭状态的
    // 给显示信息和所有的待审核列表按钮增加监听事件
    $("#info").on('click', function() {
        //alert('you click the info');
        if (infoState == false){
            $("#infoList.json").show();
            infoState = true;
        }
        else{
            $("#infoList.json").hide();
            infoState = false;
        }
    });

    // 显示和隐藏上面的过滤器列表
    var filterState = false;// 初始状态下，显示个人信息的列表信息是关闭状态的
    // 给显示信息和所有的待审核列表按钮增加监听事件
    $("#filter").on('click', function() {
        //alert('you click the filter');
        if (filterState == false){
            $("#selectList").slideDown(60);
            filterState = true;
        }
        else{
            $("#selectList").slideUp(150);
            filterState = false;
        }
    });


    // 显示和隐藏等待添加的标记点类别
    var markState = false;  // 初始状态下，是没有显示添加标记点的列表的
    $("#addMarker").on('click', function() {
        if (markState == false){
            $("#categoryList").show();
            markState = true;
        }
        else{
            $("#categoryList").hide();
            markState = false;
        }
    });




    // 存放新增标记点的地址
    $scope.centerInfo ={
        "Latitude":-1,
        "longitude":-1,
        "address":-1
    };


    // 存放被点击的标记点的地址信息
    $scope.choosedMark ={
        "Latitude":-1,
        "longitude":-1,
        "address":-1
    };


    $scope.data = {
        createdInfo: [],
    };
    $scope.panel = {
        modalStatus: false,
        parkingStatus: false,
        cabinetStatus: false,
        sideBarModalStatus: false,
        infoState: false,
        filterState: false,
        infoListStatus: false
    };
    // 根据选择类别的不同，每一类都设置一个监听事件
    // 为0.停车场 1.自提柜设定监听事件
    $scope.markIconClick = function(index) {
        if($scope.panel.modalStatus) {
            return;
        }
        $scope.panel.modalStatus = true;
        if(index ==0) {
            $scope.panel.parkingStatus = true;
        }
        if(index ==1) {
            $scope.panel.cabinetStatus = true;
        }
        // 在填信息的时候，下面的"添加标记点是不可以点的" 这里不好使？？
        //$("#addMarker").unbind("click");
    };

    $scope.cancelButtonClick = function() {
        $scope.panel.modalStatus = false;
        $scope.panel.parkingStatus = false;
        $scope.panel.cabinetStatus = false;
    };

    $scope.showInfoList = function() {
        $scope.panel.sideBarModalStatus = true;
        setTimeout(function(){$scope.panel.infoListStatus = true;
            $scope.$apply();}, 1);
    };
    $scope.hideInfoList = function() {
        $scope.panel.infoListStatus = false;
        setTimeout(function(){
            $scope.panel.sideBarModalStatus = false;
            $scope.$apply();}, 600);
    };


    $scope.switchInfoItemShowStatus = function(index) {
        if($scope.data.createdInfo[index].showStatus === null || $scope.data.createdInfo[index].showStatus === false) {
            $scope.data.createdInfo[index].showStatus = true;
        }else{
            $scope.data.createdInfo[index].showStatus = false;
        }
    };

    // 其中一个过滤器，只显示当前位置下的
    // 首先获取当前的位置信息
    var tmp ={
        "Latitude":1,
        "longitude":2,
        "category":3
    };
    // 发送给后台

    $scope.jumpToSingleMark = function (index) {
        // 设置缩放级别和中心点
        $scope.choosedMark.longitude=$scope.data.createdInfo[index].longitude;
        $scope.choosedMark.latitude=$scope.data.createdInfo[index].latitude;
        map.setZoomAndCenter(14, [$scope.choosedMark.longitude, $scope.choosedMark.latitude]);
        // 在新中心点添加 markers
        var marker = new AMap.Marker({
            map: map,
            position: [$scope.choosedMark.longitude, $scope.choosedMark.latitude]
        });
        $scope.hideInfoList()

    };


    function loadInfoList() {
        CommonService.get('data/infoList.json').then(function(data){
            if(data.status === 0) {
                $scope.data.createdInfo = data.searchResult;
            }
        });
    }

    function init() {
        loadInfoList();
    }

    init();
});