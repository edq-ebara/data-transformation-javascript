<template>
    <div>
        <div style="display: flex;">
            <div style="width: 50%;">
                源模板
                <div style="border: 1px solid gray;">
                    {
                    <br />&nbsp;&nbsp;&nbsp;&nbsp;root: -- 固定结构
                    <div>
                        <b-code-editor v-model="sourceTemplate" :theme="theme" :auto-format="true" ref="sourceEditor" :show-number="showNumber" :readonly="readonly" :lint="lint" @on-change="sourceStructure" />}
                        <br />
                        <el-button @click="sourceFormatCode" size="mini" type="primary">格式化</el-button>
                        <el-button @click="sourceStructure" size="mini" type="primary">生成结构</el-button>
                        <el-button @click="clearSourceTemplate" size="mini" type="primary">清空</el-button>
                    </div>
                </div>
            </div>
            <div style="width: 50%;">
                目标模板
                <div style="border: 1px solid gray;">
                    {
                    <br />&nbsp;&nbsp;&nbsp;&nbsp;root: -- 固定结构
                    <div>
                        <b-code-editor v-model="targetTemplate" :theme="theme" :auto-format="true" ref="targeteditor" :show-number="showNumber" :readonly="readonly" :lint="lint" @on-change="targetStructure" />}
                        <br />
                        <el-button @click="targetFormatCode" size="mini" type="primary">格式化</el-button>
                        <el-button @click="targetStructure" size="mini" type="primary">生成结构</el-button>
                        <el-button @click="clearTargetTemplate" size="mini" type="primary">清空</el-button>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <div style="display: flex;">
                <div style="width: 20%;">
                    源结构
                    <el-tree :expand-on-click-node="false" :style="'height: 500px;overflow:auto'" :data="sourceData" :props="defaultProps" default-expand-all>
                        <div slot-scope="{ data }">
                            <div v-if="!Array.isArray(data)">
                                <span @mousedown="handleDragStart" @mouseup="clearStartName" :name="data.name" style="user-select:none;">{{ data.key }}</span>
                                <span v-if="data.value&&(typeof data.value != 'object')">：{{ data.value }}</span>
                            </div>
                            <div v-else> 
                                {
                                <div v-for="(item,index) in data" :key="index">
                                    <div style="margin-left: 20px;">
                                        <span @mousedown="handleDragStart" @mouseup="clearStartName" :name="item.name" style="user-select:none;">{{ item.key }}</span>
                                        <span :name="index+item.value">：{{ item.value }}</span>
                                    </div>
                                </div>
                            }
                            </div>
                        </div>
                    </el-tree>
                </div>
                <div style="width: 20%;">
                    目标结构
                    <el-tree :expand-on-click-node="false" :style="'height: 500px;overflow:auto'" :data="targetData" :props="defaultProps" default-expand-all>
                        <div slot-scope="{ data }">
                            <div v-if="!Array.isArray(data)">
                                <span @mouseup="handleDragUp" @mousedown="clearStartName" :name="data.name" style="user-select:none;">{{ data.key }}</span>
                                <span v-if="data.value&&(typeof data.value != 'object')">：{{ data.value }}</span>
                            </div>
                            <div v-else>
                                {
                                <div v-for="(item,index) in data" :key="index">
                                    <div style="margin-left: 20px;">
                                        <span @mouseup="handleDragUp" @mousedown="clearStartName" :name="item.name" style="user-select:none;">{{ item.key }}</span>
                                        <span :name="index+item.value">：{{ item.value }}</span>
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </el-tree>
                </div>
                <div style="width: 40%;">
                    对应关系
                    <el-table :data="tableData" style="width: 100%" height="500">
                        <el-table-column label="原路径" min-width="180">
                            <template slot-scope="scope">
                                <el-input size="mini" clearable v-model="scope.row.sourcePath"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="目标路径" min-width="180">
                            <template slot-scope="scope">
                                <el-input size="mini" clearable v-model="scope.row.targetPath"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="对应关系" min-width="120">
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.relationShip" placeholder="请选择" clearable size="mini">
                                    <el-option v-for="item in relationShipOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="100">
                            <template slot-scope="scope">
                                <el-button type="danger" size="mini" @click="delShip(scope.$index)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div style="width: 20%;">
                    转换信息
                    <b-code-editor style="height: 450px;" v-model="finalTemplate" :theme="theme" :auto-format="false" ref="finalEditor" :show-number="showNumber" :readonly="true" :lint="lint" />
                    <div style="float: right;">
                        <el-button size="mini" type="primary" @click="inspect">检验</el-button>
                        <el-button size="mini" type="primary" @click="preview">预览</el-button>
                        <el-button size="mini" type="primary" @click="copyRouter">复制跳转</el-button>
                    </div>
                </div>
            </div>
        </div>
        <div id="tooltip" style=" position: absolute;z-index: 9999; ">
            <el-select v-model="relationShip" placeholder="请选择" clearable @change="showShip" size="mini">
                <el-option v-for="item in relationShipOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-button @click="cancelShip" size="mini" type="danger">取消</el-button>
        </div>
        <el-dialog title="预览" id="previewId" :visible.sync="previewDia" width="50%" :close-on-click-modal="true">
            <b-code-editor v-model="previewTemplate" :theme="theme" :auto-format="false" ref="previewEditor" :show-number="showNumber" :readonly="true" :lint="lint" />
        </el-dialog>
    </div>
</template>
  <script  >
// import vueJsonEditor from "vue-json-editor";
import JsonTranferUtil from "./json_transfer";
export default {
    // components: { vueJsonEditor },
    data() {
        return {
            finalTemplate: JSON.stringify({}),
            previewDia: false,
            previewTemplate: {},
            relationShipOptions: [
                { label: "源Key->目标Key", value: 1 },
                { label: "源Key->目标value", value: 2 },
                { label: "源value->目标key", value: 3 },
                { label: "源value->目标Value", value: 4 },
            ],
            relationShip: "",
            tableData: [],
            defaultProps: {
                children: "children",
                label: "key",
            },
            sourceData: [],
            targetData: [],
            hasJsonFlag: true, // json是否验证通过
            hasJsonFlag1: true,
            sourceTemplate: JSON.stringify(
                JSON.parse( )
            ),
            targetTemplate: JSON.stringify(
                JSON.parse(  )
            ),
            showNumber: true,
            lint: true,
            readonly: false,
            wrap: true,
            theme: "idea",
            startName: "",
            upName: "",
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.cancelShip();
        });
    },
    methods: {
        // 复制跳转
        copyRouter() {
            if (this.tableData.length <= 0) {
                this.$message.error("清先添加对应关系");
                return;
            }
            let mappings = [];
            this.tableData.forEach((item) => {
                let ss = {};
                ss.AimJsonPath = item.targetPath;
                ss.OrgJsonPath = item.sourcePath;
                ss.TranType = item.relationShip;
                mappings.push(ss);
            });
            // 源
            let jsonOrg = JSON.parse(this.sourceTemplate);
            // 目标
            let jsonAim = JSON.parse(this.targetTemplate);
            this.$router.push({path:'/convertpage',query: {  jsonOrg: jsonOrg,
                jsonAim: jsonAim,
                mappings: mappings}});
           
        },
        // 预览
        preview() {
            if (this.tableData.length <= 0) {
                this.$message.error("清先添加对应关系");
                return;
            }
            let mappings = [];
            this.tableData.forEach((item) => {
                let ss = {};
                ss.AimJsonPath = item.targetPath;
                ss.OrgJsonPath = item.sourcePath;
                ss.TranType = item.relationShip;
                mappings.push(ss);
            });
            // 源
            let jsonOrg = JSON.parse(this.sourceTemplate);
            // 目标
            let jsonAim = JSON.parse(this.targetTemplate);
            let jsonTranferUtil = new JsonTranferUtil(
                jsonOrg,
                jsonAim,
                mappings
            );
            // 检验
            let result = jsonTranferUtil.checkJsonMapping();
            // 生成
            if (result.IsSuccess) {
                this.previewTemplate = JSON.stringify(
                    jsonTranferUtil.tranJson()
                );
                this.previewDia = true;
                setTimeout(() => {
                    this.$refs["previewEditor"].formatCode();
                }, 200);
            } else {
                this.$message.error(result.Msg);
            }
        },
        // 检验
        inspect() {
            if (this.tableData.length <= 0) {
                this.$message.error("清先添加对应关系");
                return;
            }
            let mappings = [];
            this.tableData.forEach((item) => {
                let ss = {};
                ss.AimJsonPath = item.targetPath;
                ss.OrgJsonPath = item.sourcePath;
                ss.TranType = item.relationShip;
                mappings.push(ss);
            });
            // 源
            let jsonOrg = JSON.parse(this.sourceTemplate);
            // 目标
            let jsonAim = JSON.parse(this.targetTemplate);
            let jsonTranferUtil = new JsonTranferUtil(
                jsonOrg,
                jsonAim,
                mappings
            );
            // 检验
            let result = jsonTranferUtil.checkJsonMapping();
            // 生成
            // let resulta = jsonTranferUtil.tranJson();
            // console.log(result, 9999999999999)
            // console.log(resulta, 888888)
            if (result.IsSuccess) {
                this.$message.success("校验通过");
            } else {
                this.$message.error(result.Msg);
            }
        },
        // 数据转换
        generateTree(obj, path = "") {
            let tree = [];

            for (const key in obj) {
                // 创建当前路径
                const currentPath = path ? `${path}.${key}` : key;
                // 创建树节点
                const node = {
                    name: currentPath,
                    key: key,
                    value: obj[key],
                    children: [],
                };
                if (typeof obj[key] === "object" && obj[key] !== null) {
                    if (Array.isArray(obj[key])) {
                        // 处理数组
                        for (let i = 0; i < obj[key].length; i++) {
                            node.children.push(
                                this.generateTree(
                                    obj[key][i],
                                    `${currentPath}[${i}]`
                                )
                            );
                        }
                    } else {
                        // 处理对象
                        node.children = this.generateTree(
                            obj[key],
                            currentPath
                        );
                    }
                }
                // 如果没有子元素，就不需要children这个属性
                if (node.children.length === 0) {
                    delete node.children;
                }
                tree.push(node);
            }

            return tree;
        },
        clearStartName() {
            this.startName = "";
        },
        // 鼠标按下事件
        handleDragStart(e) {
            // startName:"",
            //   upName:""
            // console.log(e.target.getAttribute('name'), 1111111);
            this.startName = e.target.getAttribute("name");
        },
        // 鼠标松开
        handleDragUp(e) {
            if (this.startName != "") {
                // console.log(e.target.getAttribute('name'), 2222222);
                this.upName = e.target.getAttribute("name");
                var tooltip = document.getElementById("tooltip");
                tooltip.style.left = e.pageX + 10 + "px"; // 鼠标位置右偏10像素
                tooltip.style.top = e.pageY + 10 + "px"; // 鼠标位置下偏10像素
                this.relationShip = "";
            }
        },
        // 删除对应关系
        delShip(e) {
            this.tableData.splice(e, 1);
            let mappings = [];
            this.tableData.forEach((item) => {
                let ss = {};
                ss.AimJsonPath = item.targetPath;
                ss.OrgJsonPath = item.sourcePath;
                ss.TranType = item.relationShip;
                mappings.push(ss);
            });
            // 源
            let jsonOrg = JSON.parse(this.sourceTemplate);
            // 目标
            let jsonAim = JSON.parse(this.targetTemplate);
            this.finalTemplate = JSON.stringify({
                jsonOrg: jsonOrg,
                jsonAim: jsonAim,
                mappings: mappings,
            });
            setTimeout(() => {
                this.$refs["finalEditor"].formatCode();
            }, 200);
        },
        // 选择关系
        showShip(e) {
            // tableData
            let ss = {
                sourcePath: this.startName,
                targetPath: this.upName,
                relationShip: this.relationShipOptions.filter((item) => {
                    return item.value == e;
                })[0].value,
            };
            this.tableData.push(ss);
            this.cancelShip();
            let mappings = [];
            this.tableData.forEach((item) => {
                let ss = {};
                ss.AimJsonPath = item.targetPath;
                ss.OrgJsonPath = item.sourcePath;
                ss.TranType = item.relationShip;
                mappings.push(ss);
            });
            // 源
            let jsonOrg = JSON.parse(this.sourceTemplate);
            // 目标
            let jsonAim = JSON.parse(this.targetTemplate);
            this.finalTemplate = JSON.stringify({
                jsonOrg: jsonOrg,
                jsonAim: jsonAim,
                mappings: mappings,
            });
            setTimeout(() => {
                this.$refs["finalEditor"].formatCode();
            }, 200);
        },
        // 关闭关系弹框
        cancelShip() {
            var tooltip = document.getElementById("tooltip");
            tooltip.style.left = -999 + "px"; // 鼠标位置右偏10像素
            tooltip.style.top = -999 + "px"; // 鼠标位置下偏10像素
            this.startName = "";
            this.upName = "";
        },
        // 源模板格式化
        sourceFormatCode() {
            this.$refs["sourceEditor"].formatCode();
            try {
                JSON.parse(this.sourceTemplate);
                this.$message.success("JSON校验成功");
            } catch (error) {
                this.$message.error("JSON校验失败");
            }
        },
        // 源生成结构
        sourceStructure(val) {
            // console.log(val,111)
            try {
                let data = { root: JSON.parse(val) };
                this.sourceData = this.generateTree(data);
                this.tableData = [];
                this.finalTemplate = JSON.stringify({});
            } catch (error) {
                this.$message.error("JSON校验失败无法生成结构");
            }
        },
        // 源清空
        clearSourceTemplate() {
            this.sourceTemplate = "";
        },
        // 目标模板格式化
        targetFormatCode() {
            this.$refs["targeteditor"].formatCode();
            try {
                JSON.parse(this.targetTemplate);
                this.$message.success("JSON校验成功");
            } catch (error) {
                this.$message.error("JSON校验失败");
            }
        },
        // 目标生成结构
        targetStructure(val) {
            try {
                let data = { root: JSON.parse(val) };
                this.targetData = this.generateTree(data);
                this.tableData = [];
                this.finalTemplate = JSON.stringify({});
            } catch (error) {
                this.$message.error("JSON校验失败无法生成结构");
            }
        },
        // 目标清空
        clearTargetTemplate() {
            this.targetTemplate = "";
        },
    },
};
</script>
  <style scoped lang="scss">
::v-deep .jsoneditor-outer {
    height: 400px;
}
::v-deep .el-tree-node__content {
    height: 100%;
}
</style>
  