/**
 * @author miaojing
 *
 * @dependencies
 *      jquery
 *      underscore.js
 *      q.js
 */

/* jshint undef: true, unused: true, jquery:true, devel:true, browser:true  */

/*global _:true, Q:true, window:true, assert:true
 
 */
/*exported UTIL
 
 */
/**
 * [JQUERY MANIPULATE XML] http://code.tutsplus.com/tutorials/quick-tip-use-jquery-to-retrieve-data-from-an-xml-file--net-390
 */


//------------- :start Jquery Tiny pub/sub ------------
//https://gist.github.com/cowboy/661855

/* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
 * http://benalman.com/
 * https://gist.github.com/cowboy/661855
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */
/*
Examples:
    // Super-basic example:

    function handle(e, a, b, c) {
      // `e` is the event object, you probably don't care about it.
      console.log(a + b + c);
    };

    $.subscribe("/some/topic", handle);

    $.publish("/some/topic", [ "a", "b", "c" ]);
    // logs: abc

    $.unsubscribe("/some/topic", handle); // Unsubscribe just this handler

    // Or:

    $.subscribe("/some/topic", function(e, a, b, c) {
      console.log(a + b + c);
    });

    $.publish("/some/topic", [ "a", "b", "c" ]);
    // logs: abc

    $.unsubscribe("/some/topic"); // Unsubscribe all handlers for this topic
 */
(function($) {

    var o = $({});

    $.subscribe = function() {
        o.on.apply(o, arguments);
    };

    $.unsubscribe = function() {
        o.off.apply(o, arguments);
    };

    $.publish = function() {
        o.trigger.apply(o, arguments);
    };

}(jQuery));
//------------- :end Jquery Tiny pub/sub ------------


// -------------------- START: FormValidator --------------------------
// dependencies, underscore.js, jquery.js, util.js
// 
// this validator will publish a `'/form_validator/failure/<form_name>/<field_name>` failure msg
// with params [fieldname, strategy_name]
// 
// this validator donesnt support real-time validation yet
// 
// @param <form> :required
// @param [override_strategy] :optional
// 
// noempty:243,2,43:|regex|num|length|checked#blur

var FormValidator = (function(){
    
    // dependencies, underscore.js, jquery.js, util.js
    // 
    // this validator will publish a `'/form_validator/failure/<form_name>/<field_name>` failure msg
    // with params [fieldname, strategy_name]
    // 
    // this validator donesnt support real-time validation yet
    // 
    // @param <form> :required
    // @param [override_strategy] :optional
    // 
    // noempty:243,2,43:|regex|num|length|checked|
    function FormValidator(form, override_strategy) {
        this.$form = $(form);
        this.form_name = this.$form.attr('name');
        this.failure_msg_domain = '/form_validator/failure/' + this.form_name;
        this.success_msg_domain = '/form_validator/success/' + this.form_name;

        // should return true or false to indicate validation result
        var strategies = {
            'noempty': function() {
                var value = this.value.trim();

                if (!value) {
                    return false;
                }

                return true;
            },
            //regex:\\d{2}
            'regex': function() {
                var value = this.value;
                var regex_str = this.getAttribute('data-regex');

                assert(regex_str);

                var reg = new RegExp(regex_str, 'g');

                if (!reg.test(value)) {
                    return false;
                }
                return true;
            },
            //todo: 这个还没有测试过
            // number range validator, range include
            'number': function(min, max) {
                var value = this.value;
                var num_reg = /^\d+$/g;

                if (!num_reg.test(value)) {
                    return false;
                }

                min = min || Number.MIN_VALUE;
                max = max || Number.MAX_VALUE;

                value = parseInt(value, 10);

                return (value >= min && value <= max);
            },
            // length range validator, included
            'length': function(min, max) {
                var length = this.value.length;
                return (length >= min && length <= max);
            },
            //checkstatus:0|1
            'checkstatus': function(status) {
                if (status == null) {//check null and undifined
                    status = true;
                }

                if (status === '0') {
                    status = false;
                } else {
                    status = true;
                }

                return $(this).prop('checked') === status;

            }
        };

        this.strategies = $.extend({}, strategies, override_strategy);

        this.bind_events();
    }
    FormValidator.prototype.bind_events = function(){
        var fields = this.$form.find(':input[name]');
        var ctx = this;

        function _f(){
            ctx.validate(this);
        }

        for (var _i = 0; _i < fields.length; _i++) {
            var field = fields[_i];
            var name = field.name;
            var strategies = field.getAttribute('data-strategies');

            if (!strategies) {
                console.log('input name=#{0} has no strategies specified'.format(name));
                continue;
            }

            var _t  = this.parse_strategies(strategies);
            var es = _t[1];

            for (var _k = 0; _k < es.length; _k++){
                var e = es[_k];
                $(field).on(e, _f);
            }
        }

    };

    FormValidator.prototype.do_validate = function() {
        var fields = this.$form.find(':input[name]');
        var result = true;

        for (var i = 0; i < fields.length; i++) {
            result = this.validate(fields[i]);

            if (!result) {
                break;
            }
        }

        return result;
    };


    FormValidator.prototype.validate = function(input_ele) {
        var strategies = input_ele.getAttribute('data-strategies');
        var error_seq = input_ele.getAttribute('data-error_seq');//保证事件绑定的时候的顺序验证
        error_seq = error_seq ? parseInt(error_seq, 10) : error_seq;

        var name = input_ele.name;

        if (!strategies) {
            console.log('input name=#{0} has no strategies specified'.format(name));
            return true;
        }

        var ts = this.parse_strategies(strategies);
        var tokens = ts[0];

        var value = this.value;

        var result = true;

        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];

            if (!error_seq || error_seq<=i){//顺序控制，当前面的strategries 验证失败的时候，只对失败的重新校验
                result = this.apply_strategy(token, value, input_ele);
            }

            if (!result) {
                input_ele.setAttribute('data-error_seq', i);
                break;
            }else {
                if (i === error_seq){//验证通过,移除失败的flag
                    input_ele.removeAttribute('data-error_seq', i);
                }
            }
        }

        return result;
    };

    FormValidator.prototype.apply_strategy = function(token, value, input_ele) {
        assert(token);
        assert(input_ele);

        var name = input_ele.name;
        assert(name);


        var _t = this.parse_token(token);
        var strategy_name = _t[0];
        var strategy_params = _t[1];

        var result = this.strategies[strategy_name].apply(input_ele, strategy_params);
        if (!result) { //validation failed
            $.publish(this.failure_msg_domain, [name, strategy_name]);
            this.$form.data('validation_failure_field', name);
        }else{
            $.publish(this.success_msg_domain, [name, strategy_name]);
        }

        return result;
    };


    // parse token_str to [strategy_name, <strategy_params>]
    //@param token_str 
    //          pattern:
    //              a:1,2,3
    FormValidator.prototype.parse_token = function(token_str) {
        var _t = token_str.split(':');
        var _p = [];
        if (_t.length >= 2) {
            _p = _.map(_t[1].split(','), function(str) {
                return str.trim();
            });
        }
        return [_t[0], _p];
    };
    // strategries_pattern:
    //      <stragtegy_token>|[stragtegy_token..]#[event,..]
    FormValidator.prototype.parse_strategies = function(strategies_str){
        var ts = strategies_str.split('#');
        assert(ts.length <= 2);

        var _es = [];
        if (ts.length === 2){
            _es = _.map(ts[1].split(','), function(event_str){
                return event_str.trim();
            });    
        }

        return [ts[0].split('|'), _es];
    };

    return FormValidator;
})();
// -------------------- END: FormValidator ----------------------------

var UTIL = (function() {

    // ----------- START: method mixin ---------
    /**
     * @example
     *      '#{0} #{1}'.format('h', 'b') -> 'h b'
     *      '#{name}'.format({name: 'link'}) -> 'link'
     */
    String.prototype.format = function() {
        var result = this;
        if (arguments.length === 1 && _.isObject(arguments[0])) {

            _.each(arguments[0], function(value, key) {
                var ex = new RegExp('#\\{' + key + '\\}', 'g');
                result = result.replace(ex, value.toString());
            });
        } else {
            for (var i = 0; i < arguments.length; i++) {
                var ex = new RegExp('#\\{' + i + '\\}', 'g');
                result = result.replace(ex, arguments[i].toString());
            }
        }
        return result;
    };

    /**
     * padding string
     * @param  {Int} width  string length threshold
     * @param  {String} p_char char you want to fill the gap
     * @return {String}        [description]
     */
    String.prototype.padLeft = function(width, p_char) {
        p_char = p_char || ' ';
        if (this.length <= width) {
            //handle logic here
            var gap_count = width - this.length;
            var t = '';
            for (var i = 0; i < gap_count; i++) {
                t += p_char;
            }
            return t + this;
        } else {
            return this;
        }
    };

    /**
     * substitude string
     * 
     * @param  {RegExp} reg              [description]
     * @param  {Int} group_number
     * @param  {Function} replace_callback 匹配的子group值会以参数传入
     * @return {String}                  替换过的string, 找不到的话不会匹配
     *
     * @example
            '[大小单双] 5,1 [1注 共2元]'.sub(/\[.+?\]\s+([^\s]+)\s+\[.+?\]/, 1, function(text){
                return '<' + text + '>';
            });

            return 
            "[大小单双] <5,1> [1注 共2元]"
     */
    String.prototype.sub = function(reg, group_number, replace_callback) {
        var matches = reg.exec(this);
        var result = this.toString();
        if (matches && matches[group_number]) {
            result = this.replace(matches[group_number], replace_callback(matches[group_number]));
        }
        return result;
    };

    String.prototype.startsWith = function(seg) {
        return this.indexOf(seg) === 0;
    };

    // 将字符串解析成数字, 无法解析则返回0
    String.safe_int_parse = function(str, default_int) {
        if (!default_int) {
            default_int = 0;
        }
        var value = str.replace(/[^\d]/g, '');
        value = value === '' ? 0 : value;
        value = parseInt(value, 10);
        return value;
    };

    String.default_if_blank = function(str, value) {
        assert(value !== 'string' || value instanceof String);
        str = $.trim(str) || value;
        return str;
    };


    Array.prototype.copy = function() {
        return this.slice(0);
    };
    /**
     * return a new array contains both element in both array
     */
    Array.prototype.merge = function(another_array) {
        return Array.prototype.concat.apply(this, another_array);
    };

    /*
    求阶乘
     */
    Math.factorial = function(aint) {
        assert(typeof aint === 'number' || aint instanceof Number);
        if (aint === 0) {
            return 0;
        }
        var result = 1;
        for (; aint > 1; aint--) {
            result *= aint;
        }
        return result;
    };

    /*
    求组合的数目
     */
    Math.combination_count = function(base_count, target_count) {
        assert(typeof base_count === 'number' || base_count instanceof Number);
        assert(typeof target_count === 'number' || target_count instanceof Number);

        return Math.factorial(base_count) / (Math.factorial(base_count - target_count) * Math.factorial(target_count));
    };
    // ----------- END: method mixin ---------


    // -------------------- START: GLOBAL FUNCTIONS ----------
    window.assert = function(expression, msg) {
        if (!msg) {
            msg = 'assertion error';
        }
        if (!expression) {
            throw new Error(msg);
        }
    };

    /**
    ns('app').legacy = .. //define new module
    ns('app.legacy') // get a module if defined or create specified namespace
     */
    window.ns = function(ns_str) {
        var tokens = ns_str.split('.');
        assert(tokens.length > 0);

        var node = window;

        for (var i = 0; i < tokens.length; i++) {
            if (!node[tokens[i]]) {
                node[tokens[i]] = {};
            }
            node = node[tokens[i]];
        }

        return node;
    };

    // -------------------- END: GLOBAL FUNCTIONS ----------

    /**
     *
     * @param url
     * @param name 参数名
     * @returns
     *      参数值 if found
     *      '' if not found
     */
    var queryParams = function(url, name) {
        var q_idx = url.indexOf('?');
        var result = '';
        if (q_idx !== -1) {
            var query_string = url.substring(q_idx + 1);
            var tokens = query_string.split('&');
            for (var i = tokens.length - 1; i >= 0; i--) {
                var token = tokens[i];
                var entry = token.split('=');
                if (name === entry[0]) {
                    result = entry[1];
                }
            }
        }
        return result;
    };
    //----------- START: OOP ---------
    /*
    @!copied from coffeescript

    @EXAMPLE
    Set = (function() {
        function Set(b) {
          console.log('super constructor: ', b);
          this.container = [];
        }

        Set.prototype.add = function(elem) {
          if (this.container.indexOf(elem) === -1) {
            this.container.push(elem);
            return true;
          }
          return false;
        };

        return Set;

      })();

      var SubSet = (function(_super) {
        __extends(SubSet, _super);

        function SubSet(a) {
          console.log('child constructor a', a);
          SubSet.__super__.constructor.call(this, 'super');
        }

        SubSet.prototype.add = function(ele) {
          SubSet.__super__.add.call(this, ele);
          return console.log('child add', elem);
        };

        return SubSet;

      })(Set)
     */
    var OOP = (function() {
        var __hasProp = {}.hasOwnProperty;
        var __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

        return {
            // fix ie8 complain `delete, extends` seems to be the ie8 reserved words
            __extends: __extends
        };
    }());


    var DOM = (function() {

        function get_only_num_keypress_handler(is_dot_allowed){
            function _f($e) {
                var key = $e.keyCode || $e.which;
                key = String.fromCharCode(key);
                var regex = is_dot_allowed ? /[0-9]|\./ : /[0-9]/;
                if (!regex.test(key)) {
                    $e.returnValue = false;
                    if ($e.preventDefault) $e.preventDefault();
                }
            }

            return _f;
        }

        //get user browser view port
        // http://stackoverflow.com/questions/1766861/find-the-exact-height-and-width-of-the-viewport-in-a-cross-browser-way-no-proto
        function get_view_port() {
            var width, height;


            // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
            if (typeof window.innerWidth != 'undefined') {
                width = window.innerWidth;
                height = window.innerHeight;
            }

            // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
            else if (typeof document.documentElement !== 'undefined' && typeof document.documentElement.clientWidth !==
                'undefined' && document.documentElement.clientWidth !== 0) {

                width = document.documentElement.clientWidth;
                height = document.documentElement.clientHeight;
                
            }else{
                throw new Error();
            }


            return [width, height];
        }


        return {
            get_only_num_keypress_handler: get_only_num_keypress_handler,
            get_view_port: get_view_port
        };
    })();

    function get_template(tmpl_id) {
        var inner_html = $('#' + tmpl_id).html();
        assert(inner_html, 'we cant find requested template, please check your config');
        return inner_html;
    }
    //----------- END: OOP ---------


    function ID_GENERATOR() {
        this.seq = 0;
    }
    ID_GENERATOR.prototype.unique_id = function() {
        return (++this.seq) & 0xffff;
    };


    return {
        queryParams: queryParams,
        OOP: OOP,
        DOM: DOM,
        get_template: get_template,
        ID_GENERATOR: ID_GENERATOR,
    };
}());