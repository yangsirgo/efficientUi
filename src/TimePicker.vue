<template>
    <div class="gd-timepicker" ref="pickerBody" @click.stop="">
        <div class="gd-iconinput">
            <input type="text" class="gd-input" v-model="valueStr" readonly @click.stop="toggleRuler()">
            <i class="icon-time" v-if="!valueStr"></i>
            <i class="icon-close" v-if="valueStr" title="清除" @click="clear()"></i>
        </div>
        <transition name="gd-timeruler-drop">
            <gd-timeruler v-if="rulerIsShow" :class="{'gd-timeruler-drop-top':!isBottom}" :style="{left:rulerBodyLeft+'px',top:rulerBodyTop+'px'}" :config="timeRulerConfig" @change="change" ref="rulerBody"></gd-timeruler>
        </transition>
    </div>
</template>
<script>
let timePickerApps = [];
export default {
    props: ["config"],
    data() {
        return {
            value: this.config.value || "", //时间值
            rulerBodyLeft: 0, //标尺左边位置
            rulerBodyTop: 0, //标尺右边位置
            isBottom: true, //是否显示在输入框下面
            rulerIsShow: false, //显示标尺
            timeRulerConfig: this.config //时间标尺配置
        };
    },
    methods: {
        //弹出与收起标尺
        toggleRuler() {
            if (!this.rulerIsShow) {
                timePickerApps.forEach(function(t) {
                    t.rulerIsShow = false;
                });
                this.rulerIsShow = true;
            } else {
                this.rulerIsShow = false;
            }
        },
        //改变事件
        change(value) {
            this.value = this.config.value = value;
        },
        //清除
        clear() {
            this.value = this.config.value = "";
            if (typeof this.config.change === "function") {
                this.config.change(this.value);
            }
        }
    },
    computed: {
        valueStr() {
            if (this.config.range) {
                if (this.value[0] && this.value[1]) {
                    return this.value.join("~");
                } else {
                    return "";
                }
            } else {
                return this.value;
            }
        }
    },
    watch: {
        //标尺展示，进行定位
        rulerIsShow() {
            let _this = this;
            _this.isBottom = true;
            this.$nextTick(() => {
                if (_this.rulerIsShow) {
                    let pad = 10; //间隙
                    let pickerBody = $(_this.$refs.pickerBody);
                    let pickerBodyTop = pickerBody.offset().top;
                    let pickerBodyLeft = pickerBody.offset().left;
                    let pickerBodyHeight = pickerBody.outerHeight(true);
                    let pickerBodyWidth = pickerBody.outerWidth(true);
                    let pickerBodyCenter = pickerBodyLeft + pickerBodyWidth / 2;
                    let rulerBody = $(_this.$refs.rulerBody.$el);
                    let rulerBodyHeight = rulerBody.outerHeight(true);
                    let rulerBodyWidth = rulerBody.outerWidth(true);
                    let leftPad = $(".gd-left-menu").length
                        ? $(".gd-left-menu").outerWidth(true) + pad
                        : pad;
                    rulerBody.css("z-index", gd.getMaxZIndex() + 1);
                    //上下定位
                    if (
                        window.innerHeight <
                        pickerBodyTop + pickerBodyHeight + pad + rulerBodyHeight
                    ) {
                        _this.isBottom = false;
                    }
                    if (_this.isBottom) {
                        this.rulerBodyTop =
                            pickerBodyTop + pickerBodyHeight + pad;
                    } else {
                        this.rulerBodyTop =
                            pickerBodyTop - pad - rulerBodyHeight;
                    }
                    //左右定位
                    if (pickerBodyCenter - rulerBodyWidth / 2 < leftPad) {
                        this.rulerBodyLeft = leftPad;
                    } else if (
                        pickerBodyCenter + rulerBodyWidth / 2 + pad >
                        window.innerWidth
                    ) {
                        this.rulerBodyLeft =
                            window.innerWidth - pad - rulerBodyWidth;
                    } else {
                        this.rulerBodyLeft =
                            pickerBodyCenter - rulerBodyWidth / 2;
                    }
                }
            });
        },
        //外部改变value
        "config.value"(val) {
            this.value = val;
        }
    },
    mounted() {
        timePickerApps.push(this);
        //窗口缩放收起
        $(window).resize(e => {
            this.rulerIsShow = false;
        });
        //父元素滚动收起
        $(this.$refs.pickerBody)
            .parents()
            .scroll(e => {
                this.rulerIsShow = false;
            });
        //点击空白处收起
        $("body").click(e => {
            this.rulerIsShow = false;
        });
    }
};
</script>