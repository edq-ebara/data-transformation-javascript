
import {buildJsonMapping,transJson} from './json_transfer'


/************************对象转数组   示例数据 ********************** */


/// 转换类型
/// 1：源Key->目标Key
/// 2：源Key->目标Value
/// 3：源Value->目标Key
/// 4：源Value->目标Value
const mappings = [
  {
    "AimJsonPath": "dev",
    "OrgJsonPath": "dev",
    "TranType": 4
  },
  {
    "AimJsonPath": "dev[*].id",
    "OrgJsonPath": "dev.*",
    "TranType": 2
  },
  {
    "AimJsonPath": "dev[*].pro",
    "OrgJsonPath": "dev.*",
    "TranType": 4
  },
  {
    "AimJsonPath": "dev[*].pro[*].n",
    "OrgJsonPath": "dev.*.*",
    "TranType": 2
  },
  {
    "AimJsonPath": "dev[*].pro[*].v",
    "OrgJsonPath": "dev.*.*",
    "TranType": 4
  },
  {
    "AimJsonPath": "dev[*].et",
    "OrgJsonPath": "time",
    "TranType": 4
  },
];


const jsonOrg = {
  "dev": {
    "642fccd1": {
      "1": "111",
      "2": "122",
    },
    "642fccd2": {
      "1": "211",
      "2": "222",
    },
    "642fccd3": {
      "1": "311",
      "2": "322",
    },
    "642fccd4": {
      "1": "411",
      "2": "422",
    }
  },
  "time": 1682476529
};

const jsonAim = {
  "dev": [{
    "id": "0001",
    "pro": [{
      "id": "",
      "n": "11",
      "dt": "",
      "v": "1.1",
      "q": ""
    }, {
      "id": "",
      "n": "12",
      "dt": "",
      "v": "1.2",
      "q": ""
    }],
    "et": "22222222"
  }, {
    "id": "0002",
    "pro": [{
      "id": "",
      "n": "21",
      "dt": "",
      "v": "2.1",
      "q": ""
    }, {
      "id": "",
      "n": "22",
      "dt": "",
      "v": "2.2",
      "q": ""
    }],
    "et": "22222222"
  }]
};



/*******************对象转数组    测试程序***************** */

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



