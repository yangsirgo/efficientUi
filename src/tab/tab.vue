<template>
    <div :class="classes">
        <ul class="gd-tab-bar">
            <li :class="tabCls(item)" v-for="(item,index) in navList" @click="handleChange(index)">
                <span>{{item.label}}</span>
            </li>
        </ul>
        <div class="gd-tab-content" ref="scrollBox">
            <!--这里的slot就是嵌套的pane组件的内容-->
            <slot></slot>
        </div>
    </div>
</template>
<script>
const prefixCls = 'gd-tab';

export default {
    props: {
        value: {
            type: [String, Number],
            default: 0
        },
        vertical: {
            type: Boolean,
            default: false
        },
        scroll: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            //将pane的标题保存到数组中
            navList: [],
            //保存父组件的value到currentValue变量中，以便在本地维护
            currentValue: this.value
        };
    },
    methods: {
        //使用$children遍历子组件，得到所有的pane组件
        getTabs() {
            return this.$children.filter(function(item) {
                return item.$options.name === 'gd-tab-item';
            });
        },
        //更新tabs
        updateNav() {
            this.navList = [];
            var _this = this;
            this.getTabs().forEach(function(pane, index) {
                _this.navList.push({
                    label: pane.label,
                    name: pane.name || index
                });
                //如果没有设置name，默认设置为索引值
                if (!pane.name) {
                    pane.name = index;
                }
                //设置第一个pane为当前显示的tab
                if (index === 0) {
                    if (!_this.currentValue) {
                        _this.currentValue = pane.name || index;
                    }
                }
            });
            this.updateStatus();
        },
        updateStatus() {
            var tabs = this.getTabs();
            var _this = this;
            if (_this.scroll && !_this.vertical) {
                //scroll模式下
                tabs.forEach(function(tab, index) {
                    if (tab.name === _this.currentValue) {
                        _this.scrollAnimate(index);
                    }
                });
            } else {
                //显示当前选中的tab对应的pane组件，隐藏没有选中的
                tabs.forEach(function(tab) {
                    return (tab.show = tab.name === _this.currentValue);
                });
            }
        },
        tabCls(item) {
            return [
                'gd-tab-li',
                {
                    //为当前选中的tab加一个tabs-tab-active class
                    'gd-tab-li-active': item.name === this.currentValue
                }
            ];
        },
        //点击tab标题触发
        handleChange(index) {
            var _t = this,
                nav = _t.navList[index],
                name = nav.name;

            if (_t.scroll && !_t.vertical) {
                //scroll模式下
                _t.scrollAnimate(index);
            } else {
                //改变当前选中的tab，触发watch
                _t.currentValue = name;
                //实现子组件与父组件通信
                _t.$emit('change', { label: nav.label, index: nav.name });
            }
        },
        scrollAnimate(index) {
            var _t = this,
                $scrollBox = $(_t.$refs.scrollBox),
                boxHeight = 0;
            for (var i = 0; i < index; i++) {
                boxHeight += $scrollBox
                    .find('.gd-tab-item')
                    .eq(i)
                    .height();
            }
            $scrollBox.animate({ scrollTop: boxHeight }, 300);
        },
        handleScroll($sBox, $sLi, $sPane) {
            var _t = this;
            $sLi.each(function(e) {
                var boxHeight = 0;
                for (var i = 0; i < e; i++) {
                    boxHeight += $sPane.eq(i).height();
                }
                var boxscrllTop = $sBox.scrollTop();
                if (boxscrllTop >= boxHeight) {
                    $sLi.removeClass('gd-tab-li-active');
                    $sLi.eq(e).addClass('gd-tab-li-active');
                }
            });
        }
    },
    mounted() {
        var _t = this;
        if (_t.scroll && !_t.vertical) {
            _t.$nextTick(() => {
                //挂载scroll事件
                var $sBox = $(_t.$refs.scrollBox),
                    $sLi = $sBox.prev().find('li'),
                    $sPane = $sBox.find('.gd-tab-item');

                $sPane.eq($sPane.length - 1).css({
                    //最后pane的高度与父box一致
                    height: $sBox.height() + 'px'
                });

                $sBox.scroll(() => {
                    _t.handleScroll($sBox, $sLi, $sPane);
                });
            });
        }
    },
    computed: {
        classes() {
            return [
                {
                    [`${prefixCls}-vertical`]: this.vertical && !this.scroll,
                    [`${prefixCls}-scroll`]: this.scroll && !this.vertical,
                    [`${prefixCls}-horizontal`]: !this.vertical && !this.scroll
                }
            ];
        }
    },
    watch: {
        value(val) {
            this.currentValue = val;
        },
        currentValue() {
            //tab发生变化时，更新pane的显示状态
            this.updateStatus();
        }
    }
};
</script>

<style>
</style>