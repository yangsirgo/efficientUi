<template>
    <div class="gd-datepicker" :class="{'gd-datepicker-lg':config.dateRange || config.timePicker && config.timeRange}" ref="pickerBody" @click.stop="">
        <div class="gd-iconinput">
            <input type="text" class="gd-input" v-model="dateStr" readonly @click.stop="togglePanel()">
            <i class="icon-time" v-if="!dateStr"></i>
            <i class="icon-close" v-if="dateStr" title="清除" @click="clear()"></i>
        </div>
        <transition name="gd-datepanel-drop">
            <gd-datepanel v-if="panelIsShow && !config.dateRange" :class="{'gd-datepanel-drop-top':!isBottom}" :style="{left:panelBodyLeft+'px',top:panelBodyTop+'px'}" :config="datePanelConfig" @change="change" @cancel="cancel" ref="panelBody"></gd-datepanel>
            <gd-daterangepanel v-if="panelIsShow && config.dateRange" :class="{'gd-datepanel-drop-top':!isBottom}" :style="{left:panelBodyLeft+'px',top:panelBodyTop+'px'}" :config="datePanelConfig" @change="change" @cancel="cancel" ref="rangePanelBody"></gd-daterangepanel>
        </transition>
    </div>
</template>
<script>
export default {
    props: ["config"],
    data() {
        if (this.config.timePicker) {
            this.config.timeValue = this.config.timeValue || "";
        }
        if (this.config.value == undefined) {
            this.config.value = "";
        }
        return {
            panelBodyLeft: 0, //面板左边位置
            panelBodyTop: 0, //面板右边位置
            isBottom: true, //是否显示在输入框下面
            panelIsShow: false, //显示面板
            datePanelConfig: $.extend({}, this.config) //时间面板配置
        };
    },
    methods: {
        //弹出与收起面板
        togglePanel() {
            this.panelIsShow = !this.panelIsShow;
        },
        //改变事件
        change(value) {
            this.panelIsShow = false;
            if (this.datePanelConfig.dateRange) {
                this.datePanelConfig.value = value.split(" ~ ");
            } else if (this.datePanelConfig.timePicker) {
                if (this.datePanelConfig.timeRange) {
                    let startDate = gd.newDate(value.split("~")[0]);
                    let endDate = gd.newDate(value.split("~")[1]);
                    this.datePanelConfig.value = startDate.format();
                    this.datePanelConfig.timeValue = [
                        startDate.format("hh:mm"),
                        endDate.format("hh:mm")
                    ];
                } else {
                    let date = gd.newDate(value);
                    this.datePanelConfig.value = date.format();
                    this.datePanelConfig.timeValue = date.format("hh:mm");
                }
            } else {
                let date = gd.newDate(value);
                this.datePanelConfig.value = date.format();
            }
        },
        //取消
        cancel() {
            this.panelIsShow = false;
        },
        //清除
        clear() {
            this.datePanelConfig.value = "";
            this.datePanelConfig.timeValue = "";
            this.panelIsShow = false;
            if (typeof this.config.change === "function") {
                typeof this.config.change(this.datePanelConfig.value);
            }
        }
    },
    computed: {
        //日期字符串
        dateStr() {
            let str = "";
            if (this.datePanelConfig.value) {
                if (this.datePanelConfig.dateRange) {
                    if (
                        this.datePanelConfig.value &&
                        this.datePanelConfig.value[
                            0 && this.datePanelConfig.value[1]
                        ]
                    ) {
                        str += this.datePanelConfig.value.join(" ~ ");
                    }
                } else {
                    str += this.datePanelConfig.value;
                    if (this.datePanelConfig.timePicker) {
                        if (this.datePanelConfig.timeRange) {
                            if (
                                $.isArray(this.datePanelConfig.timeValue) &&
                                this.datePanelConfig.timeValue.length == 2
                            ) {
                                str +=
                                    " " +
                                    this.datePanelConfig.timeValue[0] +
                                    " ~ " +
                                    str +
                                    " " +
                                    this.datePanelConfig.timeValue[1];
                            }
                        } else {
                            if (this.datePanelConfig.timeValue) {
                                str += " " + this.datePanelConfig.timeValue;
                            }
                        }
                    }
                }
            }
            return str;
        },
        //日期范围是否有效
        dateAvalible() {
            return (
                gd.isDate(gd.newDate(this.dateRangeStart)) &&
                gd.isDate(gd.newDate(this.dateRangeEnd))
            );
        }
    },
    watch: {
        //面板展示，进行定位
        panelIsShow() {
            let _this = this;
            _this.isBottom = true;
            this.$nextTick(() => {
                if (_this.panelIsShow) {
                    let pad = 10; //间隙
                    let pickerBody = $(_this.$refs.pickerBody);
                    let pickerBodyTop = pickerBody.offset().top;
                    let pickerBodyLeft = pickerBody.offset().left;
                    let pickerBodyHeight = pickerBody.outerHeight(true);
                    let pickerBodyWidth = pickerBody.outerWidth(true);
                    let pickerBodyCenter = pickerBodyLeft + pickerBodyWidth / 2;
                    let panelBody = _this.config.dateRange
                        ? $(_this.$refs.rangePanelBody.$el)
                        : $(_this.$refs.panelBody.$el);
                    let panelBodyHeight = panelBody.outerHeight(true);
                    let panelBodyWidth = panelBody.outerWidth(true);
                    let leftPad = $(".gd-left-menu").length
                        ? $(".gd-left-menu").outerWidth(true) + pad
                        : pad;
                    panelBody.css("z-index", gd.getMaxZIndex() + 1);
                    //上下定位
                    if (
                        window.innerHeight <
                        pickerBodyTop + pickerBodyHeight + pad + panelBodyHeight
                    ) {
                        _this.isBottom = false;
                    }
                    if (pickerBodyTop - pad - panelBodyHeight < 0) {
                        _this.isBottom = true;
                    }
                    if (_this.isBottom) {
                        this.panelBodyTop =
                            pickerBodyTop + pickerBodyHeight + pad;
                    } else {
                        this.panelBodyTop =
                            pickerBodyTop - pad - panelBodyHeight;
                    }
                    //左右定位
                    if (pickerBodyCenter - panelBodyWidth / 2 < leftPad) {
                        this.panelBodyLeft = leftPad;
                    } else if (
                        pickerBodyCenter + panelBodyWidth / 2 + pad >
                        window.innerWidth
                    ) {
                        this.panelBodyLeft =
                            window.innerWidth - pad - panelBodyWidth;
                    } else {
                        this.panelBodyLeft =
                            pickerBodyCenter - panelBodyWidth / 2;
                    }
                }
            });
        },
        config: {
            handler: function(val, oldVal) {
                if (this.config.value == undefined) {
                    this.config.value = "";
                }
                if (this.config.timeValue == undefined) {
                    this.config.timeValue = "";
                }
                this.datePanelConfig.value = this.config.value;
                this.datePanelConfig.timeValue = this.config.timeValue;
            },
            deep: true
        }
    },
    mounted() {
        //窗口缩放收起
        $(window).resize(e => {
            this.panelIsShow = false;
        });
        //父元素滚动收起
        $(this.$refs.pickerBody)
            .parents()
            .scroll(e => {
                this.panelIsShow = false;
            });
        //点击空白处收起
        $("body").click(e => {
            this.panelIsShow = false;
        });
    }
};
</script>