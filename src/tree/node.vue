<template>
    <collapse-transition>
        <ul :class="classes">
            <li>
                <div class="gd-tree-node-content" :style="{ 'padding-left': (data.level) * tree.indent+ 'px' }">
                    <span :class="arrowClasses" @click="handleExpand">
                        <i v-if="showArrow" class="icon-right"></i>
                        <Loading v-if="showLoading" class="icon-system"></Loading>
                    </span>
                    <Checkbox type="checkbox" v-if="showCheckbox" :value="data.checked" :indeterminate="data.indeterminate" :disabled="data.disabled || data.disableCheckbox" :ignore="data.ignore" @click.native.prevent="handleCheck"></Checkbox>
                    <Render v-if="data.render" :render="data.render" :data="data" :node="node"></Render>
                    <Render v-else-if="isParentRender" :render="parentRender" :data="data" :node="node"></Render>
                    <span v-else :class="titleClasses" @click="handleSelect" :data-id="data.id">
                        <!-- 增加文件夹开合效果 start 默认是文件夹形式 -->
                        <span v-if="!showCheckbox && !data.icon" class="gd-icon-wraper">
                            <i :class="fileFolderCls(data)"></i>
                        </span>
                        <!-- 增加文件夹开合效果 end -->
                        <i v-if="data.icon" :class="data.icon"></i>
                        <!-- 控制字体与图标间距 -->
                        <span>{{data.title}}</span>
                    </span>
                </div>
                <Tree-node v-if="data.expand" v-for="(item, i) in children" :key="i" :data="item" :show-checkbox="showCheckbox" :children-key="childrenKey">
                </Tree-node>
            </li>
        </ul>
    </collapse-transition>
</template>
<script>
import Checkbox from "./checkbox.vue";
import Render from "./render";
import Loading from "./loading.vue";
import CollapseTransition from "./collapse-transition";
import Emitter from "../mixins/emitter";
import { findComponentUpward } from "../utils/assist";
const prefixCls = "gd-tree";
export default {
    name: "TreeNode",
    mixins: [Emitter],
    components: { CollapseTransition, Render, Checkbox, Loading },
    props: {
        data: {
            type: Object,
            default() {
                return {};
            }
        },
        childrenKey: {
            type: String,
            default: "children"
        },
        showCheckbox: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            prefixCls: prefixCls,
            tree: null
        };
    },
    computed: {
        classes() {
            return [`${prefixCls}-children`];
        },
        selectedCls() {
            return [
                {
                    [`${prefixCls}-node-selected`]: this.data.selected
                }
            ];
        },
        arrowClasses() {
            return [
                `${prefixCls}-arrow`,
                {
                    // [`${prefixCls}-arrow-disabled`]: this.data.disabled,
                    [`${prefixCls}-arrow-open`]: this.data.expand
                }
            ];
        },
        titleClasses() {
            return [
                `${prefixCls}-title`,
                {
                    [`${prefixCls}-title-selected`]: this.data.selected
                }
            ];
        },
        showArrow() {
            return (
                (this.data[this.childrenKey] &&
                    this.data[this.childrenKey].length) ||
                ("loading" in this.data && !this.data.loading)
            );
        },
        showLoading() {
            return "loading" in this.data && this.data.loading;
        },
        isParentRender() {
            return this.tree.render;
        },
        parentRender() {
            const Tree = this.tree;
            if (Tree.render) {
                return Tree.render;
            } else {
                return null;
            }
        },
        node() {
            const Tree = this.tree;
            if (Tree) {
                // 将所有的 node（即flatState）和当前 node 都传递
                return [
                    Tree.flatState,
                    Tree.flatState.find(
                        item => item.nodeKey === this.data.nodeKey
                    )
                ];
            } else {
                return [];
            }
        },
        children() {
            return this.data[this.childrenKey];
        }
    },
    methods: {
        fileFolderCls(data) {
            return data.expand
                ? data.children.length
                    ? "icon-folder"
                    : "icon-file"
                : "icon-file";
        },
        handleExpand() {
            const item = this.data;
            // if (item.disabled) return;
            // async loading
            if (item[this.childrenKey].length === 0) {
                const tree = this.tree;
                if (tree && tree.loadData) {
                    this.$set(this.data, "loading", true);
                    tree.loadData(item, children => {
                        this.$set(this.data, "loading", false);
                        if (children.length) {
                            this.$set(this.data, this.childrenKey, children);
                            this.$nextTick(() => this.handleExpand());
                        }
                    });
                    return;
                }
            }
            if (item[this.childrenKey] && item[this.childrenKey].length) {
                if (this.tree.accordion) {
                    //手风琴模式下同级标签只有点击的node可以打开，其他关闭
                    this.dispatch("Tree", "expand-accordion", this.data);
                }
                this.$set(this.data, "expand", !this.data.expand);
                this.dispatch("Tree", "toggle-expand", this.data);
            }
        },
        handleSelect() {
            if (this.data.disabled) return;
            this.dispatch("Tree", "on-selected", this.data.nodeKey);
        },
        handleCheck() {
            //点击checkbox 事件
            if (this.data.disabled || this.data.ignore) return;
            const changes = {
                checked: !this.data.checked && !this.data.indeterminate,
                nodeKey: this.data.nodeKey
            };
            this.dispatch("Tree", "on-check", changes);
        },
        getLen(str, cutNum) {
            var str = str || "",
                len = 0,
                sAll = "",
                cuttedStr = "";
            for (var i = 0; i < str.length; i++) {
                var c = str.charCodeAt(i);
                var sSin = str[i];
                if (
                    (c >= 0x0001 && c <= 0x007e) ||
                    (0xff60 <= c && c <= 0xff9f)
                ) {
                    len++;
                } else {
                    len += 2;
                }
                if (cutNum && len <= cutNum) {
                    sAll += sSin;
                    cuttedStr = sAll;
                }
            }
            return {
                len: len,
                cuttedStr: cuttedStr
            };
        },
        ellipsisHover(title) {
            if (title && title.length > this.tree.titleEllipsis / 2) {
                return this.getLen(title).len >= this.tree.titleEllipsis
                    ? title
                    : null;
            } else {
                return null;
            }
        },
        ellipsisCut(text) {
            if (text && text.length > this.tree.titleEllipsis / 2) {
                var getLenObj = this.getLen(text, this.tree.titleEllipsis);
                return getLenObj.len >= this.tree.titleEllipsis
                    ? getLenObj.cuttedStr + "..."
                    : text;
            } else {
                return text;
            }
        }
    },
    created() {
        const Tree = findComponentUpward(this, "Tree");
        if (Tree) {
            this.tree = Tree;
        }
    },
    mounted() {
        var that = this;
        this.$nextTick(() => {
            //有滚动条，去掉...
            var scrollDom = this.$parent.$el;
            if (scrollDom.scrollWidth > scrollDom.clientWidth) {
                var titleDom = $(that.$el).find("span[title]");
                titleDom.each(function(index, elem) {
                    var title = $(elem).attr("title");
                    $(elem)
                        .html(title)
                        .removeAttr("title");
                });
            }
        });
    }
};
</script>