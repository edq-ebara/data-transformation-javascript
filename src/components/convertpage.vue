
<template>
    <div>
        <div style="display: flex;width: 98%;margin: auto;">
            <div style="width: 25%;" class="editorTop">
                转换信息
                <vue-json-editor  v-model="resultTemplate" lang="zh"  @json-change="resultStructure" :modes="[]" :show-btns="false" :mode="'code'"  :expanded-on-start="true"  />
            </div>
            <div style="width: 25%;"  class="editorTopView">
                源数据
                <vue-json-editor  v-model="jsonOrg" lang="zh"    :modes="[]" :show-btns="false" :mode="'view'"  :expanded-on-start="true"  />
            </div>
            <div style="width: 25%;"  class="editorTopView">
                目标数据
                <vue-json-editor  v-model="jsonAim" lang="zh"    :modes="[]" :show-btns="false" :mode="'view'"  :expanded-on-start="true"  />
            </div>
            <div style="width: 25%;"  class="editorTopView">
                对应关系
                <vue-json-editor  v-model="mappings" lang="zh"    :modes="[]" :show-btns="false" :mode="'view'"  :expanded-on-start="true"  />
            </div>
        </div>
        <div style="display: flex;width: 98%;margin: auto;">
          <div style="width: 45%;" class="editorBottom">
            源报文
            <vue-json-editor  v-model="messageTemplate" lang="zh"   :modes="[]" :show-btns="false" :mode="'code'"  :expanded-on-start="true"  />
          </div>
          <div style="width: 10%;text-align: center; display: flex;align-items: center;justify-content: center">
            <el-button   size="mini" @click="generateMessage" type="primary">生成报文</el-button>
          </div>
          <div style="width: 45%;" class="editorBottom1">
            转换后的报文
            <vue-json-editor  v-model="messageedTemplate" lang="zh"    :modes="[]" :show-btns="false" :mode="'view'"  :expanded-on-start="true"  />
          </div>
        </div>
    </div>
</template>

<script>
import JsonTranferUtil from "./json_transfer";
import vueJsonEditor from "vue-json-editor";
export default {
    name: "convertpage",
    components: {vueJsonEditor},
    data() {
        return {
            showNumber: true,
            lint: true,
            readonly: false,
            wrap: true,
            theme: "idea",
            resultTemplate: null,
            jsonOrg: null,
            jsonAim: null,
            mappings: null,
            messageTemplate: null,
            messageedTemplate: null,
        };
    },
    computed: {},
    created() {},
    mounted() {
        this.resultTemplate = this.$route.query;
        let data = JSON.parse(JSON.stringify(this.resultTemplate)) 
        this.jsonOrg = data.jsonOrg 
        this.jsonAim = data.jsonAim
        this.mappings = data.mappings
    },
    methods: {
      // 生成报文
      generateMessage(){
        try {
          let data  = this.messageTemplate;
          let mappingdata =this.mappings
          if(!Array.isArray(mappingdata)||mappingdata.length<=0){
            this.$message.error("请输入正确的对应关系")
            return
          }

          let mappings = JSON.parse(JSON.stringify(mappingdata)) 
            // 源
            let jsonOrg =  JSON.parse(JSON.stringify(data)); 
            // 目标
            let jsonAim = JSON.parse(JSON.stringify(this.jsonAim));
            let jsonTranferUtil = new JsonTranferUtil(
                jsonOrg,
                jsonAim,
                mappings
            );
            // 检验
            let result = jsonTranferUtil.checkJsonMapping();
            // 生成
            if (result.IsSuccess) {
              this.messageedTemplate=jsonTranferUtil.tranJson()
            } else {
                this.$message.error(result.Msg);
            }
           
          } catch (error) {
              this.$message.error("JSON校验失败无法生成数据");
          }
      },
      // 报文
      resultedStructure(val){
        try {
          this.messageTemplate = JSON.parse(val); 
         
            } catch (error) {
                this.$message.error("JSON校验失败无法生成数据");
            }
      },
      // 转换信息修改
        resultStructure(val) {
            try {
                let data = val;
                this.jsonOrg = data.jsonOrg 
                this.jsonAim = data.jsonAim
                this.mappings = data.mappings
            } catch (error) {
                this.$message.error("JSON校验失败无法生成数据");
            }
        },
    },
};
</script>
<style scoped lang='scss'>
// .editor {
//     height: 400px !important;
// }
// .editordowm{
//   height: 490px !important;
// }

::v-deep .editorTop .jsoneditor-vue{
    height: 440px !important;
}
::v-deep .editorTop .ace-jsoneditor{
    height: 400px !important;
}
::v-deep .editorTopView .jsoneditor-outer{
    height: 403px !important;
}





::v-deep .editorBottom .jsoneditor-vue{
    height: 450px !important;
}
::v-deep .editorBottom .ace-jsoneditor{
    height: 410px !important;
}
::v-deep .editorBottom1 .jsoneditor-outer{
    height: 413px !important;
}
::v-deep .jsoneditor-poweredBy {
    display: none;
}






</style>