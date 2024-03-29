
// import JsonTranferUtil from './json_transfer'
import JsonTranferUtil from '../json_transfer'


/************************对象转对象   示例数据 ********************** */



/// 转换类型
/// 1：源Key->目标Key
/// 2：源Key->目标Value
/// 3：源Value->目标Key
/// 4：源Value->目标Value
const mappings = [
  {
    "AimJsonPath": "root.dev_aim",
    "OrgJsonPath": "root.dev_org",
    "TranType": 1
  },
  {
    "AimJsonPath": "root.dev_aim.642fccd1_aim",
    "OrgJsonPath": "root.dev_org.642fccd1_org",
    "TranType": 1
  },
  {
    "AimJsonPath": "root.dev_aim.642fccd1_aim.1_aim",
    "OrgJsonPath": "root.dev_org.642fccd1_org.1_org",
    "TranType": 1
  },
  {
    "AimJsonPath": "root.dev_aim.642fccd1_aim.1_aim",
    "OrgJsonPath": "root.dev_org.642fccd1_org.1_org",
    "TranType": 4
  },
  {
    "AimJsonPath": "root.dev_aim.642fccd1_aim.2_aim",
    "OrgJsonPath": "root.dev_org.642fccd1_org.2_org",
    "TranType": 3
  },
  {
    "AimJsonPath": "root.dev_aim.642fccd1_aim.2_aim",
    "OrgJsonPath": "root.dev_org.642fccd1_org.2_org",
    "TranType": 4
  },
  {
    "AimJsonPath": "root.time_aim",
    "OrgJsonPath": "root.time_org",
    "TranType": 1
  },
  {
    "AimJsonPath": "root.time_aim",
    "OrgJsonPath": "#Time#",
    "TranType": 4
  },
];

const jsonOrg =  {
    "dev_org": {
      "642fccd1_org": {
        "1_org": "111_org",
        "2_org": "222_org",
      }
    },
    "time_org": 1682471111
  }
;

const jsonAim =  {
    "dev_aim": {
      "642fccd1_aim": {
        "1_aim": "111_aim",
        "2_aim": "222_aim",
      }
    },
    "time_aim": 1682472222
  }
;




/*******************对象转对象    测试程序***************** */


let jsonTranferUtil = new JsonTranferUtil(jsonOrg, jsonAim, mappings);

let result = jsonTranferUtil.tranJson();


console.log("*************************最终转换结果*********************************")

console.log(result, 9999999999999)



