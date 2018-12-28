let [successDom, wraningDom, errorDom] = ['', '', ''];
$(function() {
    //鼠标划过显示tooltip
    $('body').on('mouseenter', '[tooltip]', function() {
        let _this = $(this);
        let msg = $(this)
            .attr('tooltip')
            .trim();
        let tips = showTip(_this, msg, { time: 0 });
        $(this).one('mouseleave', function() {
            closeTip(tips);
        });
    });
});
//显示tip信息
export function showTip(el, msg, config) {
    let dom = $(`
    <div class="gd-tooltip">
        <div class="gd-tooltip-text">${msg}</div>
        <div class="gd-tooltip-trangle"></div>
    </div>
    `);
    dom.css({
        left: 0,
        top: 0,
        zIndex: gd.getMaxZIndex() + 1
    });
    //支持设置id
    if (typeof config !== 'undefined' && config.id !== undefined) {
        closeTip($('#' + config.id));
        dom.attr('id', config.id);
    }
    $('body').append(dom);
    let pad = 5; //距窗口边缘5px
    let margin = 10; //距目标元素5px
    let elWidth = $(el).outerWidth(); //目标元素宽度
    let elHeight = $(el).outerHeight(); //目标元素高度
    let elLeft = $(el).offset().left; //目标元素left位置
    let elTop = $(el).offset().top; //目标元素top位置

    let tipWidth = dom.width(); //tip宽度
    let tipHeight = dom.height(); //tip高度
    let position = 'top';
    if (typeof config !== 'undefined' && config.position !== undefined) {
        //如果设置的位置，以设置的为准
        position = config.position;
    } else {
        //判定显示位置
        if (elTop - tipHeight - margin > pad) {
            position = 'top';
        } else if (elLeft + elWidth + tipWidth + margin + pad < window.innerWidth) {
            position = 'right';
        } else if (elLeft - tipWidth - margin > pad) {
            position = 'left';
        } else if (elTop + elHeight + tipHeight + margin + pad < window.innerHeight) {
            position = 'bottom';
        }
    }
    let offset = 0; //偏移纠正
    if (position === 'top') {
        let tipLeft = elLeft + (elWidth - tipWidth) / 2; //tip left位置
        let tipRight = window.innerWidth - tipLeft - tipWidth; //tip right位置
        let tipTop = elTop - tipHeight - margin; //tip top位置
        if (tipLeft < pad) {
            offset = pad - tipLeft;
        } else if (tipRight < pad) {
            offset = tipRight - pad;
        }
        dom.css({
            left: tipLeft + offset,
            top: tipTop
        });
        dom.find('.gd-tooltip-trangle').css('margin-left', -offset);
    } else if (position === 'bottom') {
        let tipLeft = elLeft + (elWidth - tipWidth) / 2; //tip left位置
        let tipRight = window.innerWidth - tipLeft - tipWidth; //tip right位置
        let tipTop = elTop + elHeight + margin; //tip top位置
        if (tipLeft < pad) {
            offset = pad - tipLeft;
        } else if (tipRight < pad) {
            offset = tipRight - pad;
        }
        dom.css({
            left: tipLeft + offset,
            top: tipTop
        });
        dom.find('.gd-tooltip-trangle').css('margin-left', -offset);
    } else if (position === 'right') {
        let tipLeft = elLeft + elWidth + margin; //tip left位置
        let tipTop = elTop - (tipHeight - elHeight) / 2; //tip top位置
        let tipBottom = window.innerHeight - tipTop - tipHeight; //tip bottom位置
        if (tipTop < pad) {
            offset = pad - tipTop;
        } else if (tipBottom < pad) {
            offset = tipBottom - pad;
        }
        dom.css({
            left: tipLeft,
            top: tipTop + offset
        });
        dom.find('.gd-tooltip-trangle').css('margin-top', -offset);
    } else {
        let tipLeft = elLeft - tipWidth - margin; //tip left位置
        let tipTop = elTop - (tipHeight - elHeight) / 2; //tip top位置
        let tipBottom = window.innerHeight - tipTop - tipHeight; //tip bottom位置
        if (tipTop < pad) {
            offset = pad - tipTop;
        } else if (tipBottom < pad) {
            offset = tipBottom - pad;
        }
        dom.css({
            left: tipLeft,
            top: tipTop + offset
        });
        dom.find('.gd-tooltip-trangle').css('margin-top', -offset);
    }
    $(dom)
        .addClass('gd-tooltip-show')
        .find('.gd-tooltip-trangle')
        .addClass('gd-tooltip-trangle-' + position);
    if (typeof config !== 'undefined' && config.time !== undefined) {
        if (config.time > 0) {
            setTimeout(() => {
                gd.closeTip(dom);
            }, config.time);
        }
    } else {
        setTimeout(() => {
            gd.closeTip(dom);
        }, 3000);
    }
    //滚动和缩放窗口，关闭tips
    $(el)
        .parents()
        .scroll(() => {
            closeTip(dom);
        });
    $(window).resize(() => {
        closeTip(dom);
    });
    return dom;
}
//关闭tip信息
export function closeTip(dom) {
    $(dom).remove();
}
//显示成功提示
export function showSuccess(msg, config) {
    return insertInfo(config, msg, 'icon-success');
}
//显示警告提示
export function showWarning(msg, config) {
    return insertInfo(config, msg, 'icon-notice');
}
//显示错误提示
export function showError(msg, config) {
    return insertInfo(config, msg, 'icon-error');
}
//显示普通信息
export function showMsg(msg, config) {
    config = $.extend({}, config);
    if (config.time) {
        config.closeBtn = false;
    } else {
        config.closeBtn = true;
        config.time = 0;
    }
    config.time = parseInt(config.time / 100) * 100;
    let closeHtml = config.closeBtn ? '<i class="gd-msg-close icon-close"></i>' : '';
    let time = config.time / 1000 > 100 ? '100+&nbsp;s' : config.time / 1000 + '&nbsp;s';
    let timeHtml = config.time > 0 ? `<span class="gd-msg-time">${time}</span>` : '';
    let btnHtml = '';
    if (config.btn && config.btn.length > 0) {
        btnHtml += '<div class="gd-msg-btn-box">';
        config.btn.forEach((o, i) => {
            btnHtml += `<button class="gd-msg-btn ${o.class ||
                (i === config.btn.length - 1 ? 'gd-btn-cancel' : 'gd-btn')}">
            ${o.text}
            </button>`;
        });
        btnHtml += '</div>';
    }
    let dom = $(`
    <div class="gd-msg">
    ${closeHtml}${timeHtml}<div class="gd-msg-text">${msg}</div>${btnHtml}
    </div>
    `);
    insertMsg(dom, config);
    dom.find('.gd-msg-close').click(e => closeMsg(dom));
    $(dom)
        .find('.gd-msg-btn')
        .one('click', function() {
            let index = $(dom)
                .find('.gd-msg-btn')
                .index(this);
            if (typeof config.btn[index].action == 'function') {
                config.btn[index].action(dom);
            }
            gd.closeMsg(dom);
        });
    return dom;
}
//将提示信息插入到dom中
function insertInfo(config, msg, icon) {
    $('.gd-info').remove();
    config = $.extend({ time: 3000 }, config);
    config.time = parseInt(config.time / 100) * 100;
    let dom = $(`
    <div class="gd-info">
        <i class="gd-info-icon ${icon}"></i><span class="gd-info-text">${msg}</span>
    </div>
    `);
    $(dom).css({
        zIndex: gd.getMaxZIndex() + 1000
    });
    $('body').append(dom);
    if (config.time > 0) {
        setTimeout(() => {
            closeMsg(dom);
        }, config.time);
    }
    return dom;
}
//将消息插入到dom中
function insertMsg(dom, config) {
    if (config.id !== undefined) {
        $('#' + config.id).remove();
        dom.attr('id', config.id);
    }
    let top = 60;
    $('.gd-msg').each((i, el) => {
        $(el).animate({ top: top }, 300);
        let curHeight = $(el).outerHeight();
        top += curHeight + 20;
    });
    $(dom).css({
        top,
        zIndex: gd.getMaxZIndex() + 1000
    });
    $('body').append(dom);
    if (config.time > 0) {
        setTimeout(() => {
            let timer = setInterval(() => {
                config.time -= 100;
                if (config.time % 1000 === 0) {
                    $(dom)
                        .find('.gd-msg-time')
                        .html(config.time / 1000 > 100 ? '100+&nbsp;s' : config.time / 1000 + '&nbsp;s');
                }
                if (config.time < 1) {
                    $(dom).animate({ right: -320 }, 300, () => {
                        closeMsg(dom);
                    });
                    clearInterval(timer);
                }
            }, 100); //100ms为单位，太小了不精确
        }, 600);
    }
}
//关闭消息
export function closeMsg(dom, callback) {
    if (dom.is('.gd-info')) {
        dom.addClass('gd-info-hide');
        setTimeout(() => {
            dom.remove();
        }, 200);
    } else {
        $(dom).animate({ right: -320 }, 300, () => {
            $(dom).remove();
            let toTop = 60;
            $('.gd-msg').each((i, el) => {
                $(el).animate({ top: toTop }, 300);
                let curHeight = $(el).outerHeight();
                toTop += curHeight + 20;
            });
            if (typeof callback === 'function') {
                callback();
            }
        });
    }
}
