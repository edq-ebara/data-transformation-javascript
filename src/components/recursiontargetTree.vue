
<template>
    <div>
        <el-tree :expand-on-click-node="false" :style="'overflow:auto'" :data="this.data" :props="defaultProps" default-expand-all>
            <div slot-scope="{ data }">
                <div v-if="!Array.isArray(data)">
                    <span @mouseup="handleDragUp" @mousedown="clearStartName" :name="data.name" style="user-select:none;cursor: pointer;font-weight: 600;">{{ data.key }}：</span>
                    <span v-if="data.value&&(typeof data.value != 'object')">{{ data.value }}</span>
                </div>
                <div v-else>
                    <span @mouseup="handleDragUpIndex" @mousedown="clearStartName" :name="JSON.stringify(data[0])" style="user-select:none;cursor: pointer;font-weight: 600;">{{ handleDragClicks(data[0]) }}：</span>
                    <div style="margin-left: 45px;margin-top: -20px;">
                        {
                        <div v-for="(item,index) in data" :key="index">
                            <div style="margin-left: 20px;">
                                <span @mouseup="handleDragUp" @mousedown="clearStartName" :name="item.name" style="user-select:none;cursor: pointer;font-weight: 600;">{{ item.key }}：</span>
                                <span v-if="item.children&&item.children.length==0">{{ item.value }}</span>
                                <div v-if="item.children&&item.children.length>0">
                                    <recursiontargetTree @handleDragUpIndex="handleDragUpIndex" :data="item.children" @handleDragUp="handleDragUp" @clearStartName="clearStartName"></recursiontargetTree>
                                </div>
                                <div v-else>
                                    <div v-if="Array.isArray(item)&&item.length>0">
                                        <recursiontargetTree @handleDragUpIndex="handleDragUpIndex" :data="item" @handleDragUp="handleDragUp" @clearStartName="clearStartName"></recursiontargetTree>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    </div>
                </div>
            </div>
        </el-tree>
    </div>
</template>

<script>
export default {
    name: "recursiontargetTree",
    components: {},
    props: {
        data: {
            type: Array,
            default: [],
        },
    },
    data() {
        return {
            defaultProps: {
                children: "children",
                label: "key",
            },
        };
    },
    computed: {},
    created() {},
    mounted() {},
    methods: {
        // 展示索引
        handleDragClicks(e) {
            let nodeTextParse = e.name;
            return nodeTextParse.substring(
                nodeTextParse.lastIndexOf("["),
                nodeTextParse.lastIndexOf("]") + 1
            );
        },
        handleDragUp(e) {
            this.$emit("handleDragUp", e);
        },
        clearStartName() {
            this.$emit("clearStartName");
        },
        // 获取索引
        handleDragUpIndex(e) {
            let nodeText = e.target.getAttribute("name");
            let nodeTextParse = JSON.parse(nodeText).name;
            this.$emit(
                "handleDragUpIndex",
                nodeTextParse.substring(0, nodeTextParse.lastIndexOf(".")),
                e
            );
        },
    },
};
</script>
<style scoped lang='scss'>
::v-deep .el-tree {
    cursor: default; // 或者设置为你想要的其他样式
}
</style>
