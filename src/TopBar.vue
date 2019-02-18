<template>
    <div class="gd-topbar">
        <div class="gd-topbar-name">
            <!-- 多级name -->
            <div class="gd-topbar-name-item" v-for="(name,index) in pageName">
                <span class="gd-topbar-name-text">{{name}}</span>
                <i class="icon-right" v-if="index !== pageName.length-1"></i>
            </div>
            <!-- 单级name -->
            <!-- <div class="gd-topbar-name-item">
                <span class="gd-topbar-name-text">{{pageName[pageName.length-1]}}</span>
            </div> -->
        </div>
        <div class="gd-topbar-toolbox">
            <slot></slot>
            <div class="gd-topbar-tool" v-for="tool in config" @click="toolAction(tool)" @mouseenter="showHoverBox($event,tool)">
                <i class="gd-topbar-tool-icon" :class=" tool.icon" :title="tool.title"></i>
                <span v-if="tool.text" class="gd-topbar-tool-text" v-text="tool.text"></span>
                <span v-if="tool.badge" class="gd-topbar-tool-badge" v-text="tool.badge"></span>
            </div>
        </div>
    </div>
</template>
<script>
import Bus from './bus.js';
export default {
    props: ['config'],
    data() {
        return {
            pageName: [] //页面标题
        };
    },
    methods: {
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
                    tool.dropItems[data.index].action && tool.dropItems[data.index].action(config);
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
        Bus.$on('dispetchPageName', msg => {
            this.pageName = msg;
            //改变浏览器标题
            if (msg.length > 0) {
                if ($('title').length == 0) {
                    $('head').append('<title>' + msg[msg.length - 1] + '</title>');
                } else {
                    $('title').text(msg[msg.length - 1]);
                }
            }
        });
        Bus.$emit('topBarReady'); //加载完成后，通知侧边栏，把页面名字传过来
    }
};
</script>