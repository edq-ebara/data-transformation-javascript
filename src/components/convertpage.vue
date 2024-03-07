
<template>
    <div>
        <div style="display: flex;">
            <div style="width: 25%;">
                转换信息
                <b-code-editor class="editor" v-model="resultTemplate" :theme="theme" :auto-format="false" ref="resultEditor" :show-number="showNumber" :readonly="readonly" :lint="lint" @on-change="resultStructure" />
            </div>
            <div style="width: 25%;">
                源数据
                <b-code-editor class="editor" v-model="jsonOrg" :theme="theme" :auto-format="false" ref="jsonOrgEditor" :show-number="showNumber" :readonly="true" :lint="lint" />
            </div>
            <div style="width: 25%;">
                目标数据
                <b-code-editor class="editor" v-model="jsonAim" :theme="theme" :auto-format="false" ref="jsonAimEditor" :show-number="showNumber" :readonly="true" :lint="lint" />
            </div>
            <div style="width: 25%;">
                对应关系
                <b-code-editor class="editor" v-model="mappings" :theme="theme" :auto-format="false" ref="mappingsEditor" :show-number="showNumber" :readonly="true" :lint="lint" />
            </div>
        </div>
        <div style="display: flex;">
          <div style="width: 45%;">
            源报文
            <b-code-editor class="editordowm" v-model="messageTemplate" :theme="theme" :auto-format="true" ref="messageEditor" :show-number="showNumber" :readonly="readonly" :lint="lint"  @on-change="resultedStructure" />
          </div>
          <div style="width: 10%;text-align: center;">
            <el-button   size="mini" @click="generateMessage" type="primary">生成报文</el-button>
          </div>
          <div style="width: 45%;">
            转换后的报文
            <b-code-editor class="editordowm" v-model="messageedTemplate" :theme="theme" :auto-format="false" ref="messageedEditor" :show-number="showNumber" :readonly="false" :lint="lint"   />
          </div>
        </div>
    </div>
</template>

<script>
import JsonTranferUtil from "./json_transfer";
export default {
    name: "convertpage",
    components: {},
    data() {
        return {
            showNumber: true,
            lint: true,
            readonly: false,
            wrap: true,
            theme: "idea",
            resultTemplate: JSON.stringify({}),
            jsonOrg: JSON.stringify({}),
            jsonAim: JSON.stringify({}),
            mappings: JSON.stringify({}),
            messageTemplate: JSON.stringify({}),
            messageedTemplate: JSON.stringify({}),
        };
    },
    computed: {},
    created() {},
    mounted() {
        this.resultTemplate = JSON.stringify(this.$route.query);

        setTimeout(() => {
            this.$refs["resultEditor"].formatCode();
        }, 200);
    },
    methods: {
      // 生成报文
      generateMessage(){
        try {
          let data  = JSON.parse(this.messageTemplate);
          let mappingdata = JSON.parse(this.mappings)
          if(!Array.isArray(mappingdata)||mappingdata.length<=0){
            this.$message.error("请输入正确的对应关系")
            return
          }

          let mappings =  mappingdata
            // 源
            let jsonOrg = data;
            // 目标
            let jsonAim = JSON.parse(this.jsonAim);
            let jsonTranferUtil = new JsonTranferUtil(
                jsonOrg,
                jsonAim,
                mappings
            );
            // 检验
            let result = jsonTranferUtil.checkJsonMapping();
            // 生成
            if (result.IsSuccess) {
              this.messageedTemplate=JSON.stringify(
                    jsonTranferUtil.tranJson()
                )
                setTimeout(() => {
                    this.$refs["messageedEditor"].formatCode();
                }, 200);
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
                let data = JSON.parse(val);
                this.jsonOrg = JSON.stringify(
                  data.jsonOrg ? data.jsonOrg : {}
                );
                this.jsonAim = JSON.stringify(
                  data.jsonAim ? data.jsonAim : {}
                );
                this.mappings = JSON.stringify(
                  data.mappings ? data.mappings : {}
                );
                setTimeout(() => {
                    this.$refs["jsonOrgEditor"].formatCode();
                    this.$refs["jsonAimEditor"].formatCode();
                    this.$refs["mappingsEditor"].formatCode();
                }, 300);
            } catch (error) {
                this.$message.error("JSON校验失败无法生成数据");
            }
        },
    },
};
</script>
<style scoped lang='scss'>
.editor {
    height: 400px !important;
}
.editordowm{
  height: 490px !important;
}
</style>