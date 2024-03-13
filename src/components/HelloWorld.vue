<template>
    <div style="width: 98%;margin: auto;">
        <el-tabs v-model="conActiveName">
            <el-tab-pane label="信息配置" name="first">
                <div style="display: flex; width: 100%;margin: auto;height: 875px;">
                    <div style="width: 30%;border: 1px solid gray;border-right: none;">
                        <div>
                            <el-image style="width: 17px; height: 17px;position: relative;left: 5px;top: 2px;" :src="require('../assets/muban.png')"></el-image>
                            <span style="display: inline-block;margin-left: 7px;font-weight: 550;">源模板</span>
                            <div id="sourceTemplate" @mouseup="clearStartName">
                                <div style="position: absolute;top:26px;left: 4%;z-index: 1;">
                                    <el-button @click="sourceStructure" size="mini" type="primary">生成源结构</el-button>
                                    <el-button @click="clearSourceTemplate" size="mini" type="primary">清空源模板</el-button>
                                </div>
                                <vue-json-editor v-model="sourceTemplate" lang="zh" :modes="[]" :show-btns="false" :mode="'code'" :expanded-on-start="true" />
                            </div>
                            <div>
                                <div>
                                    <el-image style="width: 17px; height: 17px;position: relative;left: 5px;top: 2px;" :src="require('../assets/jiegou.png')"></el-image>
                                    <span style="display: inline-block;margin-left: 7px;font-weight: 550;">源结构</span>
                                    <div style=" overflow: auto;" @mouseup="clearStartName" @mousemove="handleDragMove">
                                        <el-tree :expand-on-click-node="false" id="sourceTree" :style="'height: 460px;overflow:auto;min-width: 100%;font-size: 14px;'" class="treeClass" :data="sourceData" :props="defaultProps" default-expand-all>
                                            <div slot-scope="{ node, data }">
                                                <div v-if="!Array.isArray(data)">
                                                    <span @mousedown="handleDragStart" @mouseup="clearStartName" :name="data.name" style="user-select:none;cursor: pointer;font-weight: 600;">{{ data.key }}：</span>
                                                    <span v-if="data.value&&(typeof data.value != 'object')">{{ data.value }}</span>
                                                </div>
                                                <div v-else>
                                                    <span @mousedown="handleDragStartIndex" @mouseup="clearStartName" :name="JSON.stringify(data[0])" style="user-select:none;cursor: pointer;font-weight: 600;">{{ handleDragClicks(data[0]) }}&nbsp;：</span>
                                                    <div style="margin-left: 45px;margin-top: -20px;">
                                                        {
                                                        <div v-for="(item,index) in data" :key="index">
                                                            <div style="margin-left: 20px;">
                                                                <span @mousedown="handleDragStart" @mouseup="clearStartName" :name="item.name" style="user-select:none;cursor: pointer;font-weight: 600;">{{ item.key }}：</span>
                                                                <span v-if="item.children&&item.children.length==0">{{ item.value }}</span>
                                                                <span :name="index+item.value" v-if="data.value&&(typeof data.value != 'object')">{{ data.value }}</span>
                                                                <div v-if="item.children&&item.children.length>0">
                                                                    <recursionTree :data="item.children" @handleDragStartIndex="handleDragStartIndexRecursion" @handleDragStart="handleDragStartRecursion" @clearStartName="clearStartNameRecursion"></recursionTree>
                                                                </div>
                                                                <div v-else>
                                                                    <div v-if="Array.isArray(item)&&item.length>0">
                                                                        <recursionTree :data="item" @handleDragStartIndex="handleDragStartIndexRecursion" @handleDragStart="handleDragStartRecursion" @clearStartName="clearStartNameRecursion"></recursionTree>
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
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="width: 30%;border: 1px solid gray;">
                        <div>
                            <el-image style="width: 17px; height: 17px;position: relative;left: 5px;top: 2px;" :src="require('../assets/muban.png')"></el-image>
                            <span style="display: inline-block;margin-left: 7px;font-weight: 550;">目标模板</span>

                            <div id="targetTemplate" @mouseup="clearStartName">
                                <div style="position: absolute;top:26px;left: 34%;z-index: 1;">
                                    <el-button @click="targetStructure" size="mini" type="primary">生成目标结构</el-button>
                                    <el-button @click="clearTargetTemplate" size="mini" type="primary">清空目标模板</el-button>
                                </div>

                                <vue-json-editor v-model="targetTemplate" lang="zh" :modes="[]" :show-btns="false" :mode="'code'" :expanded-on-start="true" />
                            </div>
                            <div>
                                <el-image style="width: 17px; height: 17px;position: relative;left: 5px;top: 2px;" :src="require('../assets/jiegou.png')"></el-image>
                                <span style="display: inline-block;margin-left: 7px;font-weight: 550;">目标结构</span>

                                <div style=" overflow: auto;" @mousemove="handleDragMove" @mouseup="handleDragUpss">
                                    <el-tree :expand-on-click-node="false" id="targetTree" :style="'height: 460px;overflow:auto;min-width: 100%;font-size: 14px;'" class="treeClass" :data="targetData" :props="defaultProps" default-expand-all>
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
                                                        <span :name="index+item.value" v-if="data.value&&(typeof data.value != 'object')">{{ data.value }}</span>
                                                        <div v-if="item.children&&item.children.length>0">
                                                            <recursiontargetTree @handleDragUpIndex="handleDragUpIndexRecursion" :data="item.children" @handleDragUp="handleDragUpRecursion" @clearStartName="clearStartNameRecursion"></recursiontargetTree>
                                                        </div>
                                                        <div v-else>
                                                            <div v-if="Array.isArray(item)">
                                                                <recursiontargetTree @handleDragUpIndex="handleDragUpIndexRecursion" :data="item" @handleDragUp="handleDragUpRecursion" @clearStartName="clearStartNameRecursion"></recursiontargetTree>
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
                            </div>
                        </div>
                    </div>
                    <div style="width: 40%;border: 1px solid gray;border-left: none;" @mouseup="clearStartName">
                        <div style>
                            <el-image style="width: 17px; height: 17px;position: relative;left: 5px;top: 2px;" :src="require('../assets/guanxi.png')"></el-image>
                            <span style="display: inline-block;margin-left: 7px;font-weight: 550;">对应关系</span>
                            <el-table :data="tableData" style="width: 100%" height="820" border @selection-change="handleSelectionChange">
                                <el-table-column min-width="55" type="selection" align="center"></el-table-column>
                                <el-table-column min-width="55" type="index" align="center"></el-table-column>
                                <el-table-column label="源路径" min-width="180" align="center">
                                    <template slot-scope="scope">
                                        <el-input size="mini" :style="{ border: scope.row.sourcePathCheck ? '1px solid red' : 'none' }" @focus="fosourcePathCheck(scope.$index)" clearable v-model="scope.row.sourcePath"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column label="目标路径" min-width="180" align="center">
                                    <template slot-scope="scope">
                                        <el-input size="mini" :style="{ border: scope.row.targetPathCheck ? '1px solid red' : 'none' }" @focus="fotargetPathCheck(scope.$index)" clearable v-model="scope.row.targetPath"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column label="对应关系" min-width="120" align="center">
                                    <template slot-scope="scope">
                                        <el-select v-model="scope.row.relationShip" placeholder="请选择" clearable size="mini">
                                            <el-option v-for="item in relationShipOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="100" align="center">
                                    <template slot-scope="scope">
                                        <el-button type="danger" size="mini" @click="delShip(scope.$index)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div style="float: right;">
                                <el-button size="mini" type="primary" @click="addTableData">新增</el-button>
                                <el-button size="mini" type="danger" @click="delTableData">删除</el-button>
                                <el-button size="mini" type="success" @click="inspect">检验</el-button>
                                <el-button size="mini" type="success" @click="preview">预览</el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="信息转换" name="second">
                <div style="display: flex; width: 98%;margin: auto;height: 875px;border: 1px solid gray;">
                    <div style="width: 45%;" class="editorBottom">
                        <el-image style="width: 17px; height: 17px;position: relative;left: 5px;top: 2px;" :src="require('../assets/baowen.png')"></el-image>
                        <span style="display: inline-block;margin-left: 7px;font-weight: 550;">源报文</span>
                        <vue-json-editor v-model="messageTemplate" lang="zh" :modes="[]" :show-btns="false" :mode="'code'" :expanded-on-start="true" />
                    </div>
                    <div style="width: 10%;text-align: center; display: flex;align-items: center;justify-content: center">
                        <div>
                            <el-button size="mini" @click="importMes" type="primary" style="margin-bottom: 15px;">导入</el-button>
                            <br />
                            <el-button size="mini" @click="generateMessage" type="primary">生成报文</el-button>
                        </div>
                    </div>
                    <div style="width: 45%; " class="editorBottom1">
                        <el-image style="width: 17px; height: 17px;position: relative;left: 5px;top: 2px;" :src="require('../assets/baowen.png')"></el-image>
                        <span style="display: inline-block;margin-left: 7px;font-weight: 550;">转换后的报文</span>

                        <vue-json-editor v-model="messageedTemplate" lang="zh" :modes="[]" :show-btns="false" :mode="'code'" :expanded-on-start="true" />
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
        <div id="tooltip" style=" position: absolute;z-index: 9999; ">
            <el-select v-model="relationShip" placeholder="请选择" @change="showShip" size="mini">
                <el-option v-for="item in relationShipOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-button @click="cancelShip" size="mini" type="danger">取消</el-button>
        </div>
        <el-drawer title="预览" :visible.sync="previewDia" :wrapperClosable="true">
            <el-tabs v-model="vertActiveName" style="width: 98%;margin: auto;">
                <el-tab-pane label="预览结果" name="first" class="comDrawer">
                    <vue-json-editor v-model="previewTemplate" lang="zh" :modes="[]" :show-btns="false" :mode="'code'" :expanded-on-start="true" />
                </el-tab-pane>
                <el-tab-pane label="转换信息" name="second" class="comDrawer">
                    <vue-json-editor :key="finalTemplateKey" v-model="finalTemplate" lang="zh" :modes="[]" :show-btns="false" :mode="'code'" :expanded-on-start="true" />
                </el-tab-pane>
            </el-tabs>
            <div style="float: right;">
                <el-button size="mini" style="margin-top: 5px;margin-right: 5px;" type="primary" @click="previewDia =false">确定</el-button>
            </div>
        </el-drawer>
        <el-drawer title="转换信息" :visible.sync="importDia" :wrapperClosable="true">
            <div class="impDrawer">
                <vue-json-editor style="padding:  5px;" v-model="resultTemplate" lang="zh" :modes="[]" :show-btns="false" :mode="'code'" :expanded-on-start="true" />
            </div>
            <div style="float: right;">
                <el-button size="mini" style="margin-right: 5px;" type="primary" @click="importDia =false">确定</el-button>
            </div>
        </el-drawer>
    </div>
</template>
  <script  >
import vueJsonEditor from "vue-json-editor";
import recursionTree from "./recursionTree.vue";
import recursiontargetTree from "./recursiontargetTree.vue";
import JsonTranferUtil from "./json_transfer";
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.min.css"; // 引入样式
export default {
    components: { vueJsonEditor, recursionTree, recursiontargetTree },
    data() {
        return {
            finalTemplateKey: "finalTemplateKey",
            multipleSelection: [],
            resultTemplate: null,
            importDia: false,
            messageTemplate: null,
            messageedTemplate: null,
            conActiveName: "first",
            vertActiveName: "first",
            // sourcePathData: [],
            // targetPathData: [],
            finalTemplate: null,
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
            sourceTemplate: null,
            targetTemplate: null,
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
        handleDragUpss() {
            let body = document.body;
            if (this.upName != "") {
                body.style.cursor = "move";
            } else {
                body.style.cursor = "default";
                this.startName = "";
            }
            window._getAction1 = () => {
                return this.upName;
            };
            document
                .querySelectorAll(".el-tree-node__content")
                .forEach(function (element) {
                    // 这里对每个element做操作
                    if (window._getAction1() && window._getAction1() != "") {
                        element.style.cursor = "move";
                    } else {
                        element.style.cursor = "default";
                    }
                });
        },
        // 鼠标移动
        handleDragMove() {
            let body = document.body;
            if (this.startName != "") {
                body.style.cursor = "move";
            } else {
                body.style.cursor = "default";
            }
            window._getAction = () => {
                return this.startName;
            };
            document
                .querySelectorAll(".el-tree-node__content")
                .forEach(function (element) {
                    // 这里对每个element做操作
                    if (window._getAction() && window._getAction() != "") {
                        element.style.cursor = "move";
                    } else {
                        element.style.cursor = "default";
                    }
                });
        },
        // multipleSelection
        delTableData() {
            if (this.multipleSelection.length <= 0) {
                this.$message.error("请选择删除的数据");
                return;
            }
            this.tableData = this.tableData.filter(
                (item) =>
                    !this.multipleSelection.some((ele) => ele.id === item.id)
            );
        },
        // 对应关系多选
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        // 手动添加对应关系
        addTableData() {
            let ss = {
                sourcePath: "",
                targetPath: "",
                relationShip: 1,
                sourcePathCheck: false, //false
                targetPathCheck: false,
                id: new Date().getTime(),
            };
            this.tableData.push(ss);
        },
        // 生成报文
        generateMessage() {
            if (!this.resultTemplate) {
                this.$message.error("请导入转换信息");
                return;
            }
            try {
                let data = JSON.parse(JSON.stringify(this.messageTemplate));
                let relationshipData = JSON.parse(
                    JSON.stringify(this.resultTemplate)
                );
                let mappingdata = relationshipData.mappings;
                if (!Array.isArray(mappingdata) || mappingdata.length <= 0) {
                    this.$message.error("请导入正确的转换信息");
                    return;
                }

                let mappings = JSON.parse(JSON.stringify(mappingdata));
                // 源
                let jsonOrg = JSON.parse(JSON.stringify(data));
                // 目标
                let jsonAim = JSON.parse(
                    JSON.stringify(relationshipData.jsonAim)
                );
                let jsonTranferUtil = new JsonTranferUtil(
                    jsonOrg,
                    jsonAim,
                    mappings
                );
                // 检验
                let result = jsonTranferUtil.checkJsonMapping();
                let OrgJsonPath = [];
                let AimJsonPath = [];
                let message = "";
                result.forEach((item) => {
                    if (item.OrgMsg && item.OrgMsg != "") {
                        OrgJsonPath.push(item.mapping.OrgJsonPath);
                        message += item.OrgMsg + "，";
                    }
                    if (item.AimMsg && item.AimMsg != "") {
                        AimJsonPath.push(item.mapping.AimJsonPath);
                        message += item.AimMsg + "，";
                    }
                });
                if (OrgJsonPath.length == 0 && AimJsonPath.length == 0) {
                    this.messageedTemplate = jsonTranferUtil.tranJson();
                } else {
                    let errorMessage = message;
                    this.$message.error(
                        errorMessage.substring(0, errorMessage.length - 1)
                    );
                }
            } catch (error) {
                this.$message.error("JSON校验失败无法生成数据");
            }
        },
        // 导入转换对象
        importMes() {
            this.importDia = true;
        },
        handleDragClicks(e) {
            let nodeTextParse = e.name;
            return nodeTextParse.substring(
                nodeTextParse.lastIndexOf("["),
                nodeTextParse.lastIndexOf("]") + 1
            );
        },
        // 获取路径
        fosourcePathCheck(index) {
            this.tableData[index].sourcePathCheck = false;
        },
        fotargetPathCheck(index) {
            this.tableData[index].targetPathCheck = false;
        },

        // 复制跳转
        copyRouter() {
            if (this.tableData.length <= 0) {
                this.$message.error("清先添加对应关系");
                return;
            }
            let mappings = [];
            this.tableData.forEach((item) => {
                let ss = {};
                ss.OrgJsonPath = item.sourcePath;
                ss.AimJsonPath = item.targetPath;
                ss.TranType = item.relationShip;
                mappings.push(ss);
            });
            // 源
            let jsonOrg = this.sourceTemplate;
            // 目标
            let jsonAim = this.targetTemplate;
            this.$router.push({
                path: "/convertpage",
                query: {
                    jsonOrg: jsonOrg,
                    jsonAim: jsonAim,
                    mappings: mappings,
                },
            });
        },
        // 预览
        preview() {
            this.finalTemplate = null;
            if (this.tableData.length <= 0) {
                this.$message.error("清先添加对应关系");
                return;
            }
            this.vertActiveName = "first";
            let mappings = [];
            let flag = true;
            let data = JSON.parse(JSON.stringify(this.tableData));
            data.forEach((item) => {
                if (item.sourcePath == "" || item.targetPath == "") {
                    flag = false;
                }
                let ss = {};
                ss.OrgJsonPath = item.sourcePath;
                ss.AimJsonPath = item.targetPath;
                ss.TranType = item.relationShip;
                mappings.push(ss);
            });
            if (!flag) {
                this.$message.error("源路径或目标路径不能为空");
                return;
            }
            let mappingDeep = JSON.parse(JSON.stringify(mappings));
            // 源
            let jsonOrg = JSON.parse(JSON.stringify(this.sourceTemplate));
            // 目标
            let jsonAim = JSON.parse(JSON.stringify(this.targetTemplate));
            let jsonTranferUtil = new JsonTranferUtil(
                jsonOrg,
                jsonAim,
                mappings
            );
            let newJsonOrg = jsonTranferUtil.getSimpleOrgJson();
            // 检验
            let result = jsonTranferUtil.checkJsonMapping();
            let OrgJsonPath = [];
            let AimJsonPath = [];
            let message = "";
            result.forEach((item) => {
                if (item.OrgMsg && item.OrgMsg != "") {
                    OrgJsonPath.push(item.mapping.OrgJsonPath);
                    message += item.OrgMsg + "，";
                }
                if (item.AimMsg && item.AimMsg != "") {
                    AimJsonPath.push(item.mapping.AimJsonPath);
                    message += item.AimMsg + "，";
                }
            });
            if (OrgJsonPath.length == 0 && AimJsonPath.length == 0) {
                this.previewTemplate = jsonTranferUtil.tranJson();
                this.previewDia = true;
                this.finalTemplateKey = new Date().getTime();
                this.$nextTick(() => {
                    this.finalTemplate = {
                        jsonOrg: newJsonOrg,
                        jsonAim: jsonAim,
                        mappings: mappingDeep,
                    };
                });
            } else {
                if (OrgJsonPath.length > 0) {
                    this.tableData.forEach((item) => {
                        let a = OrgJsonPath.filter((it) => {
                            return it == item.sourcePath;
                        });
                        if (a.length > 0) {
                            item.sourcePathCheck = true;
                        }
                    });
                }
                if (AimJsonPath.length > 0) {
                    this.tableData.forEach((item) => {
                        let a = AimJsonPath.filter((it) => {
                            return it == item.targetPath;
                        });
                        if (a.length > 0) {
                            item.targetPathCheck = true;
                        }
                    });
                }
                let errorMessage = message;
                this.$message.error(
                    errorMessage.substring(0, errorMessage.length - 1)
                );
            }
        },
        // 检验
        inspect() {
            if (this.tableData.length <= 0) {
                this.$message.error("清先添加对应关系");
                return;
            }
            let mappings = [];
            let flag = true;
            this.tableData.forEach((item) => {
                if (item.sourcePath == "" || item.targetPath == "") {
                    flag = false;
                }
                let ss = {};
                ss.OrgJsonPath = item.sourcePath;
                ss.AimJsonPath = item.targetPath;
                ss.TranType = item.relationShip;
                mappings.push(ss);
            });
            if (!flag) {
                this.$message.error("源路径或目标路径不能为空");
                return;
            }
            // 源
            let jsonOrg = JSON.parse(JSON.stringify(this.sourceTemplate));
            // 目标
            let jsonAim = JSON.parse(JSON.stringify(this.targetTemplate));
            let jsonTranferUtil = new JsonTranferUtil(
                jsonOrg,
                jsonAim,
                mappings
            );
            // 检验
            let result = jsonTranferUtil.checkJsonMapping();
            let OrgJsonPath = [];
            let AimJsonPath = [];
            let message = "";
            result.forEach((item) => {
                if (item.OrgMsg && item.OrgMsg != "") {
                    OrgJsonPath.push(item.mapping.OrgJsonPath);
                    message += item.OrgMsg + "，";
                }
                if (item.AimMsg && item.AimMsg != "") {
                    AimJsonPath.push(item.mapping.AimJsonPath);
                    message += item.AimMsg + "，";
                }
            });
            if (OrgJsonPath.length == 0 && AimJsonPath.length == 0) {
                this.$message.success("校验通过");
            } else {
                if (OrgJsonPath.length > 0) {
                    this.tableData.forEach((item) => {
                        let a = OrgJsonPath.filter((it) => {
                            return it == item.sourcePath;
                        });
                        if (a.length > 0) {
                            item.sourcePathCheck = true;
                        }
                    });
                }
                if (AimJsonPath.length > 0) {
                    this.tableData.forEach((item) => {
                        let a = AimJsonPath.filter((it) => {
                            return it == item.targetPath;
                        });
                        if (a.length > 0) {
                            item.targetPathCheck = true;
                        }
                    });
                }
                let errorMessage = message;
                this.$message.error(
                    errorMessage.substring(0, errorMessage.length - 1)
                );
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
                // 检查属性是否是对象，并且不是null
                if (typeof obj[key] === "object" && obj[key] !== null) {
                    // 处理数组
                    if (Array.isArray(obj[key])) {
                        for (let i = 0; i < obj[key].length; i++) {
                            node.children.push(
                                this.generateTree(
                                    obj[key][i],
                                    `${currentPath}[${i}]`
                                )
                            );
                        }
                    } else {
                        // 处理对象，递归调用生成子树
                        node.children = this.generateTree(
                            obj[key],
                            currentPath
                        );
                    }
                    // 如果没有子元素，就删除children这个属性
                    if (node.children.length === 0) {
                        delete node.children;
                    }
                }
                // 将节点添加到树中
                tree.push(node);
            }
            return tree;
        },
        clearStartName() {
            this.startName = "";
            let body = document.body;
            body.style.cursor = "default";
        },
        // 鼠标按下事件
        handleDragStart(e) {
            this.startName = e.target.getAttribute("name");
        },
        // 源结构索引拖动
        handleDragStartIndex(e) {
            let nodeText = e.target.getAttribute("name");
            let nodeTextParse = JSON.parse(nodeText).name;
            this.startName = nodeTextParse.substring(
                0,
                nodeTextParse.lastIndexOf(".")
            );
        },
        // 目标结构索引拖动
        handleDragUpIndex(e) {
            if (this.startName != "") {
                let nodeText = e.target.getAttribute("name");
                let nodeTextParse = JSON.parse(nodeText).name;
                this.upName = nodeTextParse.substring(
                    0,
                    nodeTextParse.lastIndexOf(".")
                );
                var tooltip = document.getElementById("tooltip");
                tooltip.style.left = e.pageX + 10 + "px"; // 鼠标位置右偏10像素
                tooltip.style.top = e.pageY + 10 + "px"; // 鼠标位置下偏10像素
                this.relationShip = "";
            }
        },
        handleDragUpIndexRecursion(e, event) {
            if (this.startName != "") {
                this.upName = e;
                var tooltip = document.getElementById("tooltip");
                tooltip.style.left = event.pageX + 10 + "px"; // 鼠标位置右偏10像素
                tooltip.style.top = event.pageY + 10 + "px"; // 鼠标位置下偏10像素
                this.relationShip = "";
            }
        },
        handleDragStartIndexRecursion(e) {
            this.startName = e;
        },
        handleDragStartRecursion(e) {
            this.startName = e.target.getAttribute("name");
        },
        clearStartNameRecursion() {
            this.startName = "";
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
        handleDragUpRecursion(e) {
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
            // let mappings = [];
            // this.tableData.forEach((item) => {
            //     let ss = {};
            //     ss.OrgJsonPath = item.sourcePath;
            //     ss.AimJsonPath = item.targetPath;
            //     ss.TranType = item.relationShip;
            //     mappings.push(ss);
            // });
            // // 源
            // let jsonOrg = this.sourceTemplate;
            // // 目标
            // let jsonAim = this.targetTemplate;
            // this.finalTemplate = {
            //     jsonOrg: jsonOrg,
            //     jsonAim: jsonAim,
            //     mappings: mappings,
            // };
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
                sourcePathCheck: false, //false
                targetPathCheck: false,
                id: new Date().getTime(),
            };
            this.tableData.push(ss);
            this.cancelShip();
            // let mappings = [];
            // this.tableData.forEach((item) => {
            //     let ss = {};
            //     ss.OrgJsonPath = item.sourcePath;
            //     ss.AimJsonPath = item.targetPath;
            //     ss.TranType = item.relationShip;
            //     mappings.push(ss);
            // });
            // // 源
            // let jsonOrg = this.sourceTemplate;
            // // 目标
            // let jsonAim = this.targetTemplate;
            // this.finalTemplate = {
            //     jsonOrg: jsonOrg,
            //     jsonAim: jsonAim,
            //     mappings: mappings,
            // };
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
            try {
                JSON.parse(this.sourceTemplate);
                this.$message.success("JSON校验成功");
            } catch (error) {
                this.$message.error("JSON校验失败");
            }
        },
        // 判断路径是否在对象上
        isPathInObject(obj, path) {
            const parts = path.replace(/\[(\w+)\]/g, ".$1").split("."); // 将索引转换为点分隔
            let current = obj;

            for (let i = 0; i < parts.length; i++) {
                if (current[parts[i]] === undefined) {
                    return false;
                }
                current = current[parts[i]];
            }

            return true;
        },
        // 源生成结构
        sourceStructure() {
            try {
                let data = { root: this.sourceTemplate };
                this.sourceData = this.generateTree(data, "");
                this.finalTemplate = null;
                // setTimeout(() => {
                if (
                    this.tableData &&
                    this.tableData.length > 0 &&
                    this.sourceTemplate
                ) {
                    this.tableData.forEach((item) => {
                        if (item.sourcePath == "root") {
                            item.sourcePathCheck = false;
                        } else {
                            let newPath = JSON.parse(
                                JSON.stringify(item.sourcePath)
                            );
                            let newPaths = newPath.replace(/\[\*\]/g, "[0]");
                            newPaths = newPaths.substring(5);
                            let flag = this.isPathInObject(
                                this.sourceTemplate,
                                newPaths
                            );
                            if (flag == false) {
                                item.sourcePathCheck = true;
                            } else {
                                item.sourcePathCheck = false;
                            }
                        }
                    });
                }
                // }, 100);
            } catch (error) {
                this.$message.error("JSON校验失败无法生成结构");
            }
        },
        // 源清空
        clearSourceTemplate() {
            this.sourceTemplate = null;
        },
        // 目标模板格式化
        targetFormatCode() {
            try {
                JSON.parse(this.targetTemplate);
                this.$message.success("JSON校验成功");
            } catch (error) {
                this.$message.error("JSON校验失败");
            }
        },
        // 目标生成结构
        targetStructure() {
            try {
                let data = { root: this.targetTemplate };
                this.targetData = this.generateTree(data, "");
                this.finalTemplate = null;
                // setTimeout(() => {
                if (
                    this.tableData &&
                    this.tableData.length > 0 &&
                    this.targetTemplate
                ) {
                    this.tableData.forEach((item) => {
                        if (item.targetPath == "root") {
                            item.targetPathCheck = false;
                        } else {
                            let newPath = JSON.parse(
                                JSON.stringify(item.targetPath)
                            );
                            let newPaths = newPath.replace(/\[\*\]/g, "[0]");
                            newPaths = newPaths.substring(5);
                            let flag = this.isPathInObject(
                                this.targetTemplate,
                                newPaths
                            );
                            if (flag == false) {
                                item.targetPathCheck = true;
                            } else {
                                item.targetPathCheck = false;
                            }
                        }
                    });
                }
                // }, 100);
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
    height: 150%;
}
.treeClass {
    display: inline-block;
}
::v-deep #sourceTemplate .jsoneditor-vue {
    height: 350px !important;
}
::v-deep #sourceTemplate .ace-jsoneditor {
    height: 310px !important;
}
::v-deep #targetTemplate .jsoneditor-vue {
    height: 350px !important;
}
::v-deep #targetTemplate .ace-jsoneditor {
    height: 310px !important;
}
::v-deep .comDrawer .jsoneditor-vue {
    height: 760px !important;
}
::v-deep .comDrawer .ace-jsoneditor {
    height: 720px !important;
}
::v-deep .impDrawer .jsoneditor-vue {
    height: 820px !important;
}
::v-deep .impDrawer .ace-jsoneditor {
    height: 780px !important;
}

::v-deep .editorBottom .jsoneditor-vue {
    height: 860px !important;
}
::v-deep .editorBottom .ace-jsoneditor {
    height: 810px !important;
}
::v-deep .editorBottom1 .jsoneditor-vue {
    height: 860px !important;
}
::v-deep .editorBottom1 .ace-jsoneditor {
    height: 810px !important;
}

::v-deep .jsoneditor-poweredBy {
    display: none;
}
.structureStyle {
    background-color: #eeeeee;
}
::v-deep .el-tree .el-tree-node__content {
    cursor: default; // 或者设置为你想要的其他样式
}
</style>
  