
<template>
    <div >
        <el-tree :expand-on-click-node="false" :style="'overflow:auto'" :data="this.data" :props="defaultProps" default-expand-all>
            <div slot-scope="{ node, data }">
                <div v-if="!Array.isArray(data)">
                    <span @mousedown="handleDragStart" @mouseup="clearStartName" :name="data.name" style="user-select:none;cursor: pointer;font-weight: 600;">{{ data.key }}：</span>
                    <span v-if="data.value&&(typeof data.value != 'object')">{{ data.value }}</span>
                </div>
                <div v-else>
                    <span  @mousedown="handleDragStartIndex" @mouseup="clearStartName" :name="JSON.stringify(data[0])" style="user-select:none;cursor: pointer;font-weight: 600;" > {{ handleDragClicks(data[0]) }}：</span>
                    <div style="margin-left: 45px;margin-top: -20px;">
                    {
                    <div v-for="(item,index) in data" :key="index">
                        <div style="margin-left: 20px;">
                            <span @mousedown="handleDragStart" @mouseup="clearStartName" :name="item.name" style="user-select:none;cursor: pointer;font-weight: 600;">{{ item.key }}：</span>
                            <span v-if="item.children&&item.children.length==0">{{ item.value }}</span>
                            <div v-if="item.children&&item.children.length>0">
                                <recursionTree :data="item.children"  @handleDragStartIndex="handleDragStartIndex"  @handleDragStart="handleDragStart" @clearStartName="clearStartName"></recursionTree>
                            </div>
                            <div v-else>
                                <div v-if="Array.isArray(item)&&item.length>0">
                                    <recursionTree :data="item"  @handleDragStartIndex="handleDragStartIndex" @handleDragStart="handleDragStart" @clearStartName="clearStartName"></recursionTree>
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
    name: "recursionTree",
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
        // 节点索引
        handleDragClicks(e) {
            let nodeTextParse = e.name
            return nodeTextParse.substring(nodeTextParse.lastIndexOf("["),nodeTextParse.lastIndexOf("]")+1)
             
        },
        handleDragStart(e) {
            this.$emit("handleDragStart", e);
            // this.startName = e.target.getAttribute("name");
        },
        // 获取索引
        handleDragStartIndex(e){
            let nodeText= e.target.getAttribute("name")
            let nodeTextParse = JSON.parse(nodeText).name
            this.$emit("handleDragStartIndex", nodeTextParse.substring(0,nodeTextParse.lastIndexOf(".")));
        },
        clearStartName() {
            this.$emit("clearStartName");
            // this.startName = "";
            // alert(222)
        },
    },
};
</script>
<style scoped lang='scss'>
::v-deep .el-tree  {
  cursor: default; // 或者设置为你想要的其他样式
}
</style>
