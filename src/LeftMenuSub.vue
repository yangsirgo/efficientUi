<template>
    <ul class="gd-left-menu-sub" :style="styleProp" ref="sub_menu">
        <li class="gd-left-menu-item" v-for="subItem,index in data" @mouseenter="showSub($event,index)" @mouseleave="hideSub($event,index)" @click="goPage(index)" :data-href="subItem.href">
            <span class="gd-left-menu-text" :class="{'gd-active':subItem.isActive}">
                <span class="gd-left-menu-name">{{subItem.name}}</span>
                <i class="gd-left-menu-next icon-right" v-if="subItem.sub&&subItem.sub.length"></i>
            </span>
            <transition name="fade">
                <gd-leftmenu-sub :data="subItem.sub" :styleProp="subStyle" :action="action" :mode="mode" :changeUrl="changeUrl" :idx="index" v-show="subItem.subShow" @subUpdate="subUpdate" transiton="fade">
                </gd-leftmenu-sub>
            </transition>
        </li>
    </ul>
</template>
<script>
import Bus from './bus.js';
export default {
    props: ['data', 'mode', 'action', 'changeUrl', 'styleProp', 'idx'],
    data() {
        return {
            subStyle: {
                top: 0,
                bottom: 'auto'
            }
        };
    },
    methods: {
        //显示子菜单
        showSub(e, index) {
            if (this.data[index].sub) {
                let subMenu = this.$refs.sub_menu;
                let offsetTop = $(e.target).offset().top;
                let windowHeight = $(window).height();
                let subMenuHeight = this.data[index].sub.length * 55;
                if (subMenuHeight > windowHeight - offsetTop) {
                    this.subStyle = {
                        top: 'auto',
                        bottom: 0
                    };
                } else {
                    this.subStyle = {
                        top: 0,
                        bottom: 'auto'
                    };
                }
                this.data[index].subShow = true;
                Vue.set(this.data, index, this.data[index]);
                $(e.currentTarget)
                    .find('>.gd-left-menu-text .gd-left-menu-tip')
                    .hide();
            }
        },
        //隐藏子菜单
        hideSub(e, index) {
            if (this.data[index].sub) {
                this.data[index].subShow = false;
                Vue.set(this.data, index, this.data[index]);
                $(e.currentTarget)
                    .find('>.gd-left-menu-text .gd-left-menu-tip')
                    .show();
            }
        },
        //跳页
        goPage(index) {
            let _this = this;
            if (_this.data[index].href) {
                if (this.mode === 'load') {
                    $.get(_this.data[index].href, function(data) {
                        Bus.$emit('clearMenuHighlight');
                        _this.data[index].isActive = true;
                        _this.$emit('subUpdate', {
                            idx: _this.idx,
                            pageName: [_this.data[index].name]
                        });
                        if (_this.changeUrl) {
                            history.pushState({}, null, _this.data[index].href);
                        }
                        try {
                            _this.action(data, {
                                name: _this.data[index].name,
                                icon: _this.data[index].icon,
                                href: _this.data[index].href
                            });
                        } catch (e) {
                            console.error(e.message);
                        }
                    });
                } else if (this.mode === 'iframe') {
                    Bus.$emit('clearMenuHighlight');
                    _this.data[index].isActive = true;
                    _this.$emit('subUpdate', {
                        idx: _this.idx,
                        pageName: [_this.data[index].name]
                    });
                    if (_this.changeUrl) {
                        history.pushState({}, null, _this.data[index].href);
                    }
                    try {
                        _this.action(_this.data[index].href, {
                            name: _this.data[index].name,
                            icon: _this.data[index].icon,
                            href: _this.data[index].href
                        });
                    } catch (e) {
                        console.error(e.message);
                    }
                } else {
                    if (_this.data[index].target === '_blank') {
                        window.open(_this.data[index].href);
                    } else {
                        window.location.href = _this.data[index].href;
                    }
                }
            }
        },
        //子菜单更新
        subUpdate(e) {
            this.data[e.idx].isActive = true;
            this.data[e.idx].subShow = false;
            Vue.set(this.data, e.idx, this.data[e.idx]);
            this.$emit('subUpdate', {
                idx: this.idx,
                pageName: [this.data[e.idx].name].concat(e.pageName)
            });
        }
    },
    mounted() {
        if (this.data) {
            this.data.forEach(obj => (obj.subShow = false));
        }
    }
};
</script>