
// import JsonTranferUtil from './json_transfer'
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
      "KeyInitIndex": 90,
      "AddElementsOption": "2", 
      "TranOP": "2",  
      "TranWay": "2" 
    }
  },
  {
    "AimJsonPath": "root.dev.642fccd1",
    "OrgJsonPath": "root.dev[*].id",
    "TranType": 3,
    "Options": {
      "KeyInitIndex": 0,
      "AddElementsOption": "1",  
      "TranOP": "1",  
      "TranWay": "2" 
    }
  },

  {
    "AimJsonPath": "root.dev.642fccd1",
    "OrgJsonPath": "root.dev[*].pro",
    "TranType": 4,
    "Options": {
      "KeyInitIndex": 30,
      "AddElementsOption": "1",  
      "TranOP": "2",  
      "TranWay": "2" 
    }
  },
  {
    "AimJsonPath": "root.dev.642fccd1",
    "OrgJsonPath": "root.dev[*].pro",
    "TranType": 4,
    "Options": {
      "KeyInitIndex": 30,
      "AddElementsOption": "1",  
      "TranOP": "1",  
      "TranWay": "1" 
    }
  },
  {
    "AimJsonPath": "root.dev.642fccd1.1", 
    "OrgJsonPath": "root.dev[*].pro[*].n",
    "TranType": 3,
    "Options": {
      "KeyInitIndex": 90,
      "AddElementsOption": "1", 
      "TranOP": "1", 
      "TranWay": "2" 
    }
  },
  {
    "AimJsonPath": "root.dev.642fccd1.1",
    "OrgJsonPath": "root.dev[*].pro[*].v",
    "TranType": 4,
    "Options": {
      "KeyInitIndex": 40,
      "AddElementsOption": "1",  
      "TranOP": "1",  
      "TranWay": "2"
    }
  },
  {
    "AimJsonPath": "root.dev.642fccd1.1",
    "OrgJsonPath": "root.dev[*].pro[*].v",
    "TranType": 4,
    "Options": {
      "KeyInitIndex": 40,
      "AddElementsOption": "1",  
      "TranOP": "1",  
      "TranWay": "1" 
    }
  },
  {
    "AimJsonPath": "root.time",
    "OrgJsonPath": "#Time#",
    "TranType": 4
  },
];

const jsonOrg = {
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
    },
    {
      "id": "",
      "n": "133",
      "dt": "",
      "v": "1.3",
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
}
  ;

const jsonAim = {
  "dev": {
    "642fccd1": {
      "1": "111",
      "2": "222",
    }
  },
  "time": 1682476529
}
  ;




/*******************数组转对象    测试程序***************** */



let jsonTranferUtil = new JsonTranferUtil(jsonOrg, jsonAim, mappings);

let result = jsonTranferUtil.tranJson();


console.log("*************************最终转换结果*********************************")

console.log(result, 9999999999999)

