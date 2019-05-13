<template>
    <div class="gd-topmenu" ref="topMenu">
        <div class="gd-topmenu-left">
            <div class="gd-topmenu-texture" v-for="_ in 6"></div>
            <div class="gd-topmenu-item" @click="menuClick($event,item)" v-for="item in leftData" :class="{'active':item.active}">
                <a :href="item.href||'javascript:'" v-html="item.name"></a>
                <div class="gd-topmenu-item-drop" v-if="item.sub && item.sub.length>0">
                    <div class="gd-topmenu-item-sub" @click.stop="menuClick($event,item,sub)" v-for="sub in item.sub" :class="{'active':sub.active}">
                        <a :href="sub.href||'javascript:'" v-html="sub.name"></a>
                    </div>
                </div>
            </div>
        </div>
        <div class="gd-topmenu-right">
            <div class="gd-topmenu-item" @click="menuClick($event,item)" v-for="item in rightData" :class="{'active':item.active}">
                <a :href="item.href||'javascript:'" v-html="item.name"></a>
                <div class="gd-topmenu-item-drop" v-if="item.sub && item.sub.length>0">
                    <div class="gd-topmenu-item-sub" @click.stop="menuClick($event,item,sub)" v-for="sub in item.sub" :class="{'active':sub.active}">
                        <a :href="sub.href||'javascript:'" v-html="sub.name"></a>
                    </div>
                </div>
            </div>
            <div class="gd-topmenu-texture" v-for="_ in 6"></div>
        </div>
        <div class="gd-topbar-toolbox">
            <div class="gd-topbar-tool" v-for="tool in config.topMenuLeftCoinArr" @click="toolAction(tool)" @mouseenter="showHoverBox($event,tool)">
                <i class="gd-topbar-tool-icon" :class="tool.icon" :title="tool.title"></i>
                <span v-if="tool.text" class="gd-topbar-tool-text" v-text="tool.text"></span>
                <span v-if="tool.badge" class="gd-topbar-tool-badge" v-text="tool.badge"></span>
            </div>
        </div>
        <div class="gd-topmenu-title">
            <div class="gd-topmenu-title-text" v-html="config.title"></div>
        </div>

    </div>
</template>
<script>
import Bus from "./bus.js";
export default {
    props: ["config"],
    data() {
        return {};
    },
    computed: {
        leftData() {
            let end = Math.ceil(this.config.menus.length / 2);
            let menus = [];
            for (let i = 0; i < end; i++) {
                menus.push(this.config.menus[i]);
            }
            return menus;
        },
        rightData() {
            let start = Math.ceil(this.config.menus.length / 2);
            let menus = [];
            for (let i = start; i < this.config.menus.length; i++) {
                menus.push(this.config.menus[i]);
            }
            return menus;
        }
    },
    methods: {
        //菜单点击
        menuClick(e, item, sub) {
            // this.config.menus.forEach(m => {
            //     Vue.set(m, "active", false);
            //     if (m.sub) {
            //         m.sub.forEach(s => {
            //             Vue.set(s, "active", false);
            //         });
            //     }
            // });
            // Vue.set(item, "active", true);
            // sub && Vue.set(sub, "active", true);
            // let topMenuName = [item.name];
            if (sub) {
                // topMenuName.push(sub.name);
                sub.action && sub.action(gd.clone(sub));
            } else {
                item.action && item.action(gd.clone(item));
            }
            // Bus.$emit("dispetchTopMenuName", topMenuName);
        },
        //按钮的执行动作
        toolAction(tool) {
            tool.action && tool.action(gd.clone(tool));
        },
        //显示下拉框
        showHoverBox(e, tool) {
            if (tool.dropItems === undefined || tool.dropItems.length === 0) {
                return;
            }
            let _this = this;
            gd.showHoverBox({
                el: e.currentTarget,
                //点击的时候触发
                onClick: function(data) {
                    let config = gd.clone(tool.dropItems[data.index]);
                    tool.dropItems[data.index].action &&
                        tool.dropItems[data.index].action(config);
                },
                items: $.map(tool.dropItems, (d, i) => {
                    return {
                        text: d.text,
                        icon: d.icon,
                        index: i
                    };
                })
            });
        }
    },
    mounted() {
        let _this = this;
        Bus.$on("topBarReady", e => {
            let topMenuName = [];
            $.each(_this.config.menus, (_, m) => {
                if (m.active) {
                    topMenuName.push(m.name);
                    if (m.sub) {
                        $.each(m.sub, (_, s) => {
                            if (s.active) {
                                topMenuName.push(s.name);
                                return false;
                            }
                        });
                    }
                    return false;
                }
            });
            Bus.$emit("dispetchTopMenuName", topMenuName);
        });
    }
};
</script>