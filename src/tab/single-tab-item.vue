<template>
    <label :class="labelCls">
        <input type="radio"
               :name="groupName"
               value="value"
               @change="change"
               :checked="currentValue"
               :disabled="disabled">
        <span>{{label}}</span>
    </label>
</template>
<script>
    import {oneOf} from "../utils/assist"

    export default {
        props : {
            label: {
                type: [String, Number]
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data(){
            return {
                value:false,
                currentValue: this.value,
                parent: this.$parent,
                index : 0
            };
        },
        mounted(){
            this.parent.updateValue();
        },
        computed:{
            groupName(){
                return this.parent.name;
            },
            labelCls(){
                return [`${this.parent.size}`]
            }
        },
        methods:{
            change (event){
                if (this.disabled) {
                    return false;
                }
                const checked = event.target.checked;
                this.currentValue = checked;
                if (this.label !== undefined) {
                    this.$parent.change({
                        value: this.label,
                        checked: checked,
                        checkedIndex: this.index
                    });
                    this.$emit('change', this.value);
                }

            }
        }
    }
</script>

<style>

</style>