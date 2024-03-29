
import JsonTranferUtil from '../json_transfer'
// import JsonTranferUtil from './json_transfer'



/************************数组转数组   示例数据 ********************** */

// 1.  变量   #Time#  #Time_L#
// 2.  Mapping信息
//   {
//     "AimJsonPath": "root.dev.642fccd1",//目标结构路径
//     "OrgJsonPath": "root.dev[*].pro",//源结构路径
//     "TranType": 4,//转换类型  1：源Key->目标Key  2：源Key->目标Value  3：源Value->目标Key 4：源Value->目标Value   
//     "Options":{
//         "KeyInitIndex":100,//自动生成的元素的起始索引,默认为0
//         "AddElementsOption":"1",  //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
//         "TranOP":"1",  //1:将源子元素复制到目标,使用源子元素的Key 2:将源子元素复制到目标,为源子元素新生成Key 3：依据源元素在目标构建同等数量的目标子元素 默认为1
//         "TranWay":"1", //1：交叉映射 2：一对一映射 默认为1       
//     }
//   },

/// 转换类型
/// 1：源Key->目标Key
/// 2：源Key->目标Value
/// 3：源Value->目标Key
/// 4：源Value->目标Value
const mappings = [
  // {
  //   "AimJsonPath": "root.dev_aim",
  //   "OrgJsonPath": "root.dev_org",
  //   "TranType": 4
  // },
  {
    "AimJsonPath": "root.dev_aim",
    "OrgJsonPath": "root.dev_org",
    "TranType": 4,
    "Options": {
      "KeyInitIndex": 100,//自动生成的元素的起始索引,默认为0
      "AddElementsOption": "2",  //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
      "TranOP": "2",  //1:将源子元素复制到目标 2：依据源元素在目标构建同等数量的目标子元素，且如果目标的子元素存在相应的一对一映射【TranWay=2】,则创建源和目标的一对一映射 默认为1
      "TranWay": "1" //1：交叉映射 2：一对一映射,仅在当前映射为规则映射（包含*、[*]）和上级元素指定 【TranOP=2】 时生效，否则按交叉映射执行  默认为1
    }
  },

  {
    "AimJsonPath": "root.dev_aim[*].value_aim",
    "OrgJsonPath": "root.dev_org[*].value_org",
    "TranType": 4,
    "Options": {
      "KeyInitIndex": 100,//自动生成的元素的起始索引,默认为0
      "AddElementsOption": "1",  //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
      "TranOP": "1",  //1:将源子元素复制到目标 2：依据源元素在目标构建同等数量的目标子元素，且如果目标的子元素存在相应的一对一映射【TranWay=2】,则创建源和目标的一对一映射 默认为1
      "TranWay": "1" //1：交叉映射 2：一对一映射,仅在当前映射为规则映射（包含*、[*]）和上级元素指定 【TranOP=2】 时生效，否则按交叉映射执行  默认为1
    }
  },
  {
    "AimJsonPath": "root.dev_aim[*].value_aim",
    "OrgJsonPath": "root.dev_org[*].value_org",
    "TranType": 1,
    "Options": {
      "KeyInitIndex": 100,//自动生成的元素的起始索引,默认为0
      "AddElementsOption": "1",  //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
      "TranOP": "1",  //1:将源子元素复制到目标 2：依据源元素在目标构建同等数量的目标子元素，且如果目标的子元素存在相应的一对一映射【TranWay=2】,则创建源和目标的一对一映射 默认为1
      "TranWay": "2" //1：交叉映射 2：一对一映射,仅在当前映射为规则映射（包含*、[*]）和上级元素指定 【TranOP=2】 时生效，否则按交叉映射执行  默认为1
    }
  },
  {
    "AimJsonPath": "root.dev_aim[*].value_aim.key",
    "OrgJsonPath": "root.dev_org[*].value_org.key",
    "TranType": 3,
    "Options": {
      "KeyInitIndex": 100,//自动生成的元素的起始索引,默认为0
      "AddElementsOption": "1",  //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
      "TranOP": "1",  //1:将源子元素复制到目标 2：依据源元素在目标构建同等数量的目标子元素，且如果目标的子元素存在相应的一对一映射【TranWay=2】,则创建源和目标的一对一映射 默认为1
      "TranWay": "2" //1：交叉映射 2：一对一映射,仅在当前映射为规则映射（包含*、[*]）和上级元素指定 【TranOP=2】 时生效，否则按交叉映射执行  默认为1
    }
  },
  {
    "AimJsonPath": "root.dev_aim[*].value_aim.key",
    "OrgJsonPath": "root.dev_org[*].value_org.key",
    "TranType": 4,
    "Options": {
      "KeyInitIndex": 100,//自动生成的元素的起始索引,默认为0
      "AddElementsOption": "1",  //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
      "TranOP": "1",  //1:将源子元素复制到目标 2：依据源元素在目标构建同等数量的目标子元素，且如果目标的子元素存在相应的一对一映射【TranWay=2】,则创建源和目标的一对一映射 默认为1
      "TranWay": "2" //1：交叉映射 2：一对一映射,仅在当前映射为规则映射（包含*、[*]）和上级元素指定 【TranOP=2】 时生效，否则按交叉映射执行  默认为1
    }
  },

  {
    "AimJsonPath": "root.time_aim",
    "OrgJsonPath": "root.time_org",
    "TranType": 1,
    "Options": {
      "KeyInitIndex": 100,//自动生成的元素的起始索引,默认为0
      "AddElementsOption": "1",  //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
      "TranOP": "1",  //1:将源子元素复制到目标 2：依据源元素在目标构建同等数量的目标子元素，且如果目标的子元素存在相应的一对一映射【TranWay=2】,则创建源和目标的一对一映射 默认为1
      "TranWay": "2" //1：交叉映射 2：一对一映射,仅在当前映射为规则映射（包含*、[*]）和上级元素指定 【TranOP=2】 时生效，否则按交叉映射执行  默认为1
    }
  },
  {
    "AimJsonPath": "root.time_aim",
    "OrgJsonPath": "#Time#",
    "TranType": 4,
    "Options": {
      "KeyInitIndex": 100,//自动生成的元素的起始索引,默认为0
      "AddElementsOption": "1",  //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
      "TranOP": "1",  //1:将源子元素复制到目标 2：依据源元素在目标构建同等数量的目标子元素，且如果目标的子元素存在相应的一对一映射【TranWay=2】,则创建源和目标的一对一映射 默认为1
      "TranWay": "2" //1：交叉映射 2：一对一映射,仅在当前映射为规则映射（包含*、[*]）和上级元素指定 【TranOP=2】 时生效，否则按交叉映射执行  默认为1
    }
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
}
  ;

const jsonAim = {
  "dev_aim": [{
    "value_aim": {
      "key": "111_aim",
      "value": "122_aim",
      "other": "444"
    }
  }
  ],
  "time_aim": 11111
}
  ;




/*******************数组转数组    测试程序***************** */



let jsonTranferUtil = new JsonTranferUtil(jsonOrg, jsonAim, mappings);

let result = jsonTranferUtil.tranJson();


console.log("*************************最终转换结果*********************************")

console.log(result, 9999999999999)

