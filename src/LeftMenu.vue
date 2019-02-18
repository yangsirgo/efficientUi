<template>
    <div class="gd-left-menu" @mouseenter="spread" @mouseleave="shrink" ref="leftMenu" style="overflow:hidden">
        <div class="gd-left-menu-logo" :class="{'gd-left-menu-logopic':config.text}" :style="menuData.logoStyle"><span v-if="config.text" class="gd-left-menu-prodname" :style="config.textStyle">{{config.text}}</span></div>
        <ul class="gd-left-menu-body">
            <li class="gd-left-menu-item" v-for="item,index in menuData.menus" @mouseenter="showSub($event,item)" @mouseleave="hideSub($event,item)" @click="goPage(item,index)" :data-href="item.href">
                <div class="gd-left-menu-content gd-left-menu-text" :class="{'gd-active':item.isActive}">
                    <i class="gd-left-menu-icon" :class="[item.icon]"></i>
                    <span class="gd-left-menu-name">{{item.name}}</span>
                    <i class="gd-left-menu-next icon-right" v-if="item.sub&&item.sub.length"></i>
                </div>
                <transition name="fade" v-if="item.sub">
                    <gd-leftmenu-sub :data="item.sub" :mode="config.mode" :changeUrl="config.changeUrl" :action="config.action" :styleProp="styleProp" :idx="index" v-show="item.subShow" @clearHighlight="clearHighlight(menuData.menus)" @subUpdate="subUpdate">
                    </gd-leftmenu-sub>
                </transition>
            </li>
        </ul>v
    </div>
</template>
<script>
import Bus from "./bus.js";
let pageName = []; //保存菜单名字，给topbar用
export default {
    props: ["config"],
    data() {
        let logoStyle = { backgroundImage: "url(" + this.config.logo + ")" };
        if (typeof this.config.logoStyle === "object") {
            $.extend(true, logoStyle, this.config.logoStyle);
        }
        return {
            menuData: { logoStyle },
            styleProp: { top: 0, bottom: "auto" }
        };
    },
    methods: {
        //添加高亮
        addHighlight(data, prev) {
            var flag = false;
            var _this = this;
            $.each(data, function(index, obj) {
                obj.isActive = false;
                if (
                    (obj.href && location.href.indexOf(obj.href) > -1) ||
                    (location.pathname === "/" &&
                        (location.origin + "/index.html").indexOf(obj.href) >
                            -1)
                ) {
                    obj.isActive = true;
                    if (prev) {
                        prev.isActive = true;
                    }
                    flag = true;
                    pageName.unshift(obj.name);
                    return false;
                } else if (typeof obj.sub !== "undefined") {
                    if (_this.addHighlight(obj.sub, obj)) {
                        if (prev) {
                            prev.isActive = true;
                        }
                        flag = true;
                        pageName.unshift(obj.name);
                        return false;
                    }
                }
            });
            return flag;
        },
        //清空高亮
        clearHighlight(data) {
            data.forEach(h => {
                Vue.set(h, "isActive", false);
                h.sub && this.clearHighlight(h.sub);
            });
        },
        //展开
        spread() {
            var self = this.$refs.leftMenu;
            $(self)
                .addClass("gd-left-menu-expand")
                .stop()
                .animate({ width: 200 }, 200, function() {
                    $(self).css({
                        "overflow-x": "visible",
                        overflow: ""
                    });
                });
        },
        //收起
        shrink() {
            var self = this.$refs.leftMenu;
            $(self)
                .removeClass("gd-left-menu-expand")
                .css({
                    "overflow-x": "",
                    overflow: "hidden"
                });
            $(self)
                .stop()
                .animate({ width: 56 }, 100);
        },
        //跳页
        goPage(item, index) {
            if (item.href) {
                let _this = this;
                _this.shrink();
                if (this.config.mode === "load") {
                    this.clearHighlight(this.menuData.menus);
                    item.isActive = true;
                    Vue.set(this.menuData.menus, index, item);
                    pageName = [item.name];
                    Bus.$emit("dispetchPageName", pageName);
                    if (this.config.changeUrl) {
                        history.pushState({}, null, item.href);
                    }
                    $.get(item.href, function(data) {
                        try {
                            _this.config.action(data, {
                                name: item.name,
                                icon: item.icon,
                                href: item.href
                            });
                        } catch (e) {
                            console.error(e.message);
                        }
                    });
                } else if (this.config.mode === "iframe") {
                    this.clearHighlight(this.menuData.menus);
                    item.isActive = true;
                    Vue.set(this.menuData.menus, index, item);
                    pageName = [item.name];
                    Bus.$emit("dispetchPageName", pageName);
                    if (this.config.changeUrl) {
                        history.pushState({}, null, item.href);
                    }
                    try {
                        _this.config.action(item.href, {
                            name: item.name,
                            icon: item.icon,
                            href: item.href
                        });
                    } catch (e) {
                        console.error(e.message);
                    }
                } else {
                    if (item.target === "_blank") {
                        window.open(item.href);
                    } else {
                        window.location.href = item.href;
                    }
                }
            }
        },
        //显示子菜单
        showSub(e, item) {
            if (item.sub) {
                let subMenu = this.$refs.sub_menu;
                let offsetTop = $(e.target).offset().top;
                let windowHeight = $(window).height();
                let subMenuHeight = item.sub.length * 55;
                if (subMenuHeight > windowHeight - offsetTop) {
                    this.styleProp = {
                        top: "auto",
                        bottom: 0
                    };
                } else {
                    this.styleProp = {
                        top: 0,
                        bottom: "auto"
                    };
                }
                item.subShow = true;
                $(e.currentTarget)
                    .find(">.gd-left-menu-text .gd-left-menu-tip")
                    .hide();
            }
        },
        //隐藏子菜单
        hideSub(e, item) {
            if (item.sub) {
                item.subShow = false;
                $(e.currentTarget)
                    .find(">.gd-left-menu-text .gd-left-menu-tip")
                    .show();
            }
        },
        //子菜单更新
        subUpdate(e) {
            this.menuData.menus[e.idx].isActive = true;
            this.menuData.menus[e.idx].subShow = false;
            Vue.set(this.menuData.menus, e.idx, this.menuData.menus[e.idx]);
            pageName = [this.menuData.menus[e.idx].name].concat(e.pageName);
            this.shrink();
            Bus.$emit("dispetchPageName", pageName);
        },
        //加载菜单
        loadMenu(data) {
            let _this = this;
            let menuData = {
                menus: data
            };
            _this.addHighlight(menuData.menus);
            menuData.menus.forEach(obj => (obj.subShow = false));
            Vue.set(_this.menuData, "menus", menuData.menus);
            Bus.$emit("dispetchPageName", pageName);
            Vue.nextTick(() => {
                if (
                    _this.config.mode === "load" ||
                    _this.config.mode === "iframe"
                ) {
                    //保持跳转地址
                    let path =
                        decodeURIComponent(gd.query("href")).split("?")[0] ||
                        location.pathname;
                    let target = "";
                    $(_this.$refs.leftMenu)
                        .find("li")
                        .each((_, el) => {
                            let href = ($(el).attr("data-href") || "").split(
                                "?"
                            )[0];
                            if (href.substr(0, 1) !== "/") {
                                href = "/" + href;
                            }
                            if (path == href) {
                                target = el;
                                return false;
                            }
                        });
                    target = target || $(_this.$refs.leftMenu).find("li:first");
                    $(target).click();
                }
                if (typeof this.config.ready === "function") {
                    this.config.ready(pageName);
                }
            });
        }
    },
    mounted() {
        let _this = this;
        if (typeof _this.config.data === "object") {
            _this.loadMenu(_this.config.data);
        } else {
            gd.get(this.config.api, function(msg) {
                if (msg.resultCode === gd.successCode) {
                    if (typeof _this.config.apiCallback === "function") {
                        msg = _this.config.apiCallback(msg);
                    }
                    _this.loadMenu(msg.data);
                } else {
                    console.error("菜单数据加载失败！");
                }
            });
        }
        //tobbar加载完成后，把页面名称传给topbar
        Bus.$on("topBarReady", e => {
            Bus.$emit("dispetchPageName", pageName);
        });
        Bus.$on("clearMenuHighlight", e => {
            this.clearHighlight(this.menuData.menus);
        });
    }
};
export function menu(name) {
    return new gdMenu(name || "");
}
function gdMenu(name) {
    this.name = name;
}
//添加红点提示
gdMenu.prototype.addTip = function() {
    let name = this.name;
    if (name instanceof Array) {
        name.forEach(n => {
            gd.menu(n).addTip();
        });
    } else if (typeof name === "string") {
        $(".gd-left-menu-text>.gd-left-menu-name").each((i, el) => {
            if (
                $(el)
                    .text()
                    .trim() === name.trim()
            ) {
                if (
                    !$(el)
                        .closest(".gd-left-menu-text")
                        .find(".gd-left-menu-tip").length
                ) {
                    $(el)
                        .parents(".gd-left-menu-text")
                        .append('<div class="gd-left-menu-tip"></div>');
                    let pEl = $(el)
                        .closest("ul")
                        .closest("li")
                        .find(">.gd-left-menu-text>.gd-left-menu-name");
                    if (pEl.length) {
                        let pName = pEl.text().trim();
                        gd.menu(pName).addTip();
                    }
                }
                return false;
            }
        });
    }
};
//移除红点提示
gdMenu.prototype.removeTip = function() {
    let name = this.name;
    $(".gd-left-menu-text>.gd-left-menu-name").each((i, el) => {
        if (
            $(el)
                .text()
                .trim() === name
        ) {
            $(el)
                .closest(".gd-left-menu-text")
                .find(".gd-left-menu-tip")
                .remove();
            return false;
        }
    });
};
</script>