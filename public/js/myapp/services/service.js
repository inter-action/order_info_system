var serviceModule = angular.module('myApp.service', []);

serviceModule.factory('UserService', ['$http',
    function($http) {
        var API = {};
        //todo: refactory this method name
        API.list = function() {
            var url = '/users.json';
            return $http.get(url);
        };


        API.change_money = function(userid, money) {
            var url = '/users/#{0}'.format(userid);
            var data = {
                money: money
            };

            return $http.post(url, data);
        };

        API.getuser = function(userid) {
            var url = '/users/#{0}'.format(userid);
            return $http.get(url);
        };

        API.new_user = function(user) {
            var url = '/users';
            return $http.post(url, user);
        };

        return API;
    }
]);


serviceModule.factory('LogService', ['$http',
    function($http) {
        var LOG_API = {};

        /**
         * list log
         * @param  {Object} options  query criteria
         * @return {Promise}         [description]
         */
        LOG_API.list = function(options) {
            var url = '/logs.json';

            var config = {
                params: options
            };
            return $http.get(url, config);
        };

        return LOG_API;
    }
]);


serviceModule.factory('BoardService', ['$http',
    function($http) {
        var API = {};

        API.list = function() {
            var url = '/board/list.json';

            return $http.get(url);
        };

        API.new_post = function(data) {
            var url = '/board';
            return $http.post(url, data);
        };

        return API;
    }

]);


serviceModule.factory('MenuService', ['$http',
    function($http) {
        var api = {};

        /*
        menu:{name, price}
        */
        api.new_menu = function(menu) {
            var url = '/menus';
            return $http.post(url, menu);
        };


        api.menus = function(){
            var url = '/menus.json';
            return $http.get(url);
        };
        
        return api;
    }
]);


serviceModule.factory('OrderService', ['$http',
    function($http) {
        var api = {};

        api.new_order = function(order) {
            var url = '/orders';
            return $http.post(url, order);
        };

        return api;
    }
]);