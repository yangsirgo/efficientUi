<template>
    <div class="gd-recentpicker gd-recentpicker-lg" ref="pickerBody">
        <gd-select :placeholder="placeholder" v-model="selectValue" @change="selectChange" @down="selectDrop" @up="selectUp" ref="selectBody">
            <transition name="gd-datepanel-expand">
                <div class="gd-recentpicker-datepanel gd-option-custom" @mouseenter="mouseInPanel" @mouseleave="mouseOutPanel" ref="panelBody">
                    <gd-datepanel v-if="panelIsShow && !datePanelConfig.dateRange" :config="datePanelConfig" @change="dateChange" @cancel="cancel"></gd-datepanel>
                    <gd-daterangepanel v-if="panelIsShow && datePanelConfig.dateRange" :config="datePanelConfig" @change="dateChange" @cancel="cancel"></gd-daterangepanel>
                </div>
            </transition>
            <gd-option v-for="item,index in config.items" :key="index" :value="item.value" :style="{width:pickerBodyWidth+'px'}">{{item.label}}</gd-option>
            <gd-option :value="'custom'" class="gd-recentpicker-custom" @mouseenter="showDatePikcer" @mouseleave="hideDatePikcer" ref="customOption">自定义
                <i class="icon-right"></i>
            </gd-option>
        </gd-select>
    </div>
</template>
<script>
export default {
    props: ["config", "placeholder"],
    data() {
        let datePanelConfig = {
            timePicker: true,
            timeValue: ""
        };
        if (this.config.dateRange) {
            datePanelConfig.timeRange = false;
            datePanelConfig.dateRange = true;
        } else {
            datePanelConfig.timeRange = true;
        }
        this.config.value && (datePanelConfig.value = this.config.value);
        this.config.maxDate && (datePanelConfig.maxDate = this.config.maxDate);
        this.config.minDate && (datePanelConfig.minDate = this.config.minDate);
        this.config.timeValue &&
            (datePanelConfig.timeValue = this.config.timeValue);
        this.config.timeStep &&
            (datePanelConfig.timeStep = this.config.timeStep);
        datePanelConfig.timePicker = this.config.timePicker !== false;
        return {
            selectValue: "", //选定的值
            pickerBodyWidth: 0, //控件宽度
            panelIsShow: false, //显示日期面板
            datePanelConfig: datePanelConfig, //日期面板配置
            isMouseInPanel: false //鼠标在日期选择器内
        };
    },
    methods: {
        //下拉框改变
        selectChange(val) {
            this.panelIsShow = false;
            this.change(this.transRecentDate(val.value));
        },
        //鼠标进入日期选择器
        mouseInPanel() {
            this.isMouseInPanel = true;
        },
        //鼠标离开日期选择器
        mouseOutPanel() {
            this.isMouseInPanel = false;
            // this.panelIsShow = false;
        },
        //显示日期选择
        showDatePikcer(value) {
            this.panelIsShow = true;
        },
        //隐藏日期选择
        hideDatePikcer(value) {
            setTimeout(() => {
                if (!this.isMouseInPanel) {
                    this.panelIsShow = false;
                }
            }, 100);
        },
        //下拉框展开
        selectDrop() {
            this.pickerBodyWidth = $(this.$refs.pickerBody).width();
        },
        //下拉框收起
        selectUp() {
            this.panelIsShow = false;
            this.isMouseInPanel = false;
        },
        //日期改变
        dateChange(value) {
            this.$refs.selectBody.isDroped = false;
            this.$refs.selectBody.selectData = [
                {
                    value: value,
                    text: value
                }
            ];
            this.$refs.selectBody.$children.forEach(child => {
                child.isSelect = false;
            });
            this.$refs.customOption.isSelect = true;
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
            this.change(value);
        },
        //取消
        cancel() {
            this.$refs.selectBody.isDroped = false;
            this.panelIsShow = false;
        },
        //清除
        clear() {
            this.datePanelConfig.value = "";
            this.datePanelConfig.timeValue = "";
            this.panelIsShow = false;
        },
        //转换最近日期
        transRecentDate(hour) {
            let endTime = gd.newDate();
            let startTime = gd.newDate();
            startTime.setHours(startTime.getHours() - hour);
            return `${startTime.format("yyyy-MM-dd hh:mm")} ~ ${endTime.format(
                "yyyy-MM-dd hh:mm"
            )}`;
        },
        //change事件
        change(value) {
            if (typeof this.config.change === "function") {
                this.config.change(value);
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
                        this.datePanelConfig.value[0] &&
                        this.datePanelConfig.value[1]
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
                let pad = 10; //间隙
                let pickerBody = $(_this.$refs.pickerBody);
                let pickerBodyTop = pickerBody.offset().top;
                let pickerBodyLeft = pickerBody.offset().left;
                let pickerBodyHeight = pickerBody.outerHeight(true);
                let pickerBodyWidth = pickerBody.outerWidth(true);
                let pickerBodyCenter = pickerBodyLeft + pickerBodyWidth / 2;
                let panelBody = $(_this.$refs.panelBody);
                let panelBodyHeight = panelBody.outerHeight(true);
                let panelBodyWidth = panelBody.outerWidth(true);
                let selectBody = _this.$refs.selectBody;
                if (_this.panelIsShow) {
                    if (
                        pickerBodyLeft +
                            pickerBodyWidth +
                            panelBodyWidth +
                            pad >
                        window.innerWidth
                    ) {
                        selectBody.left = selectBody.left - panelBodyWidth;
                        panelBody.css("float", "left");
                    }
                } else {
                    selectBody.left = $(selectBody.$el).offset().left;
                    panelBody.css("float", "right");
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
                this.$refs.selectBody.selectData = [
                    {
                        value: this.dateStr,
                        text: this.dateStr
                    }
                ];
                if (this.dateStr) {
                    this.$refs.customOption.isSelect = true;
                } else {
                    this.$refs.customOption.isSelect = false;
                }
            },
            deep: true
        }
    },
    mounted() {
        if (this.dateStr) {
            this.$refs.selectBody.selectData = [
                {
                    value: this.dateStr,
                    text: this.dateStr
                }
            ];
            this.$refs.customOption.isSelect = true;
        }
    }
};
</script>