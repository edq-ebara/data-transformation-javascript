
import {buildJsonMapping,transJson} from './json_transfer'



/************************数组转对象   示例数据 ********************** */


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
    "AimJsonPath": "dev.642fccd1",
    "OrgJsonPath": "dev[*].id",
    "TranType": 3
  },
  {
    "AimJsonPath": "dev.642fccd1",
    "OrgJsonPath": "dev[*].pro",
    "TranType": 4
  },
  {
    "AimJsonPath": "dev.642fccd1.1",
    "OrgJsonPath": "dev[*].pro[*].n",
    "TranType": 3
  },
  {
    "AimJsonPath": "dev.642fccd1.1",
    "OrgJsonPath": "dev[*].pro[*].v",
    "TranType": 4
  },
  {
    "AimJsonPath": "time",
    "OrgJsonPath": "dev[1].et",
    "TranType": 4
  },
];

const jsonOrg= {
  "dev": [{
    "id": "0001",
    "pro": [{
      "id": "",
      "n": "111",
      "dt": "",
      "v": "1.1",
      "q": ""
    },
    {
      "id": "",
      "n": "122",
      "dt": "",
      "v": "1.2",
      "q": ""
    }],
    "et": "7777"
  }, {
    "id": "0002",
    "pro": [{
      "id": "",
      "n": "211",
      "dt": "",
      "v": "2.1",
      "q": ""
    }, {
      "id": "",
      "n": "222",
      "dt": "",
      "v": "2.2",
      "q": ""
    }],
    "et": "666"
  }]
};

const jsonAim = {
  "dev": {
    "642fccd1": {
      "1": "111",
      "2": "222",
    }
  },
  "time": 1682476529
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



