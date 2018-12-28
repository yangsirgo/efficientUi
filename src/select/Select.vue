<template>
    <div class="gd-select" @clickss.stop="" ref="selectBody">
        <div class="gd-select-input" @click="toggleDropShow()">
            <!-- 自定义模式 -->
            <input v-if="isCustom" type="text" class="gd-input" :placeholder="placeholder" readonly v-model="selectValue" :name="name" :disabled="disabled" :gd-validate="gdValidate" ref="selectInput">
            <!-- 标准模式 -->
            <template v-else>
                <input type="text" class="gd-input" :placeholder="placeholder" readonly v-model="selectText" :disabled="disabled" :gd-validate="gdValidate" ref="selectInput">
                <input type="hidden" readonly v-model="selectValue" :name="name">
            </template>
            <i class="icon-down" v-if="!readonly"></i>
        </div>
        <transition name="gd-drop">
            <div class="gd-select-drop" :class="{'gd-select-drop-top':!isBottom}" v-show="isDroped" :style="{'z-index':zIndex,'min-width':width+'px','top':top+'px','left':left+'px'}" ref="dropBody">
                <slot></slot>
            </div>
        </transition>
    </div>
</template>
<script>
var app = [];
export default {
    props: [
        'placeholder', //placeholder
        'value', //初始值
        'name', //jquery取值时的name
        'disabled', //是否禁用
        'readonly', //是否只读
        'checkbox', //是否带有复选框
        'gdValidate' //较验规则
    ],
    model: {
        prop: 'value', //select值
        event: 'updateModel'
    },
    data() {
        return {
            selectData: [], //下拉框的数据
            isDroped: false, //下拉面板是否显示
            zIndex: gd.getMaxZIndex() + 1, //设置zindex
            isBottom: true, //是否在下面显示
            isCustom: false, //是否是自定义内容
            width: 200,
            top: 200,
            left: 200
        };
    },
    computed: {
        selectText: {
            // getter
            get: function() {
                return this.selectData
                    .map(s => {
                        return s.text;
                    })
                    .join(';');
            },
            // setter
            set: function(newValue) {}
        },

        //下拉框值
        selectValue() {
            return this.selectData
                .map(s => {
                    return s.value;
                })
                .join(';');
        }
    },
    methods: {
        //选项被改变
        change() {
            if (this.checkbox === undefined) {
                this.$children.forEach(child => {
                    if (this.selectData.length > 0 && this.selectData[0].value == child.value) {
                        child.isSelect = true;
                    } else {
                        child.isSelect = false;
                    }
                });
                this.isDroped = false;
            }
            $(this.$refs.selectInput).removeClass('gd-input-error');
            this.$emit('updateModel', this.selectValue);
            this.$emit('change', { value: this.selectValue, text: this.selectText });
        },
        //更新model
        updateModelx() {},
        //切换下拉面板的显示与藏
        toggleDropShow() {
            if (!this.$refs.selectInput.disabled && !this.readonly) {
                let _this = this;
                this.isDroped = !this.isDroped;
                if (this.isDroped) {
                    this.isBottom = true;
                    this.$nextTick(() => {
                        let selectBody = $(_this.$refs.selectBody);
                        let pad = 5;
                        _this.width = selectBody.width();
                        _this.left = selectBody.offset().left;
                        _this.top = selectBody.offset().top + selectBody.height() + pad;
                        if (window.innerHeight < _this.top + $(_this.$refs.dropBody).outerHeight() + 10) {
                            _this.top = selectBody.offset().top - $(_this.$refs.dropBody).outerHeight() - pad;
                            _this.isBottom = false;
                        }
                        if (_this.top < 0) {
                            _this.top = selectBody.offset().top + selectBody.height() + pad;
                            _this.isBottom = true;
                        }
                        this.zIndex = gd.getMaxZIndex() + 1;
                    });
                }
            }
        }
    },
    watch: {
        value() {
            //外部修改值后,改变selectData
            if (this.isCustom) {
                this.selectData = [
                    {
                        value: this.value,
                        text: this.value
                    }
                ];
            } else {
                this.selectData = [];
                let selectValues = ((this.value || '') + '').split(';');
                this.$children.forEach(child => {
                    if (selectValues.indexOf(child.value + '') > -1) {
                        this.selectData.push({
                            value: child.value,
                            text: child.text
                        });
                        child.isSelect = true;
                    } else {
                        child.isSelect = false;
                    }
                });
            }
            if (this.checkbox === undefined && !this.isCustom) {
                this.isDroped = false;
            }
        },
        //监听下拉
        isDroped(val) {
            if (val) {
                this.$emit('down');
            } else {
                this.$emit('up');
            }
        }
    },
    mounted() {
        //检测是否是自定义内容
        this.isCustom = $(this.$refs.dropBody).find('>*:not(.gd-option,.gd-option-custom)').length > 0;
        if (this.isCustom) {
            this.selectData = [
                {
                    value: this.value || '',
                    text: this.value || ''
                }
            ];
        }
        //窗口缩放收起
        $(window).resize(e => {
            this.isDroped = false;
        });
        //父元素滚动收起
        $(this.$refs.selectBody)
            .parents()
            .scroll(e => {
                this.isDroped = false;
            });
        //点击空白处收起
        $('body').click(e => {
            if ($(this.$refs.selectBody).find(e.target).length == 0) {
                this.isDroped = false;
            }
        });
    }
};
</script>