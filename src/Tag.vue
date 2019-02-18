<template>
    <div class="gd-tag-group" ref="gdTagGroup">
        <div class="gd-tag" :class="{'gd-tag-animation':tag.animation}" ref="tag" v-for="tag,index in tags" :disabled="disabled!==undefined">
            <input type="text" class="gd-input" v-focus="tag.focus" :readonly="tag.readonly!==false" v-model="tag.value" @blur="blur($event,index)" @keydown.enter="enter($event,index)" :disabled="disabled!==undefined" :gd-validate="gdValidate">
            <i class="icon-close" @click="del(index)"></i>
        </div>
        <button class="gd-btn-icon icon-add gd-tag-add" type="button" @click="add()" v-if="addBtnShow && count<maxcount" :disabled="disabled!==undefined"></button>
    </div>
</template>
<script>
let validate = '';
export default {
    props: {
        value: {},
        disabled: {},
        gdValidate: {},
        maxcount: {
            default: Number.MAX_VALUE
        }
    },
    data() {
        let tags = [];
        if (this.value instanceof Array) {
            tags = this.value.map((m, i) => {
                return { value: m };
            });
        }
        return {
            tags: tags.splice(0, this.maxcount),
            addBtnShow: true //显示添加按钮
        };
    },
    computed: {
        count() {
            return this.tags.length;
        }
    },
    model: {
        prop: 'value',
        event: 'updateModel'
    },
    methods: {
        //添加
        add() {
            this.tags.push({
                value: '',
                animation: true,
                readonly: false,
                focus: true
            });
            this.addBtnShow = false;
            this.$nextTick(() => {
                validate = gd.validate(this.$refs.gdTagGroup, {
                    focusError: false
                });
            });
        },
        //删除
        del(index) {
            this.tags.splice(index, 1);
            let tagValue = this.tags.map(m => {
                return m.value;
            });
            this.$emit('updateModel', tagValue);
            this.$emit('change', tagValue);
        },
        //回车
        enter(e) {
            $(e.currentTarget).blur();
        },
        //失去焦点
        blur(e, index) {
            let target = e.currentTarget;
            if (
                !$(target)
                    .val()
                    .trim()
            ) {
                this.tags.splice(index, 1);
            } else {
                if (validate.valid()) {
                    this.tags[index].readonly = true;
                    let tagValue = this.tags.map(m => {
                        return m.value;
                    });
                    this.$emit('updateModel', tagValue);
                    this.$emit('change', tagValue);
                }
            }
            this.addBtnShow = true;
        }
    },
    directives: {
        focus: {
            inserted: function(el, binding) {
                if (binding.value) {
                    el.focus();
                }
            }
        }
    },
    watch: {
        value() {
            let tags = [];
            if (this.value instanceof Array) {
                tags = this.value.map(m => {
                    return { value: m };
                });
            }
            this.tags = tags.splice(0, this.maxcount);
        }
    },
    mounted() {
        //添加校验
        validate = gd.validate(this.$refs.gdTagGroup, {
            focusError: false
        });
    }
};
</script>