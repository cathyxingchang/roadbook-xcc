/**
 * Created by yangchao on 22/07/2017.
 */
var API_URL='/';
var app = angular.module('myApp', []);
app.service('CommonService', function($http, $q) {
    return {
        get: function(url){
            var d = $q.defer();

            $http.get(url
            ).success(function(data){
                d.resolve(data);
            }).error(
                function(data){
                }
            ).then();
            return d.promise;
        },
        post: function(url,input_data,target_activity_service){
            var d = $q.defer();
            $http.post(
                url,
                input_data,
                {
                    headers : {
                        'X-Amz-Target' : 'com.amazon.roadbookservice.RoadBookService.'+ target_activity_service,
                        'Content-Type' : 'application/json; charset=UTF-8',
                        'Content-Encoding' : 'amz-1.0',
                    }
                }
            ).success(function(data){
                d.resolve(data);
            }).error(
                function(data){
                }
            ).then();
            return d.promise;
        }
    }
});
