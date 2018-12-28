<template>
    <div class="gd-toolbar">
        <div class="gd-toolbar-right-item">
            <slot name="right"></slot>
        </div>
        <span v-for="item in tools" v-if="item.type==='text'" class="gd-toolbar-text">{{item.text}}</span>
        <i v-for="item in tools" v-if="item.type==='button' && item.btnIndex<=3" class="gd-btn-icon" :disabled="item.disabled" :class="item.icon" :title="item.title" @click="btnAction($event,item)" @mouseenter="btnHover($event,item)"></i>
        <i v-for="item in tools" v-if="item.btnIndex===4 && btnCount===5" class="gd-btn-icon" :disabled="item.disabled" :class="item.icon" :title="item.title" @click="btnAction($event,item)" @mouseenter="btnHover($event,item)"></i>
        <i class="gd-btn-icon icon-more" v-if="btnCount>5" @mouseenter="showMore($event,tools)"></i>
        <div v-for="item in config" v-if="item.type==='searchbox'" class="gd-toolbar-right-item">
            <div class="gd-iconinput">
                <input type="text" :placeholder="item.placeholder" @keydown.enter="searchboxAction($event,item)">
                <i class="icon-search" @click="searchboxAction($event,item)"></i>
            </div>
        </div>
        <div class="gd-toolbar-right-item">
            <slot></slot>
            <slot name="left"></slot>
        </div>
    </div>
</template>
<script>
export default {
    props: ['config'],
    data() {
        return {};
    },
    computed: {
        //对按钮数据加工
        tools() {
            let count = 0;
            return this.config.map(item => {
                if (item.type === 'button') {
                    item.btnIndex = count;
                    count++;
                }
                return item;
            });
        },
        //按钮数量
        btnCount() {
            return this.config.filter(c => {
                return c.type === 'button';
            }).length;
        }
    },
    methods: {
        //按钮的执行动作
        btnAction(e, item) {
            !e.currentTarget.getAttribute('disabled') && item.action && item.action(e);
        },
        //按钮的Hover
        btnHover(e, item) {
            !e.currentTarget.getAttribute('disabled') && item.hover && item.hover(e);
        },
        //显示更多操作
        showMore(e, config) {
            let _this = this;
            gd.showHoverBox({
                el: e.currentTarget,
                position: 'right',
                //点击的时候触发
                onClick: function(data) {
                    config[data.index].action && config[data.index].action();
                },
                items: $.map(config, (c, i) => {
                    if (c.btnIndex >= 4 && c.type == 'button') {
                        return {
                            text: c.title,
                            icon: c.icon,
                            index: i
                        };
                    }
                })
            });
        },
        //搜索框动作
        searchboxAction(e, item) {
            let val = $(e.currentTarget)
                .closest('.gd-iconinput')
                .find('input')
                .val()
                .trim();
            item.action && item.action(val);
        }
    }
};
</script>