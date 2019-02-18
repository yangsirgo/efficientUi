/**
 * 显示Loading
 */
export function showLoading(text) {
    closeLoading();
    let dom = createDom(text);
    dom.css('z-index', gd.getMaxZIndex() + 10000);
    $('body').append(dom);
    return;
}

/**
 * 创建dom
 */
function createDom(text) {
    if (typeof text !== 'string' && typeof text !== 'number') {
        text = '加载中…';
    }
    let dom = $(`
    <div class="gd-loading">
        <div class='gd-loading-body'>
            <div class='gd-loading-img'></div>
            <div class="gd-loading-text">${text}</div>
        </div>
    </div>
    `);
    return dom;
}

/**
 * 关闭Loading
 */
export function closeLoading() {
    $('.gd-loading').remove();
}
