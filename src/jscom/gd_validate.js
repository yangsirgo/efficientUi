/**
 * 校验组件
 */
export default function validate(el, config) {
    if (typeof config !== 'object') {
        config = {};
    }
    config.autoPlaceholer = config.autoPlaceholer == true; //自动添加placeholder
    config.focusError = config.focusError != false; //对错误数据获取焦点
    if (!(config.rules instanceof Array)) {
        config.rules = [];
    }
    return new GdValidate($(el), config.autoPlaceholer, config.focusError, config.rules);
}

function GdValidate(selector, autoPlaceholer, focusError, rules) {
    this.el = $(selector);
    this.isSubmit = false; //是否在提交，提交的时候不触发blur
    this.errorTip = ''; //错误信息提示，保存下来用于及时关闭
    this.autoPlaceholer = autoPlaceholer; //是否自动添加placeholder
    this.focusError = focusError; //是否自动对错误数据获取焦点
    this.rules = rules; //自定义校验规则
    this.init();
}
/**
 * 初始化，包括监听事件和添加placeholder
 */
GdValidate.prototype.init = function() {
    var _this = this;
    var elems = _this.el.find('[gd-validate]');
    elems
        .off('.gdvalid')
        .on('blur.gdvalid', function() {
            var _self = $(this);
            setTimeout(function() {
                //延时一下，不然先触发blur，后submit，会tip两次
                if (_this.isSubmit) {
                    _this.isSubmit = false;
                } else {
                    _this.validElem(_self, false);
                }
            }, 200);
        })
        .on('keydown.gdvalid', function() {
            if ($(this).is('.gd-input-error')) {
                $(this).removeClass('gd-input-error');
                gd.closeTip(_this.errorTip);
            }
        });
    elems.filter('[gdv-maxlength]').each(function(i, el) {
        var maxLength = $(el).attr('gdv-maxlength');
        $(el)
            .attr('maxlength', maxLength)
            .on('keydown.gdvalid', function(e) {
                if ($(el).is('.gd-input-error')) {
                    gd.closeTip(_this.errorTip);
                }
                if ($(el).val().length === maxLength) {
                    if (
                        (e.keyCode >= 48 && e.keyCode <= 90) ||
                        (e.keyCode >= 96 && e.keyCode <= 111) ||
                        e.keyCode === 229
                    ) {
                        $(el).addClass('gd-input-error');
                        _this.showErrorTips(_this.getValidMsg($(el), 'maxLength'), el);
                    }
                }
            });
    });
    elems.filter('[gd-validate="equalTo"]').each(function(i, el) {
        $('#' + $(el).attr('gdv-equal')).on('input.gdvalid', function() {
            $(el).removeClass('gd-input-error');
        });
    });
    if (_this.autoPlaceholer) {
        elems.each(function(i, el) {
            if (typeof $(el).attr('placeholder') === 'undefined') {
                var vNames = $(el)
                    .attr('gd-validate')
                    .split(' ');
                $.each(vNames, function(i, vName) {
                    if (_this.placeholder.hasOwnProperty(vName)) {
                        $(el).attr('placeholder', _this.getPlaceholder($(el), vName));
                        return false;
                    }
                });
            }
        });
    }
    this.rules.forEach(r => {
        this.validateMap[r.name] = r.valid;
        this.validateMsg[r.name] = r.msg || '';
    });
};
/**
 * 获取整体的较验结果
 */
GdValidate.prototype.valid = function() {
    var _this = this;
    var result = true;
    _this.isSubmit = true;
    _this.el.find('[gd-validate]').each(function(i, el) {
        setTimeout(function() {
            log($(el).offset());
        }, 500);

        result = _this.validElem($(el));
        if (result) {
            $(el).removeClass('gd-input-error');
        } else {
            //如果发现有不合法的，终止较验
            if (_this.focusError) {
                $(el).focus();
            }
            return false;
        }
    });
    return result;
};
/**
 * 较验单个元素
 */
GdValidate.prototype.validElem = function(el) {
    if ($(el).is(':hidden')) {
        return true;
    }
    var _this = this;
    var result = true;
    var vNames = $(el)
        .attr('gd-validate')
        .split(' ');
    $.each(vNames, function(i, vName) {
        if (_this.validateMap.hasOwnProperty(vName)) {
            if (vName === 'required' && _this.isSubmit === false) {
                //必填项只有在提交的时候才较验
                return true;
            }
            result = _this.validateMap[vName](
                $(el)
                    .val()
                    .trim(),
                $(el)
            );
            if (result) {
                $(el).removeClass('gd-input-error');
            } else {
                $(el).addClass('gd-input-error');
                _this.showErrorTips(_this.getValidMsg($(el), vName), el);
                return false; //如果发现有不合法的，终止较验
            }
        }
    });
    return result;
};
/**
 * 显示错误提示
 */
GdValidate.prototype.showErrorTips = function(tips, el) {
    debugger;
    gd.closeTip(this.errorTip);
    this.errorTip = gd.showTip(el, tips, { id: 'gdErrorTip', time: 5000 });
};
/**
 * 较验规则集合
 */
GdValidate.prototype.validateMap = {
    required: function(val) {
        //必填项
        return val !== '';
    },
    exceptSpecialChar: function(val) {
        //不包含特殊字符
        var reg = /[\`\~\!\@\#\$\%\^\&\*\(\)\=\+\;\:\'\"\\\|\,<\.\>\/\?\[\]\{\}]/;
        return val === '' || !reg.test(val);
    },
    normalChar: function(val) {
        //字母数字和下划线
        var reg = /^[_A-Za-z0-9]*$/;
        return val === '' || reg.test(val);
    },
    ip: function(val) {
        //ip，平时说ip,就指ipv4
        var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;
        return val === '' || reg.test(val);
    },
    ipPort: function(val) {
        //ip+端口号
        var regStr =
            '^((?:(?:25[0-5]|2[0-4]\\d|((1\\d{2})|([1-9]?\\d)))\\.){3}(?:25[0-5]|2[0-4]\\d|((1\\d{2})|' +
            '([1-9]?\\d))))(:((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([1-9]' +
            '[0-9]{3})|([1-9][0-9]{2})|([1-9][0-9]{1})|([0-9])))?$';
        var reg = new RegExp(regStr);
        return val === '' || reg.test(val);
    },
    port: function(val) {
        //端口号
        var regStr =
            '^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([1-9]' +
            '[0-9]{3})|([1-9][0-9]{2})|([1-9][0-9]{1})|([0-9]))?$';
        var reg = new RegExp(regStr);
        return val === '' || reg.test(val);
    },
    ipv6: function(val) {
        //ipv6
        var regStr =
            '^s*((([0-9A-Fa-f]{1,4}[:-]){7}(([0-9A-Fa-f]{1,4})|[:-]))|(([0-9A-Fa-f]{1,4}[:-]){6}([:-]' +
            '|((25[0-5]|2[0-4]d|[01]?d{1,2})(.(25[0-5]|2[0-4]d|[01]?d{1,2})){3})|([:-][0-9A-Fa-f]{1,4})))|' +
            '(([0-9A-Fa-f]{1,4}[:-]){5}(([:-]((25[0-5]|2[0-4]d|[01]?d{1,2})(.(25[0-5]|2[0-4]d|[01]?d{1,2}))' +
            '{3})?)|(([:-][0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}[:-]){4}([:-][0-9A-Fa-f]{1,4}){0,1}(([:-]' +
            '((25[0-5]|2[0-4]d|[01]?d{1,2})(.(25[0-5]|2[0-4]d|[01]?d{1,2})){3})?)|(([:-][0-9A-Fa-f]{1,4})' +
            '{1,2})))|(([0-9A-Fa-f]{1,4}[:-]){3}([:-][0-9A-Fa-f]{1,4}){0,2}(([:-]((25[0-5]|2[0-4]d|[01]?d{1,2})' +
            '(.(25[0-5]|2[0-4]d|[01]?d{1,2})){3})?)|(([:-][0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}[:-]){2}' +
            '([:-][0-9A-Fa-f]{1,4}){0,3}(([:-]((25[0-5]|2[0-4]d|[01]?d{1,2})(.(25[0-5]|2[0-4]d|[01]?d{1,2}))' +
            '{3})?)|(([:-][0-9A-Fa-f]{1,4}){1,2})))|(([0-9A-Fa-f]{1,4}[:-])([:-][0-9A-Fa-f]{1,4}){0,4}(([:-]' +
            '((25[0-5]|2[0-4]d|[01]?d{1,2})(.(25[0-5]|2[0-4]d|[01]?d{1,2})){3})?)|(([:-][0-9A-Fa-f]{1,4})' +
            '{1,2})))|([:-]([:-][0-9A-Fa-f]{1,4}){0,5}(([:-]((25[0-5]|2[0-4]d|[01]?d{1,2})(.(25[0-5]|2[0-4]d|' +
            '[01]?d{1,2})){3})?)|(([:-][0-9A-Fa-f]{1,4}){1,2})))|(((25[0-5]|2[0-4]d|[01]?d{1,2})(.(25[0-5]' +
            '|2[0-4]d|[01]?d{1,2})){3})))(%.+)?s*$';
        var reg = new RegExp(regStr);
        return val === '' || reg.test(val);
    },
    ipRanges: function(val, el, split, isCidr) {
        //ip段
        var segs = val.split(/[,;]/);
        var isValid = true;
        var _this = this;
        var inetAddr = function(ip) {
            //ip转整数
            if (!_this.ip(ip)) {
                return -1;
            }
            var ipVal = 0;
            var segs = ip.split('.');
            $(segs).each(function(_, seg) {
                ipVal = ipVal * 256 + parseInt(seg);
            });
            return ipVal;
        };
        $(segs).each(function(_, range) {
            if (isValid) {
                var ips = range.split(split || '-');
                if (ips.length == 1) {
                    //1节只检查IP是否合法
                    if (!_this.ip(ips[0])) {
                        isValid = false;
                    }
                } else if (ips.length == 2) {
                    var begin = inetAddr(ips[0]);
                    var end = inetAddr(ips[1]);
                    if (begin == -1) {
                        isValid = false;
                    } else if (end == -1) {
                        var ipSplit = ips[0].split('.');
                        if (isCidr && Number(ips[1] > 32) && val.indexOf('/') > -1) {
                            // 增加判断val.indexOf('/') > -1  cidr 格式的10.10.10.10/32 斜杠后面的数字不得大于32
                            isValid = false;
                        } else {
                            end = inetAddr(`${ipSplit[0]}.${ipSplit[1]}.${ipSplit[2]}.${ips[1]}`);
                            if (end == -1) {
                                isValid = false;
                            } else if (begin > end) {
                                isValid = false;
                            }
                        }
                    } else if (begin > end) {
                        isValid = false;
                    }
                } else {
                    //超出3节肯定是错的
                    isValid = false;
                }
            }
            if (!isValid) {
                return false;
            }
        });
        return val === '' || isValid;
    },
    cidr: function(val, el) {
        var flag = false;
        if (this.ip(val)) {
            flag = true;
        } else if (this.ipRanges(val, null, /-\/|\/-|-|\//, true)) {
            flag = true;
        }
        return val === '' || flag;
    },
    mac: function(val) {
        //mac
        var reg = /^([A-Fa-f0-9]{2}[:-]){5}[A-Fa-f0-9]{2}$/;
        return val === '' || reg.test(val);
    },
    email: function(val) {
        //邮件
        var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return val === '' || reg.test(val);
    },
    phone: function(val) {
        //电话
        var regMobile = /^((\+?86)|(\(\+86\)))?1\d{10}$/; //手机
        var regTel = /^((\+?86)|(\(\+86\)))?\d{3,4}-?\d{7,8}(-\d{3,4})?$/; //固话
        return val === '' || regMobile.test(val) || regTel.test(val);
    },
    number: function(val) {
        //数字
        return val === '' || !isNaN(val);
    },
    maxValue: function(val, el) {
        //最大值
        var number = Number(val);
        var maxValue = $(el).attr('gdv-maxvalue');
        return val === '' || (!isNaN(number) && number <= maxValue);
    },
    minValue: function(val, el) {
        //最小值
        var number = Number(val);
        var minValue = $(el).attr('gdv-minvalue');
        return val === '' || (!isNaN(number) && number >= minValue);
    },
    valueRange: function(val, el) {
        //数值范围
        var number = Number(val);
        var maxValue = $(el).attr('gdv-maxvalue');
        var minValue = $(el).attr('gdv-minvalue');
        return val === '' || (!isNaN(number) && number <= maxValue && number >= minValue);
    },
    int: function(val, el) {
        //整数
        var reg = /^-?\d+$/;
        return val === '' || reg.test(val);
    },
    maxLength: function(val, el) {
        //最大长度
        var strLength = val.length;
        var maxLength = $(el).attr('gdv-maxlength');
        var minLength = $(el).attr('gdv-minlength');
        return val === '' || strLength <= maxLength;
    },
    minLength: function(val, el) {
        //最小长度
        var strLength = val.length;
        var minLength = $(el).attr('gdv-minlength');
        return val === '' || strLength >= minLength;
    },
    lengthRange: function(val, el) {
        //长度范围
        var strLength = val.length;
        var maxLength = $(el).attr('gdv-maxlength');
        var minLength = $(el).attr('gdv-minlength');
        return val === '' || (strLength <= maxLength && strLength >= minLength);
    },
    url: function(val, el) {
        //url
        var regStr =
            '^(ht|f)tp(s?)://[0-9a-zA-Z]([-.w]*[0-9a-zA-Z])*(:(0-9)*)' + "*(/?)([a-zA-Z0-9-.?,'/\\+&amp;%$#_]*)?";
        var reg = new RegExp(regStr);
        return val === '' || reg.test(val);
    },
    equalTo: function(val, el) {
        //两次输入一致
        return (
            $('#' + $(el).attr('gdv-equal'))
                .val()
                .trim() === val
        );
    },
    remote: function(val, el) {
        //远程较验
        if (val === '') {
            return true;
        }
        var isValid = true;
        var url = $(el).attr('gdv-api');
        var name = $(el).attr('name');
        var data = {};
        data[name] = val;
        $.ajax({
            type: 'get',
            url: url,
            cache: false,
            async: false,
            timeout: 30000,
            data: data,
            success: function(response, status, xhr) {
                isValid = response;
            },
            error: function(xhr, errorText, errorStatus) {
                isValid = false;
            }
        });
        return isValid;
    }
};
/**
 * 返回错误提示信息
 */
GdValidate.prototype.getValidMsg = function(el, vName) {
    var validMsg = '';
    switch (vName) {
        case 'maxValue':
            validMsg = this.strFormat(this.validateMsg[vName], el.attr('gdv-maxvalue'));
            break;
        case 'minValue':
            validMsg = this.strFormat(this.validateMsg[vName], el.attr('gdv-minvalue'));
            break;
        case 'valueRange':
            validMsg = this.strFormat(this.validateMsg[vName], el.attr('gdv-minvalue'), el.attr('gdv-maxvalue'));
            break;
        case 'maxLength':
            validMsg = this.strFormat(this.validateMsg[vName], el.attr('gdv-maxlength'));
            break;
        case 'minLength':
            validMsg = this.strFormat(this.validateMsg[vName], el.attr('gdv-minlength'));
            break;
        case 'lengthRange':
            validMsg = this.strFormat(this.validateMsg[vName], el.attr('gdv-minlength'), el.attr('gdv-maxlength'));
            break;
        case 'remote':
            validMsg = el.attr('gdv-remote-msg').trim();
            break;
        default:
            validMsg = this.validateMsg[vName];
    }
    return (el.attr('gdv-msg') || '').trim() || validMsg;
};
/**
 * 返回placeholder
 */
GdValidate.prototype.getPlaceholder = function(el, vName) {
    var placeholder = '';
    switch (vName) {
        case 'maxValue':
            placeholder = this.strFormat(this.placeholder[vName], el.attr('gdv-maxvalue'));
            break;
        case 'minValue':
            placeholder = this.strFormat(this.placeholder[vName], el.attr('gdv-minvalue'));
            break;
        case 'valueRange':
            placeholder = this.strFormat(this.placeholder[vName], el.attr('gdv-minvalue'), el.attr('gdv-maxvalue'));
            break;
        case 'maxLength':
            placeholder = this.strFormat(this.placeholder[vName], el.attr('gdv-maxlength'));
            break;
        case 'minLength':
            placeholder = this.strFormat(this.placeholder[vName], el.attr('gdv-minlength'));
            break;
        case 'lengthRange':
            placeholder = this.strFormat(this.placeholder[vName], el.attr('gdv-minlength'), el.attr('gdv-maxlength'));
            break;
        default:
            placeholder = this.placeholder[vName];
    }
    return (el.attr('gdv-msg') || '').trim() || placeholder;
};
/**
 * 错误信息描述
 */
GdValidate.prototype.validateMsg = {
    exceptSpecialChar: '不可包含以下字符：` ~ ! @ # $ % ^ & * ( ) = + ; : \' " |, < > . / ? [ ]{ }',
    normalChar: '只能包含字母、数字和下划线',
    required: '必填项',
    ip: 'IP格式不正确',
    ipPort: '格式不正确',
    port: '端口号为0-65535之间的整数',
    ipv6: 'IPV6格式不正确',
    email: '邮箱格式不正确',
    phone: '电话格式不正确',
    ipRanges: 'IP网段不正确',
    cidr: ' CIDR IP地址不正确',
    mac: 'MAC地址不正确',
    number: '请输入数字',
    maxValue: '请输入不大于{0}的数值',
    minValue: '请输入不小于{0}的数值',
    valueRange: '请输入{0}到{1}之间的数值',
    int: '只可输入整数',
    maxLength: '不可超过{0}个字符',
    minLength: '不可少于{0}个字符',
    lengthRange: '{0}到{1}个字符',
    url: 'url格式不正确',
    equalTo: '两次输入密码不一致',
    remote: '数据已存在'
};
/**
 * placeholder
 */
GdValidate.prototype.placeholder = {
    ip: '如:192.168.3.10',
    ipPort: '如:192.168.3.10:8080',
    ipRanges: '如:192.168.3.10-192.168.3.50',
    mac: '如:00-E0-4C-32-56-76',
    port: '0-65535之间的整数',
    maxValue: '输入不大于{0}的数值',
    minValue: '输入不小于{0}的数值',
    valueRange: '输入{0}到{1}之间的数值',
    int: '只可输入整数',
    maxLength: '不可超过{0}个字符',
    minLength: '不可少于{0}个字符',
    lengthRange: '{0}到{1}个字符',
    url: '如:http://www.neiwang.cn'
};
/**
 * 格式化字符串
 */
GdValidate.prototype.strFormat = function() {
    var str = arguments[0];
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            if (arguments[i] != undefined) {
                var reg = new RegExp('({)' + (i - 1) + '(})', 'g');
                str = str.replace(reg, arguments[i]);
            }
        }
    }
    return str;
};
