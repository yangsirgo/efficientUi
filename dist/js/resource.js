/**
 * 加载资源
 */

//css资源
var devMode = true; //开发模式
var resource = [];
if (devMode) {
    resource = [
        './js/plugins/prism/prism.css',
        './gdui/src/iconfont/iconfont.css',
        './gdui/src/normalize.css',
        './gdui/src/gd_common.css',
        './gdui/src/gd_login.css',
        './gdui/src/gd_left_menu.css',
        './gdui/src/gd_topmenu.css',
        './gdui/src/gd_topbar.css',
        './gdui/src/gd_button.css',
        './gdui/src/gd_form.css',
        './gdui/src/gd_msg.css',
        './gdui/src/gd_tab.css',
        './gdui/src/gd_table.css',
        './gdui/src/gd_tag.css',
        './gdui/src/gd_tree.css',
        './gdui/src/gd_layer.css',
        './gdui/src/gd_placeholder.css',
        './gdui/src/gd_timepicker.css',
        './gdui/src/gd_datepicker.css',
        './gdui/src/gd_recentpicker.css',
        './gdui/src/gd_toolbar.css',
        './gdui/src/gd_hoverbox.css',
        './gdui/src/gd_loading.css',
        './gdui/src/gd_district.css',
        './gdui/src/gd_lowbrowser.css',
        './gdui/src/gd_pagination.css',
        './gdui/src/card.css',
        './gdui/src/steps.css',
        './gdui/src/divider.css',
        './gdui/src/collapse.css',
        './gdui/src/grid.css',
        './gdui/src/codeSide.css',
    ];
} else {
    resource = ['./js/plugins/prism/prism.css', './gdui/css/gdui.min.css', './css/global.css'];
}
for (var i = 0; i < resource.length; i++) {
    document.write('<link rel="stylesheet" href="' + resource[i] + '">');
}

//js资源
resource = [
    './gdui/js/gd_iecheck.js',
    './js/plugins/jquery.min.js',
    './js/plugins/vue.js',
    './gdui/js/gdui.min.js',
    './js/plugins/clipboard.min.js',
    './js/global.js',
    './gdui/js/document.js'
];
for (var i = 0; i < resource.length; i++) {
    document.write('<script src="' + resource[i] + '"></script>');
}
document.write('<script src="./js/plugins/prism/prism.js" data-manual></script>');
