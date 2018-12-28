/**
 * 些文件中做一些全局性的操作
 */
$(function() {
    renderCode();
    if ($('#framework').length > 0) {
        renderFramework();
    }
    // $(document).bind('DOMNodeInserted', function(e) {
    //     console.log(66);
    // });
    // $('#app').on('click', function(e) {
    //     console.log(66);
    // });
});
//渲染框架
function renderFramework() {
    new Vue({
        el: '#framework',
        data: {
            leftMenuConfig: {
                api: './data/left_menu.json', //接口地址
                //data: menuData, //api和data二选一，data是菜单的json数据,如果同时定义，以data优先
                logo: './images/tsa_menu_logo.png', //logo地址
                apiCallback: function(data) {
                    //回调函数可对接口数据进行加工，可选
                    return data;
                },
                ready: function(data) {
                    //菜单加载完成回调
                    //log(data);
                }
                /*
                logoStyle: {
                    //设置logo的样式，可选
                    backgroundPosition: '10px'
                },
                mode: 'load', //可以传入'load'或'iframe'来启用load模式与iframe模式，默认是常规模式
                //changeUrl: true, //load与iframe模式下，是否改变url,默认为false
                action: function(data, param) {
                    //load与iframe模式下,菜单点击后的回调，
                    //load模式下，第一个参数为返回的load内容，第二个参数为当前菜单的参数，
                    //iframe模式下，第一个参数为url，第二个参数为当前菜单的参数
                    console.log(data);
                    console.log(param);
                }
                */
            },
            topbarConfig: [
                {
                    icon: 'icon-system', //图标，必选
                    title: '文本', //鼠标放上去的title，可选
                    text: '文本按钮', //图标旁边的文字，可选
                    action: function(data) {
                        log(data);
                        //点击图标执行的动作，可选
                        gd.showSuccess('你点了文本按钮');
                    }
                },
                {
                    icon: 'icon-warning-hex',
                    title: '报警',
                    badge: '60', //如果定义的badge，将显示小红点
                    action: function() {
                        gd.showWarning('你点了报警');
                    }
                },
                {
                    icon: 'icon-fullscreen-hex',
                    title: '全屏',
                    action: function() {
                        gd.toggleFullscreen();
                    }
                },
                {
                    icon: 'icon-account-hex',
                    text: 'system',
                    dropItems: [
                        //如果定义了dropItems，将显示下拉框
                        {
                            icon: 'icon-user',
                            text: '个人信息', //下拉框的文本
                            action: function(data) {
                                log(data);
                                //下拉框的动作
                                gd.showSuccess('你点了个人信息');
                            }
                        },
                        {
                            text: '退出',
                            action: function() {
                                gd.showSuccess('你点了退出');
                            }
                        }
                    ]
                }
            ]
        }
    });
}
//渲染代码
function renderCode() {
    var convert = document.createElement('div');
    var pre = '';
    $('textarea[type="code"]').each(function(_, el) {
        convert.textContent = el.value;
        var html = convert.innerHTML;
        var whiteSpace = html.match(/^\s+/);
        if (whiteSpace.length > 0) {
            html = html.replace(new RegExp('\n' + whiteSpace[0], 'g'), '\n').trim();
        }
        pre =
            '<pre class="line-numbers"><code class="' +
            (el.className || 'language-html') +
            '">' +
            html +
            '</code></pre>';
        $(el).replaceWith(pre);
    });
    Prism.highlightAll();
}

/**配置全局ajax */
$.ajaxSetup({
    headers: {
        Authorization: 'Bearer ' + (localStorage.token || '')
    }
});
