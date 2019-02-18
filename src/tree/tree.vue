<template>
    <div class="gd-tree">
        <div class="gd-tree-inner">
            <Tree-node v-for="(item, i) in stateTree" :key="i" :data="item" visible :show-checkbox="showCheckbox" :children-key="childrenKey">
            </Tree-node>
            <div :class="[prefixCls + '-empty']" v-if="!stateTree.length">
                <i class="gd-none-data"></i>
            </div>
        </div>
    </div>
</template>
<script>
import TreeNode from "./node.vue";

const prefixCls = "gd-tree";
const DEFAULTSIMPLEDATA = {
    id: "id",
    parentId: "pId",
    title: "name",
    nodeLevel: "level",
    rootId: "0"
};
export default {
    name: "Tree",
    components: { TreeNode },
    props: {
        linkable: {
            type: Boolean,
            default: true
        },
        simpleData: {
            type: Boolean,
            default: true
        },
        data: {
            type: Array,
            default() {
                return [];
            }
        },
        titleEllipsis: {
            type: [String, Number],
            default: 20
        },
        indent: {
            type: Number,
            default: 18
        },
        showCheckbox: {
            type: Boolean,
            default: false
        },
        accordion: {
            type: Boolean,
            default: false
        },
        childrenKey: {
            type: String,
            default: "children"
        },
        loadData: {
            type: Function
        },
        render: {
            type: Function
        }
    },
    data() {
        return {
            prefixCls: prefixCls,
            stateTreeClone: [],
            stateTree: this.data,
            flatState: []
        };
    },
    watch: {
        data: {
            deep: true,
            handler() {
                this.initDataConversion();
            }
        }
    },
    methods: {
        initDataConversion() {
            if (this.simpleData) {
                this.stateTree = this.stateTreeClone = this.toTreeData(
                    this.data,
                    DEFAULTSIMPLEDATA
                ); //数组形式
            } else {
                this.stateTree = this.data;
            }
            // so we have always a relation parent/children of each node
            this.flatState = this.compileFlatState(); // 是所有节点的数据 nodekey 作为数组的key值
            this.rebuildTree();
        },
        compileFlatState() {
            // so we have always a relation parent/children of each node
            let keyCounter = 0;
            let childrenKey = this.childrenKey;
            const flatTree = [];

            function flattenChildren(node, parent) {
                node.nodeKey = keyCounter++;
                flatTree[node.nodeKey] = { node: node, nodeKey: node.nodeKey };
                if (typeof parent != "undefined") {
                    flatTree[node.nodeKey].parent = parent.nodeKey;
                    flatTree[parent.nodeKey][childrenKey].push(node.nodeKey);
                }
                if (node[childrenKey]) {
                    flatTree[node.nodeKey][childrenKey] = [];
                    node[childrenKey].forEach(child =>
                        flattenChildren(child, node)
                    );
                }
            }

            this.stateTree.forEach(rootNode => {
                flattenChildren(rootNode);
            });

            return flatTree;
        },
        rebuildTree() {
            // only called when `data` prop changes
            let _t = this;
            const checkedNodes = this.flatState.filter(obj => obj.node.checked); //获取选中节点 包含 nodekey 节点的parentKey
            checkedNodes.forEach(nodeObj => {
                let node = nodeObj.node; //获取节点的数据 data 原生数据
                let nodeKey = nodeObj.nodeKey; //获取节点key
                if (_t.linkable) {
                    var chkboxTypeTran = {
                        Y: "ps",
                        N: "ps"
                    };
                } else {
                    var chkboxTypeTran = {
                        Y: "",
                        N: ""
                    };
                }

                let YChecked = chkboxTypeTran.Y;
                if (YChecked.indexOf("s") > -1) {
                    this.updateTreeDown(node, { checked: true });
                }

                // propagate upwards
                let parentKey = "";
                try {
                    parentKey = this.flatState[nodeKey].parent;
                } catch (e) {}
                if (!parentKey && parentKey != 0) return; //父节点的key 就不执行了
                const parent = this.flatState[parentKey].node;
                const childHasCheckSetter =
                    typeof node.checked != "undefined" && node.checked;
                if (
                    childHasCheckSetter &&
                    parent.checked != node.checked &&
                    YChecked.indexOf("p") > -1
                ) {
                    this.updateTreeUp(nodeKey, true); // update tree upwards
                }
            });
            this.$nextTick(() => {
                this.$emit("ready");
            });
        },
        getSelectedNode() {
            /* public API */
            return this.flatState
                .filter(obj => obj.node.selected)
                .map(obj => obj.node)[0];
        },
        getCheckedNodes() {
            /* public API */
            let nodesId = this.flatState
                .filter(obj => obj.node.checked)
                .map(obj => obj.node.id);
            return this.data.filter(obj => {
                return nodesId.indexOf(obj.id) > -1;
            });
        },
        getNodeByTId(tId) {
            /* public API */
            if (typeof tId === "undefined") return;
            let node = "";
            $.each(this.data, (_, obj) => {
                if (obj.id == tId) {
                    node = gd.clone(obj);
                    return false;
                }
            });
            if (node) {
                return node;
            }
        },
        setNodeById(tId, nodeData) {
            /* public API */
            if (typeof tId === "undefined") return;
            if (nodeData instanceof Object) {
                nodeData = new Array(nodeData);
            }

            var tIdNode = this.flatState
                .filter(obj => obj.node.id === tId)
                .map(obj => obj.node);
            var simpleData = this.toTreeData(
                nodeData,
                DEFAULTSIMPLEDATA,
                "setDataOn"
            );
            if (tIdNode.length != 0) {
                for (let k in simpleData[0]) {
                    tIdNode[0][k] = simpleData[0][k];
                }
            }
        },
        expandAll(Boolean) {
            var that = this;
            /* public API */
            if (typeof Boolean === undefined) return;
            this.flatState.map(obj => {
                that.$set(obj.node, "expand", Boolean);
                obj.node.expand = Boolean;
            });
        },
        updateTreeUp(nodeKey, nodeChecked) {
            const parentKey = this.flatState[nodeKey].parent;
            if (typeof parentKey == "undefined") return;
            const node = this.flatState[nodeKey].node;

            if (!(typeof nodeChecked === "undefined")) {
                node.checked = nodeChecked;
                this.$set(node, "checked", nodeChecked);
            }

            const parent = this.flatState[parentKey].node;
            if (
                node.checked == parent.checked &&
                node.indeterminate == parent.indeterminate
            )
                return; // no need to update upwards
            if (node.checked == true) {
                let checkedNodes = parent[this.childrenKey].filter(function(
                    node
                ) {
                    return node.checked && !node.ignore;
                });
                log(checkedNodes.length);
                this.$set(
                    parent,
                    "checked",
                    parent[this.childrenKey].every(
                        node => node.checked || node.ignore
                    ) && checkedNodes.length > 0
                );
                this.$set(
                    parent,
                    "indeterminate",
                    !parent.checked && checkedNodes.length > 0
                );
            } else {
                this.$set(parent, "checked", false);
                this.$set(
                    parent,
                    "indeterminate",
                    parent[this.childrenKey].some(
                        node =>
                            (node.checked && !node.ignore) || node.indeterminate
                    )
                );
            }
            this.updateTreeUp(parentKey);
        },
        updateTreeDown(node, changes = {}) {
            for (let key in changes) {
                this.$set(node, key, changes[key]);
            }

            if (node[this.childrenKey]) {
                node[this.childrenKey].forEach(child => {
                    if (!child.ignore) {
                        this.updateTreeDown(child, changes);
                    }
                });
            }
        },
        handleSelect(nodeKey) {
            const node = this.flatState[nodeKey].node;
            let currentSelectedKey = -1;
            $.each(this.flatState, function(index, obj) {
                if (obj.node.selected) {
                    currentSelectedKey = index;
                    return false;
                }
            });
            if (currentSelectedKey >= 0 && currentSelectedKey !== nodeKey)
                this.$set(
                    this.flatState[currentSelectedKey].node,
                    "selected",
                    false
                );
            this.$set(node, "selected", true);
            this.$emit("on-select-change", this.getSelectedNode());
        },
        handleCheck({ checked, nodeKey }) {
            //点击checkbox 事件
            const node = this.flatState[nodeKey].node;
            this.$set(node, "checked", checked);
            this.$set(node, "indeterminate", false);

            if (this.linkable) {
                var chkboxTypeTran = {
                    Y: "ps",
                    N: "ps"
                };
            } else {
                var chkboxTypeTran = {
                    Y: "",
                    N: ""
                };
            }

            let YChecked = chkboxTypeTran.Y;
            let NoChecked = chkboxTypeTran.N;
            if (!checked && YChecked.indexOf("p") > -1) {
                this.updateTreeUp(nodeKey, checked); // propagate up
            }
            if (checked && NoChecked.indexOf("p") > -1) {
                this.updateTreeUp(nodeKey, checked); // propagate up
            }
            if (!checked && YChecked.indexOf("s") > -1) {
                this.updateTreeDown(node, { checked, indeterminate: false }); // reset `indeterminate` when going down
            }
            if (checked && NoChecked.indexOf("s") > -1) {
                this.updateTreeDown(node, { checked, indeterminate: false }); // reset `indeterminate` when going down
            }

            this.$emit("on-check-change", this.getCheckedNodes());
        },
        toTreeData(data, attributes, setDataOn) {
            let resData = $.extend(true, [], data);
            let tree = [];
            let _t = this;
            let nodeLevel = 0;
            for (let i = 0; i < resData.length; i++) {
                let resDataObj = resData[i];
                if (
                    resDataObj[attributes.parentId] === null ||
                    setDataOn === "setDataOn"
                ) {
                    resDataObj.id = resDataObj[attributes.id];
                    resDataObj.title = resDataObj[attributes.title];
                    if (resDataObj.expand === undefined) {
                        //用户没有设置expand
                        if (!_t.accordion) {
                            //手风琴模式下extend是false，所有node是默认关闭的
                            resDataObj.expand = true;
                        } else {
                            resDataObj.expand = false;
                        }
                    }
                    resDataObj.children = [];
                    tree.push(resDataObj);
                    resData.splice(i, 1);
                    i--;
                }
            }

            run(tree);

            function run(chiArr) {
                if (resData.length !== 0) {
                    for (let i = 0; i < chiArr.length; i++) {
                        for (let j = 0; j < resData.length; j++) {
                            var resDataObj = resData[j];
                            if (
                                chiArr[i].id === resDataObj[attributes.parentId]
                            ) {
                                resDataObj.id = resDataObj[attributes.id];
                                resDataObj.title = resDataObj[attributes.title];
                                if (resDataObj.expand === undefined) {
                                    if (!_t.accordion) {
                                        //手风琴模式下extend是false，所有node是默认关闭的
                                        resDataObj.expand = true;
                                    } else {
                                        resDataObj.expand = false;
                                    }
                                }
                                resDataObj.children = [];
                                chiArr[i].children.push(resDataObj);
                                resData.splice(j, 1);
                                j--;
                            }
                        }
                        run(chiArr[i].children);
                    }
                }
            }

            return tree;
        }
    },
    created() {
        this.initDataConversion();
    },
    mounted() {
        var _t = this;
        _t.$on("on-check", this.handleCheck);
        _t.$on("on-selected", this.handleSelect);
        _t.$on("toggle-expand", node => this.$emit("on-toggle-expand", node));
        if (_t.accordion) {
            _t.$on("expand-accordion", node => {
                _t.flatState.map(function(obj) {
                    if (obj.node.pId === node.pId && obj.node !== node) {
                        //父节点一致并且节点是一致的
                        obj.node.expand = false;
                    }
                });
            });
        }
    }
};
</script>