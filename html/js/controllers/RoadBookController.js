/**
 * Created by yangchao on 22/07/2017.
 */

app.controller('RoadBookController', function($scope, CommonService) {
    var map;
    var locationMarkers=[];
    var latitude;
    var longitude;
    var markers = [];
    var infoWindow;
    window.mapCallback = function(){
        AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker){
            map = new AMap.Map('container', {
                center: [116.488807,39.914634],
                zoom: 15,
                resizeEnable: true
            });
            map.plugin(["AMap.ToolBar"], function() {
                map.addControl(new AMap.ToolBar());
            });
            /* 添加一个固定不动的选址组件,固定在地图中心 */
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

            /**
             * 为地图添加信息窗体,(到这个点去，从这个点出发)
             */
            var contentMsg = '<div class="info-title">信息</div><div class="info-content">' +
                '<img src="/html/img/smile.png">' +
                '这里可以显示当前点的信息<br/>' +
                '</div>';
            infoWindow = new AMap.AdvancedInfoWindow({
                content: contentMsg,
                placeSearch: false,
                asDestination: true,
                offset: new AMap.Pixel(0, -30)
            });

            /* 为地图拖动增加监听事件，在拖动的时候获取地图的中心点和缩放级别 */
            // addListener( instance, eventName, handler, context)
            AMap.event.addListener(map,'zoomend',function(){
                console.log('缩放了：' + map.getZoom());
                // 调用后台的server加载数据
                var coordinate = (map.getCenter().toString()).split(",");
                //lng:Number,lat:Number
                var lng = coordinate[0]*1;
                var lat = coordinate[1]*1;
                var latRange = 100;
                var lngRange = 100;
                // 加载数据后 绘制
                loadMarkByLocation(lat,lng,latRange,lngRange,map.getZoom());
            });
            AMap.event.addListener(map,'moveend',function () {
                console.log('当前的缩放级别：' + map.getZoom());
                console.log('当前的中心点坐标：' + map.getCenter().toString());

                // 调用后台的server加载数据
                var coordinate = (map.getCenter().toString()).split(",");
                //lng:Number,lat:Number
                var lng = coordinate[0]*1;
                var lat = coordinate[1]*1;
                var latRange = 100;
                var lngRange = 100;
                // 加载数据后 绘制
                loadMarkByLocation(lat,lng,latRange,lngRange,map.getZoom());
                console.log("为什么不执行？？")
            });
            //为地图注册click事件获取鼠标点击出的经纬度坐标
            var clickEventListener = map.on('click', function(e) {
                console.log('lng'+e.lnglat.getLng()+"  ;"+'lat'+e.lnglat.getLat())
            });
        });
    };

    function drawMarkSet(zoomSize) {
        /**
         * 把通过后端得到的数据全部绘制在地图上
         */
        map.remove(markers);
        markers = [];
        console.log("remove");
        var flag = 1;
        var markSet = $scope.allMarkSet.markList.marks;
        for (var i = 0; i < markSet.length; i += 1) {
            var marker;
            console.log(markSet[i].level);
            if (markSet[i].category == 'ENTRY' && markSet[i].level<=zoomSize ) {
                var icon = new AMap.Icon({
                    image: 'https://vdata.amap.com/icons/b18/1/2.png',
                    size: new AMap.Size(24, 24)
                });
                marker = new AMap.Marker({
                    icon: icon,
                    position: [markSet[i].longitude,markSet[i].latitude],
                    offset: new AMap.Pixel(-12,-12),
                    zIndex: 101,
                    //title: markSet[i].name,
                    map: map,
                    extData:markSet[i].markId
                });
                //map.setCenter(marker.getPosition());
            }
            else if (markSet[i].category == 'PARKING' && markSet[i].level<=zoomSize ){
                marker = new AMap.Marker({
                    position: [markSet[i].longitude,markSet[i].latitude],
                    offset: new AMap.Pixel(-12,-12),
                    zIndex: 101,
                    //title: markSet[i].name,
                    map: map,
                    extData:markSet[i].markId
                });
            }
            else if (markSet[i].category == 'COMMUNITY' && markSet[i].level<=zoomSize ){
                var div = document.createElement('div');
                div.className = 'circle';
                div.style.backgroundColor = '#09f';
                div.innerHTML = markSet[i].additionalInfo.comment;
                marker = new AMap.Marker({
                    content: div,
                    title:'community',
                    position: [markSet[i].longitude, markSet[i].latitude],
                    offset: new AMap.Pixel(-24, 5),
                    zIndex: 101,
                    map: map,
                    extData:markSet[i].markId
                });
            }
            else {
                flag = 0;
            }
            if (flag == 1){
                markers.push(marker);
                // 为每个点添加点击事件
                marker.content = '我的类型是' + markSet[i].category;
                marker.on('click', markerClick);
            }
        }
    }

    /**
     * mark的点击事件
     * 在点击mark点后，显示信息窗体infoWindow
     */
    function markerClick(e) {
        //infoWindow.setContent(e.target.content);
        // 打开信息窗体
        infoWindow.open(map, e.target.getPosition());
        // 记录点击mark点的事件
        console.log("点击啦");
        console.log(e.target.getExtData());
        addClickRecord(e.target.getExtData())
    }

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
        "latitude":-1,
        "longitude":-1,
        "address":-1
    };


    // 存放被点击的标记点的地址信息
    $scope.choosedMark ={
        "latitude":-1,
        "longitude":-1,
        "address":-1
    };


    /**
     * 存放当前所有的mark点信息
     * 所有绘制在图上的点都在allMarkSet里
     * $scope.allMarkSet
     * 存放根据"经纬度信息"反馈回来的mark点
     */
    $scope.allMarkSet = {
        markList:{},
    };


    /**
     * $scope.data
     *  存放当前用户id所创建的所有的点（用于列表的跳转使用）
     * @type {{createdInfo: Array, marks: Array}}
     */
    $scope.data = {
        createdInfo: [],
        createdMarks:[{
                "additionalInfo": {
                    "comment": "1212",
                    "timeInterval": "北京市朝阳区八里庄街道延静里西街华商大厦"
                },
                "category": "ENTRY",
                "latitude": 39.915852,
                "level": 0,
                "longitude": 116.481898,
                "markId": "913f6642-428b-4425-b1ee-f7e599ea3be7"
            },]
    };

    /**
     *  $scope.newMark
     *  存放新mark点的comment信息
     * @type {{comment: string}}
     */
    $scope.newMarkData ={
        comment:"这里存放信息"
    }
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
        if(index == 0) {
            $scope.panel.parkingStatus = true;
        }
        if(index == 1) {
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
        setTimeout(function() {
            $scope.panel.sideBarModalStatus = false;
            $scope.$apply();}, 600);
    };


    $scope.switchInfoItemShowStatus = function(index) {
        if ($scope.data.createdMarks[index].showStatus === null || $scope.data.createdMarks[index].showStatus === false) {
            $scope.data.createdMarks[index].showStatus = true;
        } else {
            $scope.data.createdMarks[index].showStatus = false;
        }
    };

    // 其中一个过滤器，只显示当前位置下的
    // 首先获取当前的位置信息
    var tmp ={
        "latitude":1,
        "longitude":2,
        "category":3
    };
    // 发送给后台

    $scope.jumpToSingleMark = function (index) {
        /**
         * 点击左面信息栏里的一个点，跳转到对应的点
         * @type {*}
         */
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

    $scope.createSingleMark =function(category){
        /**
         * 创建一个新的标记点，并把这个点的信息也如数据库里
         * @type {{category: *, markInfo: {latitude: (*), longitude: (*), category: *, additionalInfo: {comment: string, timeInterval: (*)}, level: number}, contributorId: string, cookies: string}}
         */
        var param = {
            "markInfo": {
                "latitude": $scope.centerInfo.latitude,
                "longitude": $scope.centerInfo.longitude,
                "category": category,
                "additionalInfo": {
                    "comment": $scope.newMarkData.comment,
                    "timeInterval": $scope.centerInfo.address
                },
                "level": 1
            },
            "contributorId": "foo",
            "cookies": "foo"
        };

        var target_activity_service = "CreateSingleMark";
        CommonService.post(API_URL, param, target_activity_service).then(function(data){
            if(data.state === 1) {
                console.log(data.markId);
            }
        });

    };


    function loadInfoList() {
        CommonService.get('data/infoList.json').then(function(data){
            if(data.status === 0) {
                $scope.data.createdInfo = data.searchResult;
            }
        });
    }


    function loadUncheckedList() {
        /**
         * 后台加载当前这个人的所添加的所有的标记点的信息
         * 添加了但是未被审核的
         */
        var input_data = {
            "userId": "xingchang0801"
        };
        var target_activity_service = "SearchMarkByUserId";
        CommonService.post(API_URL,input_data,target_activity_service).then(function(data){
            if(data.state === 1) {
                $scope.data.createdMarks = data.markList.marks;
                console.log($scope.data.createdMarks);
            }
        });
    }
    function loadMarkByLocation(latitude,longitude,latitudeRange,longitudeRange,zoomSize) {
        /**
         * 从后台的server里拿数据 调用使用位置信息作为server
         * 把加载出来的点绘制在地图上
         */
        var input_data = {
            "latitude": latitude,
            "longitude": longitude,
            "latitudeRange": latitudeRange,
            "longitudeRange": longitudeRange
        };
        var target_activity_service = "SearchMarkByLocation";
        CommonService.post(API_URL,input_data,target_activity_service).then(function(data){
            if(data.state === 1) {
                $scope.allMarkSet.markList = data.markList;
                console.log($scope.allMarkSet.markList);
                drawMarkSet(zoomSize);
            }
        });
    }

    function addClickRecord(markId) {
        /**
         * 把点击mark点的信息记录在数据库里
         */
        var input_data = {
            "markId": markId,
            "userId": 'xingchang0809'
        };
        var target_activity_service = "AddClickRecord";
        CommonService.post(API_URL,input_data,target_activity_service).then(function(data){
            if(data.state === 1) {
                console.log(data.state);
                console.log("点击了mark点，记录");
                var result = data.description;
                console.log(result);
            }
            else{
                console.log(data.state);
                var result = data.description;
                console.log(result);
                console.log("点击事件记录失败")
            }
        });
    }

    function init() {
        loadInfoList();
        loadUncheckedList();
    }
    init();
});