/**
 * @Description:
 * @author guochao yang
 * @date 2019/1/8
 */


function CurrentValidate(options) {
    var defaultOptions = {
        el: '.gd-current-validate',
        toFixed: 2,//小数点后两位
        errorCallBack: function () {

        }
    };
    options = $.extend({}, defaultOptions, options);
    $(document).on('keyup', options.el, function (event) {
        var dom = event.target;
        var value = dom.value;
        if (value === '' || value === undefined) return;
        dom.value = value.trim();// 用户输入去除空格
        var cutLength = options.toFixed;
        var isNumTofix = new RegExp("^\\d*.?\\d{1," + cutLength + "}$", "g");
        var valueNum = +value;

        if (isNaN(valueNum) || valueNum < 0) {
            gd.showError('请输入正确的正整数');
            options.errorCallBack();
        } else {
            if (isNumTofix.test(valueNum)) {//输入正确部分逻辑
                if (value.lastIndexOf('\.') === -1) {//没有.的情况
                    if (value.length != String(valueNum).length) {
                        dom.value = valueNum;
                    }
                } else {
                    var splitArr = value.split('\.');
                    var dotAbove = splitArr[0];
                    var dotAfter = splitArr[1];
                    if (dotAfter.length > cutLength) {//针对9.00000 情况 保证9.00
                        dotAfter = dotAfter.substr(0, cutLength);
                    }
                    var targetValue = String(+dotAbove) + '.' + dotAfter;//输入数字的整数部分去除000
                    if (targetValue === '0.00') {
                        targetValue = 0;
                    }
                    dom.value = targetValue;
                }
            } else {//用户输入了超过两位小数点
                dom.value = dom.value.substr(0, dom.value.lastIndexOf('\.') + cutLength + 1);
            }
        }
        return false;
    })

}

$.fn.currentValidate = function (config) {
    return CurrentValidate($.extend({
        el: this
    }, config || {}));
};

