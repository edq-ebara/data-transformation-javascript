
import JsonTranferUtil from './源文件/json_transfer'



/************************数组转数组   示例数据 ********************** */


/// 转换类型
/// 1：源Key->目标Key
/// 2：源Key->目标Value
/// 3：源Value->目标Key
/// 4：源Value->目标Value
const mappings = [
  {
    "AimJsonPath": "root.dev_aim",
    "OrgJsonPath": "root.dev_org",
    "TranType": 4
  },
  {
    "AimJsonPath": "root.dev_aim[*].value_aim",
    "OrgJsonPath": "root.dev_org[*].value_org",
    "TranType": 1
  },
  {
    "AimJsonPath": "root.dev_aim[*].value_aim",
    "OrgJsonPath": "root.dev_org[*].value_org",
    "TranType": 4
  },
  {
    "AimJsonPath": "root.dev_aim[*].value_aim.key",
    "OrgJsonPath": "root.dev_org[*].value_org.key",
    "TranType": 3
  },
  {
    "AimJsonPath": "root.dev_aim[*].value_aim.key",
    "OrgJsonPath": "root.dev_org[*].value_org.key",
    "TranType": 4
  },

  {
    "AimJsonPath": "root.time_aim",
    "OrgJsonPath": "root.time_org",
    "TranType": 1
  },
  {
    "AimJsonPath": "root.time_aim",
    "OrgJsonPath": "root.time_org",
    "TranType": 4
  },
];

const jsonOrg={
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
  }
;

const jsonAim =  {
    "dev_aim": [{
      "value_aim": {
        "key": "111_aim",
        "value": "122_aim",
        "other": "444"
      }
    }
    ],
    "time_aim": 1682472222
  }
;




/*******************数组转数组    测试程序***************** */



let jsonTranferUtil = new JsonTranferUtil(jsonOrg, jsonAim, mappings);

let result = jsonTranferUtil.checkJsonMapping();


console.log("*************************最终检查结果*********************************")

console.log(result, 88888888888)

