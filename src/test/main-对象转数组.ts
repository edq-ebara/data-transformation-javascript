
import JsonTranferUtil from '../json_transfer'



/************************数组转对象   示例数据 ********************** */





/// 转换类型
/// 1：源Key->目标Key
/// 2：源Key->目标Value
/// 3：源Value->目标Key
/// 4：源Value->目标Value
const mappings = [
  {
    "AimJsonPath": "root.dev",
    "OrgJsonPath": "root.dev",
    "TranType": 4,
    "Options": {
      "KeyInitIndex": 100,
      "AddElementsOption": 2,
      "TranOP": 2,
      "TranWay": 1
    }
  },
  {
    "AimJsonPath": "root.dev[*].id",
    "OrgJsonPath": "root.dev.*",
    "TranType": 2,
    "Options": {
      "KeyInitIndex": 100,
      "AddElementsOption": 1,
      "TranOP": 1,
      "TranWay": 2
    }
  },
  {
    "AimJsonPath": "root.dev[*].pro",
    "OrgJsonPath": "root.dev.*",
    "TranType": 4,
    "Options": {
      "KeyInitIndex": 100,
      "AddElementsOption": 1,
      "TranOP": 1,
      "TranWay": 1
    }
  },
  {
    "AimJsonPath": "root.dev[*].pro",
    "OrgJsonPath": "root.dev.*",
    "TranType": 4,
    "Options": {
      "KeyInitIndex": 100,
      "AddElementsOption": 1,
      "TranOP": 2,
      "TranWay": 2
    }
  },
  {
    "AimJsonPath": "root.dev[*].pro[*].n",
    "OrgJsonPath": "root.dev.*.*",
    "TranType": 2,
    "Options": {
      "KeyInitIndex": 100,
      "AddElementsOption": 1,
      "TranOP": 1,
      "TranWay": 2
    }
  },
  {
    "AimJsonPath": "root.dev[*].pro[*].v",
    "OrgJsonPath": "root.dev.*.*",
    "TranType": 4,
    "Options": {
      "KeyInitIndex": 100,
      "AddElementsOption": 1,
      "TranOP": 1,
      "TranWay": 2
    }
  },
  {
    "AimJsonPath": "root.dev[*].et",
    "OrgJsonPath": "#Time#",
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
}
  ;

const jsonAim = {
  "dev": [{
    "id": "0001",
    "pro": [{
      "id": "",
      "n": "11",
      "dt": "",
      "v": "1.1",
      "q": ""
    }],
    "et": "22222222"
  },{
    "id": "0001",
    "pro": [{
      "id": "",
      "n": "11",
      "dt": "",
      "v": "1.1",
      "q": ""
    }],
    "et": "22222222"
  },{
    "id": "0001",
    "pro": [{
      "id": "",
      "n": "11",
      "dt": "",
      "v": "1.1",
      "q": ""
    }],
    "et": "22222222"
  }]
}
  ;



/*******************数组转对象    测试程序***************** */



let jsonTranferUtil = new JsonTranferUtil(jsonOrg, jsonAim, mappings);

let result = jsonTranferUtil.tranJson();


console.log("*************************最终转换结果*********************************")

console.log(result, 9999999999999)

