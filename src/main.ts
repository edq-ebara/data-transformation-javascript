
import { buildJsonMapping, transJson } from './json_transfer_min'



/************************数组转对象   示例数据 ********************** */


/// 转换类型
/// 1：源Key->目标Key
/// 2：源Key->目标Value
/// 3：源Value->目标Key
/// 4：源Value->目标Value
const mappings = [
  {
    "AimJsonPath": "dev_aim",
    "OrgJsonPath": "dev_org",
    "TranType": 4
  },
  {
    "AimJsonPath": "dev_aim[*].value_aim",
    "OrgJsonPath": "dev_org[*].value_org",
    "TranType": 1
  },
  {
    "AimJsonPath": "dev_aim[*].value_aim",
    "OrgJsonPath": "dev_org[*].value_org",
    "TranType": 4
  },
  {
    "AimJsonPath": "dev_aim[*].value_aim.key",
    "OrgJsonPath": "dev_org[*].value_org.key",
    "TranType": 3
  },
  {
    "AimJsonPath": "dev_aim[*].value_aim.key",
    "OrgJsonPath": "dev_org[*].value_org.key",
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

const jsonOrg = {
  "dev_org": [{
    "value_org": {
      "key": "111_org",
      "value": "122_org",
    }
  },
  {
    "value_org": {
      "key": "211_org",
      "value": "222_org",
    }
  }
  ],
  "time_org": 1682471111
};

const jsonAim = {
  "dev_aim": [{
    "value_aim": {
      "key": "111_aim",
      "value": "122_aim",
      "other":"444"
    }
  }
  ],
  "time_aim": 1682472222
};




/*******************数组转对象    测试程序***************** */


console.log("*************************构建前的Mappings*********************************")

console.log(JSON.parse(JSON.stringify(mappings)), 1001)

console.log("*************************构建前的Aims*********************************")

console.log(JSON.parse(JSON.stringify(jsonAim)), 1002)

buildJsonMapping(jsonOrg, jsonAim, "", jsonAim, mappings);


console.log("*************************构建后的Mappings*********************************")

console.log(JSON.parse(JSON.stringify(mappings)), 1003)

console.log("*************************构建后的Aims*********************************")

console.log(JSON.parse(JSON.stringify(jsonAim)), 1004)



let jsonOrgNew = JSON.parse(JSON.stringify(jsonOrg));
let jsonAimNew = JSON.parse(JSON.stringify(jsonAim));
let mappingsNew = JSON.parse(JSON.stringify(mappings));


transJson(jsonOrgNew, jsonAimNew, "", jsonAimNew, mappingsNew)


console.log("*************************转换后的Mappings*********************************")

console.log(JSON.parse(JSON.stringify(mappingsNew)), 1005)

console.log("*************************转换后的Aims*********************************")

console.log(JSON.parse(JSON.stringify(jsonAimNew)), 1006)



