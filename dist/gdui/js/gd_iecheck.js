/**
 * 对IE9以下版本给出升级提示
 * 引用在gdui.css之后，所有js之前
 */

var gdIeCheckHtml =
    '<div class="gd-lowbrowser">' +
    '<div class="gd-lowbrowser-panel">' +
    '<h2 class="gd-lowbrowser-title">浏览器版本过低</h2>' +
    '<h5 class="gd-lowbrowser-info">为了保证您的正常使用和数据安全，建议您立即升级</h5>' +
    '<div class="gd-lowbrowser-browbox">' +
    '<a href="https://www.google.cn/chrome/" class="gd-lowbrowser-item gd-lowbrowser-chrome" target="_blank"></a>' +
    '<a href="http://www.firefox.com.cn/" class="gd-lowbrowser-item gd-lowbrowser-firefox" target="_blank"></a>' +
    '<a href="https://support.microsoft.com/zh-cn/help/18520/download-internet-explorer-11-offline-installer" class="gd-lowbrowser-item gd-lowbrowser-ie"target="_blank"></a>' +
    '</div>' +
    '</div>' +
    '</div>';

function getBrowserInfo() {
    var ua = window.navigator.userAgent.toLowerCase();
    var match = '';
    var regMsie = /(msie\s|trident.*rv:)([\w.]+)/;
    match = regMsie.exec(ua);
    if (match != null) {
        return { browser: 'ie', version: parseInt(match[2]) || 0 };
    }
    return {};
}
var browserInfo = getBrowserInfo();
if (browserInfo.browser == 'ie' && browserInfo.version < 10) {
    document.write(gdIeCheckHtml);
    document.execCommand('Stop');
}
