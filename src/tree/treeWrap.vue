<template>
    <Tree :linkable='config.linkable' :accordion='config.accordion' :simpleData='config.simpleData' :multiple='config.multiple' :showCheckbox='config.showCheckBox' :childrenKey='config.childrenKey' :loadData='config.loadData' :render='config.render' :data='config.data' :id='config.id' ref="treeWrapper" @on-select-change="selectHandler" @on-check-change="changeHanler" @ready="ready"></Tree>
</template>

<script>
let apps = [];
import Tree from './tree.vue';
export default {
    name: 'treeWrap',
    components: { Tree },
    props: {
        config: {
            type: Object
        }
    },
    data() {
        return {};
    },
    methods: {
        selectHandler(n) {
            var onSelectEvent = this.config.onSelect;
            onSelectEvent && onSelectEvent(n);
        },
        changeHanler(n) {
            var onChangeEvent = this.config.onChange;
            onChangeEvent && onChangeEvent(n);
        },
        ready(data) {
            if (typeof this.config.ready === 'function') {
                this.config.ready(gd.clone(this.config.data));
            }
        }
    },
    created() {},
    mounted() {
        let _this = this;
        let treeIdx = -1;
        $.each(apps, (index, app) => {
            if (app.config.id === _this.config.id && app.config.id !== undefined) {
                treeIdx = index;
            }
        });
        if (treeIdx > -1) {
            apps.splice(treeIdx, 1, _this);
        } else {
            apps.push(_this);
        }
        if (typeof this.config.id !== 'undefined') this.$refs.treeWrapper.id = this.config.id;
    }
};


export function tree(id) {
    let treeApp;
    $.each(apps, (i, app) => {
        if (app.config.id === id) {
            treeApp = new GdTree(id, i);
            return false;
        }
    });
    return treeApp;
}

function GdTree(id, index) {
    this.id = id;
    this.index = index;
    this.app = apps[index];
    this.appData = apps[index].config;
}

GdTree.prototype = {
    setData(treeData) {
        if (!treeData) return;
        this.appData.data = treeData;
    },
    getData() {
        return this.appData.data;
    },
    getCheckedNodes() {
        return this.app.$children[0].getCheckedNodes();
    },
    expandAll(boolean) {
        this.app.$children[0].expandAll(boolean);
    },
    getNode(tId) {
        return this.app.$children[0].getNodeByTId(tId);
    },
    getTopNodeData() {
        let node = [];
        var data = this.app.$children[0].data;
        $.each(data, (_, obj) => {
            if (obj.pId == null) {
                node.push(gd.clone(obj));
            }
        });
        if (node) {
            return node;
        }
    },
    setNode(tId, nodeData) {
        this.app.$children[0].setNodeById(tId, nodeData);
    },
    getSelectedNode() {
        return this.app.$children[0].getSelectedNode();
    }
};
</script>

<style scoped>
</style>