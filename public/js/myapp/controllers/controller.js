var controllerModule = angular.module('myApp.controller', []);

controllerModule.controller(
    'IndexController', ['UserService', 'LogService', '$scope',
        function(UserService, LogService, $scope) {
            $scope.focused_row = 0;

            var load_page = function() {
                UserService.list().then(function(data) {
                    $scope.userlist = data.data;

                    userid = $scope.userlist[0]._id;
                    $scope.focused_row = 0;
                    var data = {
                        relUID: userid,
                        type: CONSTANTS.LOGS_TYPE_MONEY
                    };
                    return LogService.list(data);

                }).then(function(data) {

                    $scope.logs = data.data.results;
                });
            };

            $scope.change_log = function(idx) {
                var user = $scope.userlist[idx];
                $scope.focused_row = idx;

                var data = {
                    relUID: user._id 
                };

                LogService.list(data).success(function(page) {
                    $scope.logs = page.results;
                });

            };

            load_page();
        }
    ]
);


controllerModule.controller('BoardController', ['BoardService', '$scope',
    function(BoardService, $scope) {


        var load_posts = function() {
            BoardService.list().then(function(result) {
                $scope.posts = result.data.results;
            });
        };

        $scope.post = {};

        var new_post = function() {
            console.log('todo');
        };

        $scope.submit = function() {
            var post = angular.copy($scope.post);

            //for now we dont handle exception senario
            BoardService.new_post(post).then(function(postInstance) {
                console.log('create new post instance', postInstance);
                //re pull new data here, better way to do is add server event notice
                $scope.post = {};
                load_posts();
            });
        };

        $scope.is_unchanged = function() {
            return angular.equals($scope.post, {});
        };

        //start initialization
        load_posts();
    }
]);


controllerModule.controller('AdminUserController', ['UserService', '$scope',
    function(UserService, $scope) {
        var list_users = function() {
            UserService.list().then(function(result) {
                $scope.users = result.data;
            });
        };

        $scope.toggled_index = 0;
        $scope.money = 0;


        $scope.change_user = function(idx) {
            $scope.iscreation = false;
            $scope.toggled_index = idx;
        };

        $scope.switch_user_pannel = function(iscreation) {
            $scope.iscreation = iscreation;
        };

        $scope.new_user = function() {
            var username = $scope.username;
            UserService.new_user({
                username: username
            }).then(function(result) {
                $scope.users.push(result.data);
                $scope.change_user($scope.users.length - 1);
            });
        };


        $scope.change_money = function() {
            var user = $scope.users[$scope.toggled_index];

            if (user != null && $scope.money !== 0) {
                UserService.change_money(user._id, $scope.money).then(function(result) {
                    //use extends rather than assginment
                    $scope.users[$scope.toggled_index] = result.data;
                });
            }
        };


        //start initialization
        $scope.iscreation = false;
        list_users();
    }
]);

//AdminMenuController

controllerModule.controller('AdminMenuController', ['MenuService', 'OrderService', 'UserService', '$scope',
    function(MenuService, OrderService, UserService, $scope) {

        //fetch a list of menus
        MenuService.menus().then(function(result) {
            $scope.menus = result.data;
        });

        //fetch user list
        UserService.list().then(function(result) {
            $scope.users = result.data;
        });

        // $scope.orders = [
        //     {
        //         menu: {
        //             name: '鱼香茄子',
        //             price: 3
        //         },
        //         username: 'alex',
        //         uid: '545b0e20382e651c2167ceb1'
        //     },{
        //         menu: {
        //             name: '鱼香茄子',
        //             price: 3
        //         },
        //         username: 'alex',
        //         uid: '545b0e20382e651c2167ceb1'
        //     },{
        //         menu: {
        //             name: '红烧牛排',
        //             price: 3
        //         },
        //         username: 'braden',
        //         uid: '545b0e7d382e651c2167ceb3'
        //     }
        // ];

        $scope.orders = [];

        $scope.switch_pannel = function(index) {
            $scope.p_idx = index;
        };

        $scope.new_menu = function() {
            var menu = {
                name: $scope.m_name,
                price: $scope.m_price
            };

            MenuService.new_menu(menu).then(function(result) {
                $scope.menus.unshift(result.data);
                $scope.switch_pannel(0);
            });
        };

        //---- start: 创建新的订单
        var order = {};
        $scope.add_menu_0 = function(menu_id) {
            var menu = _.find($scope.menus, function(_m) {
                return _m._id === menu_id;
            });

            assert(menu);
            order.menu = menu;

            $scope.switch_pannel(1);
        };

        $scope.add_menu_1 = function(user_idx) {
            assert(order.menu);

            var user = $scope.users[user_idx];
            assert(user);

            order.username = user.username;
            order.uid = user._id;

            $scope.orders.push(order);
            order = {};

            $scope.switch_pannel(0);

        };

        $scope.cancel_menu_creation = function() {
            order = {};
            $scope.switch_pannel(0);
        };
        //---- end: 创建新的订单

        $scope.remove_order = function(idx) {
            $scope.orders.splice(idx, 1);
        };


        $scope.generate_order = function() {
            var m = _.groupBy($scope.orders, 'uid');

            var orders = [];
            _.each(m, function(value, key) {
                var order = {};
                order.username = value[0].username;
                order.uid = value[0].uid;
                order.menus = [];

                _.each(value, function(_m) {
                    order.menus.push(_m.menu);
                });

                orders.push(order);
            });

            var order = {
                orders: orders
            };

            OrderService.new_order(order).then(function(result) {
                console.debug(JSON.stringify(result.data));
                $scope.orders = [];
            });
        };

        //initialization
        $scope.p_idx = 0;
    }
]);