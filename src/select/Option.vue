<template>
    <div class="gd-option" :class="{'gd-active':isActive}" @click="optionSelect($event)" @mouseenter="optionEnter(value)" @mouseleave="optionLeave(value)" ref="option">
        <label class="gd-checkbox" v-if="checkbox">
            <input type="checkbox" v-model="isSelect" @change="optionChange()">
            <i></i>
            <slot></slot>
        </label>
        <slot v-else></slot>
    </div>
</template>
<script>
export default {
    props: ['value','autocompleteText'],
    data() {
        return {
            text: '', //option的文本
            checkbox: false, //是否有复选框
            isSelect: false //是否被选中
        };
    },
    computed:{
        isActive(){
            return this.isSelect&&!this.checkbox;
        }
    },
    methods: {
        //option被点击
        optionSelect(e) {
            if (!this.checkbox && !$(e.currentTarget).is('.gd-recentpicker-custom')) {
                if (this.isSelect) {
                    this.$parent.isDroped = false;
                } else {
                    this.isSelect = true;
                    this.$parent.selectData = [
                        {
                            value: this.value,
                            text: this.text
                        }
                    ];
                    this.$parent.change(e);
                }
            }
        },
        //选项进入
        optionEnter(value) {
            this.$emit('mouseenter', value);
        },
        //选项移出
        optionLeave(value) {
            this.$emit('mouseleave', value);
        },
        //option checkbox改变
        optionChange() {
            let _this = this;
            if (this.isSelect) {
                this.$parent.selectData.push({
                    value: this.value,
                    text: this.text
                });
            } else {
                let index = -1;
                $.each(this.$parent.selectData, (i, o) => {
                    if (o.value == _this.value) {
                        index = i;
                        return false;
                    }
                });
                if (index > -1) {
                    this.$parent.selectData.splice(index, 1);
                }
            }
            this.$parent.change();
        }
    },
    watch:{
        autocompleteText(){
            //如果是自动完成的子option,this.text 需要与autocompleteText 保持一致
            if(this.autocompleteText != undefined && this.$parent.$refs.autocompleteBody != undefined) {
                this.text = this.autocompleteText;
            }
        }
    },
    mounted() {
        if(this.autocompleteText != undefined && this.$parent.$refs.autocompleteBody != undefined) {//
            this.text = this.autocompleteText;
        } else {
            //取option文本
            this.text = $(this.$refs.option)
                .text()
                .trim();
        }
        //是否有复选框
        this.checkbox = this.$parent.checkbox === undefined ? false : true;
        //是否被选中
        let selectValues = ((this.$parent.value || '') + '').split(';');
        this.isSelect = selectValues.indexOf(this.value + '') > -1;
        //选中就传给父元素
        if (this.isSelect) {
            this.$parent.selectData.push({
                value: this.value + '',
                text: this.text
            });
        }
    }
};
</script>