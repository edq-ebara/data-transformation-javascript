##目录介绍##
src
--源文件 //主要用于备份用，开发时的过程产物及最新版本的备份
	--main-lodash.ts  引用了lodash库（json_transfer.ts的备份）
	--main-jsonpath.ts 引用了jsonpath库
--json_transfer.ts Json转换的核心脚本，内容通过main-loadsh.ts
--main.ts 当前程序启动脚本，可从main-*****.ts中复制相应内容运行不同案例
--main-对象转对象.ts 提供了对象转对象的案例
--main-对象转数组.ts 提供了对象转数组的案例
--main-数组转对象.ts 提供了数组转对象的案例
--main-数组转数组.ts 提供了数组转数组的案例

##压缩混淆核心脚本##
terser ./src/json_transfer.ts -o ./src/json_transfer_min.ts  


##进度介绍##
目前工具类测试常规的json结构转换，可能存在测试不到位的情况
json_transfer库中尽量避免了对第三方的类库的依赖，同时由于第三方类库中不支持数字开头的变量，所以再此类库中针对路径采用了自定义方法，可能存在问题


##核心类库的介绍##

json_transfer主要对外公开了两个方法：

/**
*通过源Json（jOrg）和目标Json（jAim）以及设定的Mappings(mappings) 从目标的根（jAimCur）路径（jAimCurPath，默认为""）开始构建完成的mappings
*此方法除了会构建完整的mapping，还会依据源Json去重构目标Json
*/
buildJsonMapping = (jOrg, jAim, jAimCurPath, jAimCur, mappings) 

/**
*依据构建好的Mappings进行源Json像目标Json的转换
*jOrg、jAim、mappings 传入时一定要深复制(如： jsonOrgNew = JSON.parse(JSON.stringify(jsonOrg));)，避免因为引用造成出错
*转换的过程中会同时更改Mapping和目标Json
*/
transJson = (jOrg, jAim, jAimCurPath, jAimCur, mappings)



##案例的介绍##

///mappings即Json源像Json目标的映射关系
/// 转换类型（TranType）
/// 1：源Key->目标Key
/// 2：源Key->目标Value
/// 3：源Value->目标Key
/// 4：源Value->目标Value
const mappings = [
  {
    "AimJsonPath": "dev_aim",//这是目标路径
    "OrgJsonPath": "dev_org",//这是源路径
    "TranType": 1//这是转换类型 1：源Key->目标Key 2：源Key->目标Value 3：源Value->目标Key  4：源Value->目标Value
  },
  {
    "AimJsonPath": "dev_aim.642fccd1_aim",
    "OrgJsonPath": "dev_org.642fccd1_org",
    "TranType": 1
  },
  {
    "AimJsonPath": "dev_aim.642fccd1_aim.1_aim",
    "OrgJsonPath": "dev_org.642fccd1_org.1_org",
    "TranType": 1
  },
  {
    "AimJsonPath": "dev_aim.642fccd1_aim.1_aim",
    "OrgJsonPath": "dev_org.642fccd1_org.1_org",
    "TranType": 4
  },
  {
    "AimJsonPath": "dev_aim.642fccd1_aim.2_aim",
    "OrgJsonPath": "dev_org.642fccd1_org.2_org",
    "TranType": 3
  },
  {
    "AimJsonPath": "dev_aim.642fccd1_aim.2_aim",
    "OrgJsonPath": "dev_org.642fccd1_org.2_org",
    "TranType": 4
  },
  {
    "AimJsonPath": "time_aim",
    "OrgJsonPath": "time_org",
    "TranType": 1
  },
  {
    "AimJsonPath": "time_aim",
    "OrgJsonPath": "time_org",
    "TranType": 4
  },
];

///这是Json源
const jsonOrg= {
  "dev_org": {
    "642fccd1_org": {
      "1_org": "111_org",
      "2_org": "222_org",
    }
  },
  "time_org": 1682471111
};

///这是Json目标
const jsonAim = {
  "dev_aim": {
    "642fccd1_aim": {
      "1_aim": "111_aim",
      "2_aim": "222_aim",
    }
  },
  "time_aim": 1682472222
};

//调用 buildJsonMapping 构建完整的mappings并构建jsonAim
buildJsonMapping(jsonOrg, jsonAim, "", jsonAim, mappings);

//深复制jsonOrg、jsonAim、mappings
let jsonOrgNew = JSON.parse(JSON.stringify(jsonOrg));
let jsonAimNew = JSON.parse(JSON.stringify(jsonAim));
let mappingsNew = JSON.parse(JSON.stringify(mappings));

//调用 transJson 依据新的目标Json和Mappings进行转换
transJson(jsonOrgNew, jsonAimNew, "", jsonAimNew, mappingsNew)