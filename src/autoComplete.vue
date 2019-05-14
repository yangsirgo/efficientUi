<template>
    <div  :id="id" ref="autocompleteBody" class="gd-select">
        <div class="gd-iconinput" ref="inputBody">
            <input type="text"
                   v-model="config.value"
                   :placeholder="config.placeholder"
                   :disabled="config.disabled"
                   :class="inputCls"
                   @keyup="keyUpHandler($event)"
                   @click="focusHandler($event)">
            <i :class="inputIcon" @click="clearFunc"></i>
        </div>
        <transition name="gd-drop">
            <div class="gd-select-drop" :class="{'gd-select-drop-top':placement != 'bottom'}" v-show="isDroped" :style="positionStyle" ref="dropBody">
                <slot>
                    <Option v-for="(item,index) in config.data" :autocomplete-text="item">{{item}}</Option>
                </slot>
            </div>
        </transition>
    </div>

</template>

<script>
    let closeIcon = 'icon-close';
    //下拉框选项
    import Option from './select/Option.vue';

    export default {
        name: "autoComplete",
        props:['config'],
        data(){
            var propsData = this.config;
            return {
                icon:propsData.icon,
                id:propsData.id || 'autoComplete' + (+new Date()),
                size:propsData.size || '',
                placement:propsData.placement || 'bottom',
                onSearch:propsData.onSearch,
                onSelect:propsData.onSelect,
                inputEnter:propsData.inputEnter,
                clearable:propsData.clearable || false,
                activeIndex:-1,//activeIndex 选中下拉的索引
                childVueList:[],
                isDroped:false,
                selectData:[],
                positionStyle:{
                    'z-index':1,
                    'top':0,
                    'left':0,
                    'min-width':'200px'
                }
            }
        },
        methods:{
            keyUpHandler(e){
                var flag = e.target.isNeedPrevent;
                if(flag)  return;

                let query = this.config.value;
                let _this = this;
                this.isDroped = true;
                _this.childVueList.forEach((child,index)=>{
                     child.isSelect = false;
                });
                if(this.isDroped) {
                    e.preventDefault();
                    this.setDropPosition();
                    if(e) {//
                        let eventKeyCode = e.keyCode;
                        switch (eventKeyCode) {
                            case 38://up
                                this.activeIndex --;
                                this.activeIndex = this.activeIndex < -1 ? this.childVueList.length-1 : this.activeIndex;
                                this.$nextTick(() => {
                                    _this.childVueList.forEach((child,index)=>{
                                        if(index === _this.activeIndex) {
                                            child.isSelect = true;
                                            this.config.value = child.text;
                                        } else {
                                            child.isSelect = false;
                                        }
                                    });
                                });

                                break;
                            case 40://down
                                this.activeIndex ++;
                                this.activeIndex = this.activeIndex > this.childVueList.length-1 ? 0 : this.activeIndex;
                                // this.creatSelectActive();
                                this.$nextTick(() => {
                                    _this.childVueList.forEach((child,index)=>{
                                        if(index === _this.activeIndex) {
                                            child.isSelect = true;
                                            this.config.value = child.text;
                                        } else {
                                            child.isSelect = false;
                                        }
                                    });
                                });
                                break;
                            case 9://tab
                                e.stopPropagation();
                            case 27://ESC
                                this.isDroped = false;
                                this.activeIndex = -1;
                                e.stopPropagation();
                            case 13://enter
                                this.isDroped = false;
                                this.activeIndex = -1;
                                if(this.inputEnter != undefined) {
                                    this.inputEnter && this.inputEnter(this.config.value,this.config.data || []);
                                } else {
                                    this.onSelect && this.onSelect(this.config.value,this.config.data || []);
                                }
                                e.stopPropagation();
                                break;
                            default:
                                this.activeIndex = -1;
                                this.onSearch && this.onSearch(query);
                        }
                    }
                }
            },
            change(e){
                let selectData = this.selectData;
                let _this = this;
                this.$nextTick(() => {
                    _this.$children.forEach((child,index)=>{
                        if(index === 0) {
                            child.isSelect = true;
                        } else {
                            child.isSelect = false;
                        }
                    });
                });
                this.isDroped = false;
                this.config.value = this.selectData[0].text;
                this.onSelect && this.onSelect(selectData[0].text,this.config.data||[],e);
            },
            focusHandler(e){
                this.isDroped = ! this.isDroped;
                if(this.isDroped){
                    this.keyUpHandler(e);
                }
                this.activeIndex = -1;
            },
            setDropPosition(){
                let _this = this;
                let padding = 5;
                this.$nextTick(() => {
                    let $acBody = $(_this.$refs.autocompleteBody);
                    let $inputBody = $(_this.$refs.inputBody);
                    let $dropBody = $(_this.$refs.dropBody);
                    if(_this.placement === 'bottom'){
                        _this.positionStyle.top = $acBody.offset().top + padding + $inputBody.outerHeight() + 'px';
                        _this.positionStyle.left = $acBody.offset().left + 'px';
                    } else if(_this.placement === 'top'){
                        _this.positionStyle.top =  $acBody.offset().top - padding - $dropBody.outerHeight() + 'px';
                    }

                    if(window.innerHeight < $acBody.offset().top + $inputBody.outerHeight() + padding + $dropBody.outerHeight()) {
                        _this.placement = 'top';
                        _this.positionStyle.top = $acBody.offset().top - padding - $dropBody.outerHeight() + 'px';
                    } else {
                        _this.placement = 'bottom';
                        _this.positionStyle.top = $acBody.offset().top + padding + $inputBody.outerHeight() + 'px';
                    }
                    _this.positionStyle.width = $inputBody.width();
                    _this.positionStyle.zIndex = gd.getMaxZIndex() + 1;
                })
            },
            clearFunc(){
                if(this.inputIcon === closeIcon){
                    this.config.value = '';
                    this.config.data = [];
                }
            }
        },
        components:{
            Option
        },
        computed:{
            inputCls(){
                return this.size === 'large'?'gd-input-lg':'';
            },
            inputIcon() {
                let icon = '';
                if (this.clearable && this.config.value) {
                    icon = closeIcon;
                } else if (this.icon) {
                    icon = this.icon;
                }
                return icon;
            }
        },
        mounted(){
            //窗口缩放收起
            $(window).resize(e => {
                this.isDroped = false;
            });

            //父元素滚动收起
            $(this.$refs.autocompleteBody)
                .parents()
                .scroll(e => {
                    this.isDroped = false;
                });
            //点击空白处收起
            $('body').click(e => {
                if ($(this.$refs.autocompleteBody).find(e.target).length == 0) {
                    this.isDroped = false;
                }
            });
            //input 在输入拼音时不发送ajax
            $(this.$refs.inputBody).find('input').on({
                compositionstart : function(e){
                    e.target.isNeedPrevent = true;
                },
                compositionend : function(e){
                    e.target.isNeedPrevent = false;
                }
            });
            this.childVueList = this.$children;
            if(this.config.value === undefined) {
                Vue.set(this.config,'value','');
            }
            if(this.config.disabled === undefined) {
                Vue.set(this.config,'disabled',false);
            }
        }
    }
</script>

<style scoped>

</style>