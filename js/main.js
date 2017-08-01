/**
 * Created by yangchao on 22/07/2017.
 */
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
                    alert(data.msg)
                }
            ).then();
            return d.promise;
        }
    }
});