//显示悬浮窗
export function showHoverBox(config) {
    setTimeout(() => {
        bindEvents(dom, config);
    }, 10);
    $('.gd-hoverbox').remove();
    let dom = getDom(config);
    $('body').append(dom);
    setPosition(dom, config);
    $(config.el).addClass('gd-hover');
    return dom;
}

//绑定事件
function bindEvents(dom, config) {
    let isMouseInDom = false; //鼠标是否在dom内
    let isMouseInTarget = true; //鼠标是否在目标元素内
    //点击空白关闭
    $('body')
        .off('click.hoverbox')
        .on('click.hoverbox', e => {
            closeHoverBox(dom);
            $('body').off('click.hoverbox');
        });

    //离开目标元素后判断是否要关闭
    $(config.el)
        .off('mouseleave.hoverbox')
        .off('mouseenter.hoverbox')
        .on('mouseleave.hoverbox', () => {
            isMouseInTarget = false;
            setTimeout(() => {
                if (!isMouseInDom && config.autoClose !== false) {
                    closeHoverBox(dom);
                }
            }, 10);
        })
        .on('mouseenter.hoverbox', () => {
            isMouseInTarget = true;
        });
    dom
        //鼠标进入，isMouseInDom为true,防止离开目标元素后关闭
        .on('mouseenter', () => {
            isMouseInDom = true;
        })
        //鼠标移出关闭
        .on('mouseleave', () => {
            isMouseInDom = false;
            setTimeout(() => {
                if (!isMouseInTarget && config.autoClose !== false) {
                    closeHoverBox(dom);
                }
            }, 50);
        })
        //点击事件
        .on('click', '.gd-cursor-pointer', e => {
            let index = dom.find('.gd-cursor-pointer').index(e.currentTarget);
            if (config.items[index].disabled !== true) {
                if (typeof config.onClick === 'function') {
                    config.onClick(gd.clone(config.items[index]), gd.clone(config.items));
                }
                $('.gd-hover').removeClass('gd-hover');
                $(dom).remove();
            }
        })
        //复选框勾选事件
        .on('change', '.gd-hoverbox-item input[type="checkbox"]', e => {
            let index = dom.find('.gd-hoverbox-item input[type="checkbox"]').index(e.currentTarget);
            config.items[index].checked = $(e.currentTarget).prop('checked');
            if (typeof config.onChange === 'function') {
                config.onChange(gd.clone(config.items[index]), gd.clone(config.items));
            }
        })
        //阻止冒泡
        .on('click', e => {
            e.stopPropagation();
        });
}
/**
 * 设置位置
 */
function setPosition(dom, config) {
    let target = $(config.el);
    let targetTop = target.offset().top;
    let targetLeft = target.offset().left;
    let targetWidth = target.outerWidth();
    let targetHeight = target.outerHeight();
    let domWidth = dom.outerWidth();
    let domHeight = dom.outerHeight();
    let paddingTop = 5; //顶部padding
    let pathOffset = domWidth * 0.3; //人为偏移
    if (config.position === 'left') {
        let offset = Math.min(window.innerHeight - (targetTop + domHeight + 10), 0);
        dom.find('.gd-hoverbox-trangle i').css({
            top: (targetHeight - 12) / 2 - offset + paddingTop
        });
        dom.addClass('gd-hoverbox-left').css({
            left: targetLeft - domWidth - 10,
            top: targetTop + offset - paddingTop
        });
    } else if (config.position === 'right') {
        let offset = Math.min(window.innerHeight - (targetTop + domHeight + 10), 0);
        dom.find('.gd-hoverbox-trangle i').css({
            top: (targetHeight - 12) / 2 - offset + paddingTop
        });
        dom.addClass('gd-hoverbox-right').css({
            left: targetLeft + targetWidth + 10,
            top: targetTop + offset - paddingTop
        });
    } else if (config.position === 'top') {
        let domOffsetLeft = targetLeft - (domWidth - targetWidth) / 2 + pathOffset;
        let domOffsetRight = domOffsetLeft + domWidth;
        let offsetLeft = Math.max(domOffsetLeft, 10);
        if (domOffsetLeft < 10) {
            offsetLeft = 10;
        } else if (window.innerWidth - domOffsetRight < 10) {
            offsetLeft = targetLeft - (domWidth - targetWidth) / 2 - pathOffset;
        } else {
            offsetLeft = domOffsetLeft;
        }
        let offset = offsetLeft - domOffsetLeft + pathOffset;
        dom.addClass('gd-hoverbox-top')
            .find('.gd-hoverbox-trangle i')
            .css({
                left: (domWidth - 12) / 2 - offset
            });
        dom.css({
            left: offsetLeft,
            top: targetTop - domHeight - 10
        });
    } else {
        let domOffsetLeft = targetLeft - (domWidth - targetWidth) / 2 + pathOffset;
        let domOffsetRight = domOffsetLeft + domWidth;
        let offsetLeft = 0;
        if (domOffsetLeft < 10) {
            offsetLeft = 10;
        } else if (window.innerWidth - domOffsetRight < 10) {
            offsetLeft = targetLeft - (domWidth - targetWidth) / 2 - pathOffset;
        } else {
            offsetLeft = domOffsetLeft;
        }
        let offset = offsetLeft - domOffsetLeft + pathOffset;
        dom.find('.gd-hoverbox-trangle i').css({
            left: (domWidth - 12) / 2 - offset
        });
        dom.addClass('gd-hoverbox-bottom').css({
            left: offsetLeft,
            top: targetTop + targetHeight + 10
        });
    }
}
//获取dom
function getDom(config) {
    let dom = $(`<div class="gd-hoverbox ${config.class || ''}"><div class="gd-hoverbox-trangle"><i></i></div></div>`);
    dom.append('<div class="gd-hoverbox-content"></div>');
    let content = dom.find('.gd-hoverbox-content');
    if (config.items instanceof Array) {
        let hasIcon = config.items.some(item => {
            return item.icon;
        });
        config.items.forEach(item => {
            let iconHtml = hasIcon ? `<i class="${item.icon || ''}"></i>` : '';
            if (config.checkbox == true && item.checked !== true) {
                item.checked = false;
            }
            if (config.checkbox == true) {
                content.append(
                    $(`<div class="gd-hoverbox-item" ${item.disabled === true ? 'disabled' : ''}>
                        ${iconHtml}<label class="gd-checkbox">
                        <input type="checkbox" ${item.checked ? 'checked' : ''} ${
                        item.disabled === true ? 'disabled' : ''
                    }><i></i>${item.text}</label></div>`)
                );
            } else {
                content.append(
                    $(`<div class="gd-hoverbox-item gd-cursor-pointer" ${item.disabled === true ? 'disabled' : ''}>
                    ${iconHtml}${item.text}</div>`)
                );
            }
        });
    } else if (config.content !== undefined) {
        if (typeof config.content === 'object') {
            dom.placeholder = $('[gd-hoverbox-placeholder]').length;
            $(config.content).after(`<template gd-hoverbox-placeholder="${dom.placeholder}"></template>`);
            content.append(config.content);
        } else {
            content.append(config.content);
        }
    }
    dom.css('z-index', gd.getMaxZIndex());
    if (config.size instanceof Array && config.size.length == 2) {
        config.size[0] = parseFloat(config.size[0]);
        config.size[1] = parseFloat(config.size[1]);
        dom.css({
            width: config.size[0],
            height: config.size[1]
        });
    }
    dom.config = config;
    return dom;
}
function closeHoverBox(dom) {
    if (typeof dom.config.onClose === 'function') {
        dom.config.onClose(gd.clone(dom.config.items || dom));
    }
    if (dom.placeholder !== undefined) {
        dom.find('.gd-hoverbox-trangle').remove();
        $(`template[gd-hoverbox-placeholder="${dom.placeholder}"]`).replaceWith(dom.children());
    }
    $(dom).remove();
    $(dom.config.el).removeClass('gd-hover');
    if (typeof dom.config.end === 'function') {
        dom.config.end(dom);
    }
    $('body').off('click.hoverbox');
}
