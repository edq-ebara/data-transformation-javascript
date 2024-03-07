"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash = require("lodash");
/**
 * Json转换工具
 */
var JsonTranferUtil = /** @class */ (function () {
    /**
     *构造函数
     */
    function JsonTranferUtil(orgTemplate, aimTemplate, jsonMappings) {
        this.Json_Path_Regex = "^[\\d\\w][\\d\\w\\_]*((\\[([\\w\\d\\_]+|\\*)\\])*|((\\.\\*)|(\\.[\\d\\w][\\d\\w\\_]*))*)*$";
        this.jOrg = { "root": orgTemplate };
        this.jAim = { "root": aimTemplate };
        this.mappings = jsonMappings;
    }
    /**********************私有方法  开始*************************** */
    /**
     *
     * @param orgStr 替换最后一个匹配的字符串
     * @param replaceStr
     * @param reg
     */
    JsonTranferUtil.prototype.replaceLastStrs = function (orgStr, replaceStr, objType) {
        var regexArray = /^.*(\[.*?\])$/;
        var regexObject = /^.*(\.\w*)$/;
        var replaceTemp = "";
        var newStr = "";
        if (objType === 1) { //数组
            var regStrs = orgStr.match(regexArray);
            if (regStrs && regStrs.length >= 2) {
                replaceTemp = regStrs[1];
                newStr = orgStr.substr(0, orgStr.lastIndexOf(replaceTemp));
            }
            else {
                newStr = orgStr;
            }
            return "".concat(newStr).concat(replaceStr);
        }
        else { //对象
            if (orgStr.indexOf(".") >= 0) {
                var regStrs = orgStr.match(regexObject);
                if (regStrs && regStrs.length >= 2) {
                    replaceTemp = regStrs[1];
                    newStr = orgStr.substr(0, orgStr.lastIndexOf(replaceTemp));
                }
                else {
                    newStr = orgStr;
                }
                return "".concat(newStr, ".").concat(replaceStr);
            }
            else {
                return replaceStr;
            }
        }
    };
    /**
     * 构建Mapping
     */
    JsonTranferUtil.prototype.buildJsonMapping = function (jOrg, jAim, jAimCurPath, jAimCur, mappings) {
        jAimCurPath = jAimCurPath || "";
        var mappingItem = null;
        var childMappings = [];
        var jAimCurType = typeof jAimCur;
        switch (jAimCurType.toLowerCase()) {
            case "object":
                if (Array.isArray(jAimCur)) { //目标属性是个数组
                    //【* =》对象】的情况下，映射类型只能是值到值【 TranType=4】
                    mappingItem = mappings.find(function (m) { return m.AimJsonPath == jAimCurPath && m.TranType == 4; });
                    if (mappingItem) {
                        //依据当前映射获取源
                        var jOrgCur = lodash.get(jOrg, mappingItem.OrgJsonPath);
                        if (jOrgCur) {
                            var jOrgCurType = typeof jOrgCur;
                            switch (jOrgCurType.toLowerCase()) {
                                case "object":
                                    if (Array.isArray(jOrgCur)) { //源属性是个数组
                                        var regex = "^".concat(jAimCurPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]"), "\\[.*?\\]\\.\\w*");
                                        childMappings = mappings.filter(function (m) {
                                            var matchs = m.AimJsonPath.match(new RegExp(regex));
                                            return matchs && matchs.length > 0;
                                        });
                                        //判断【数组 =》数组】的情况下，映射关系里是否包含目标数组属性的映射，如果包含说明客户端已经进行了指定,如果进行了指定则需要进一步处理，如果不存在则将此【对象=》数组】的映射关系删掉并依据原数组元素个数将目标数组元素添加为相等数量
                                        if (childMappings.length <= 0) {
                                            var jAim_CurChild = JSON.parse(JSON.stringify(jAimCur[0]));
                                            // jAimCur = [];//改变了jAimCur的引用
                                            jAimCur.splice(0, jAimCur.length);
                                            for (var j = 0; j < jOrgCur.length; j++) {
                                                jAimCur.push(jAim_CurChild);
                                            }
                                            mappings.splice(mappings.indexOf(mappingItem), 1);
                                        }
                                        else {
                                            var regexChild = "^".concat(mappingItem.OrgJsonPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]"), "\\[\\*\\]\\.\\w*");
                                            var childMappingForPatten = childMappings.find(function (m) {
                                                var matchs = m.OrgJsonPath.match(new RegExp(regexChild));
                                                return matchs && matchs.length > 0;
                                            });
                                            if (childMappingForPatten) {
                                                for (var i = 0; i < childMappings.length; i++) {
                                                    var childMapping = childMappings[i];
                                                    mappings.splice(mappings.indexOf(childMapping), 1);
                                                    for (var j = 0; j < jOrgCur.length; j++) {
                                                        mappings.push({
                                                            AimJsonPath: childMapping.AimJsonPath.replace("".concat(mappingItem.AimJsonPath, "[*]"), "".concat(mappingItem.AimJsonPath, "[").concat(j, "]")),
                                                            OrgJsonPath: childMapping.OrgJsonPath.replace("".concat(mappingItem.OrgJsonPath, "[*]"), "".concat(mappingItem.OrgJsonPath, "[").concat(j, "]")),
                                                            TranType: childMapping.TranType
                                                        });
                                                    }
                                                }
                                                var jAim_CurChild = JSON.parse(JSON.stringify(jAimCur[0]));
                                                jAimCur.splice(0, jAimCur.length);
                                                for (var j = 0; j < jOrgCur.length; j++) {
                                                    jAimCur.push(jAim_CurChild);
                                                }
                                            }
                                        }
                                    }
                                    else { //源属性是个对象
                                        var regex = "^".concat(jAimCurPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]"), "\\[.*?\\]\\.\\w*");
                                        childMappings = mappings.filter(function (m) {
                                            var matchs = m.AimJsonPath.match(new RegExp(regex));
                                            return matchs && matchs.length > 0;
                                        });
                                        //判断【对象 =》数组】的情况下，映射关系里是否包含目标数组属性的映射，如果包含说明客户端已经进行了指定,如果在指定的映射中源路径包含类似【a.*】则需要进一步处理，否则不做默认处理，如果不存在则将此【对象=》数组】的映射关系删掉，因为系统不知如何将其转换为数组
                                        if (childMappings.length <= 0) {
                                            mappings.splice(mappings.indexOf(mappingItem), 1);
                                        }
                                        else {
                                            var regexChild = "^".concat(mappingItem.OrgJsonPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]"), "\\.\\*");
                                            var childMappingList = childMappings.filter(function (m) {
                                                var matchs = m.OrgJsonPath.match(new RegExp(regexChild));
                                                return matchs && matchs.length > 0;
                                            });
                                            childMappingList.forEach(function (item) {
                                                mappings.splice(mappings.indexOf(item), 1);
                                            });
                                            var jAim_CurChild = JSON.parse(JSON.stringify(jAimCur[0]));
                                            jAimCur.splice(0, jAimCur.length);
                                            var jOrg_CurKeys = [];
                                            for (var key in jOrgCur) {
                                                jOrg_CurKeys.push(key);
                                            }
                                            for (var i = 0; i < jOrg_CurKeys.length; i++) {
                                                childMappings.forEach(function (childMapping) {
                                                    mappings.push({
                                                        AimJsonPath: childMapping.AimJsonPath.replace("".concat(mappingItem.AimJsonPath, "[*]"), "".concat(mappingItem.AimJsonPath, "[").concat(i, "]")),
                                                        OrgJsonPath: childMapping.OrgJsonPath.replace("".concat(mappingItem.OrgJsonPath, ".*"), "".concat(mappingItem.OrgJsonPath, ".").concat(jOrg_CurKeys[i])),
                                                        TranType: childMapping.TranType
                                                    });
                                                });
                                                jAimCur.push(jAim_CurChild);
                                            }
                                        }
                                    }
                                    break;
                                case "string":
                                case "number":
                                case "boolean":
                                default:
                                    //判断【非对象和数组 =》对象】的情况下，映射关系里是否包含目标对象属性的映射，如果包含说明客户端已经进行了指定在此不做默认处理，如果不存在则将此【非对象=》对象】的映射关系删掉，因为系统不知如何将其转换为对象
                                    mappings.forEach(function (m) {
                                        if (m.AimJsonPath.indexOf("".concat(jAimCurPath, "."))) {
                                            mappings.splice(mappings.indexOf(m), 1);
                                        }
                                    });
                            }
                        }
                        mappings.splice(mappings.indexOf(mappingItem), 1);
                    }
                }
                else { //目标属性是个对象
                    //【* =》对象】的情况下，映射类型只能是值到值【 TranType=4】
                    mappingItem = mappings.find(function (m) { return m.AimJsonPath == jAimCurPath && m.TranType == 4; });
                    if (mappingItem) {
                        //依据当前映射获取源
                        var jOrgCur = lodash.get(jOrg, mappingItem.OrgJsonPath);
                        if (jOrgCur) {
                            var jOrgCurType = typeof jOrgCur;
                            switch (jOrgCurType.toLowerCase()) {
                                case "object":
                                    if (Array.isArray(jOrgCur)) { //源属性是个数组
                                        var regex = "^".concat(jAimCurPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]"), "\\.\\w*$");
                                        childMappings = mappings.filter(function (m) {
                                            var matchs = m.AimJsonPath.match(new RegExp(regex));
                                            return matchs && matchs.length > 0 && (m.TranType == 3 || m.TranType == 4);
                                        });
                                        //判断【数组 =》对象】的情况下，映射关系里是否包含目标对象属性的映射且转换类型是【3：源Value->目标Key或4：源Value->目标Value】，如果包含说明客户端已经进行了指定在此需进一步处理，如果不存在则将此【数组=》对象】的映射关系删掉，因为系统不知如何将其转换为对象
                                        if (childMappings.length <= 0) {
                                            mappings.splice(mappings.indexOf(mappingItem), 1);
                                        }
                                        else {
                                            childMappings.forEach(function (m) {
                                                mappings.splice(mappings.indexOf(m), 1);
                                            });
                                            for (var i = 0; i < childMappings.length; i++) {
                                                var childMapping = childMappings[i];
                                                var siblingMappings1 = mappings.filter(function (m) { return m.AimJsonPath.endsWith("".concat(childMapping.AimJsonPath)); });
                                                siblingMappings1.forEach(function (m) {
                                                    mappings.splice(mappings.indexOf(m), 1);
                                                });
                                                var childMappings1 = mappings.filter(function (m) { return m.AimJsonPath.indexOf("".concat(childMapping.AimJsonPath, ".")) >= 0; });
                                                childMappings1.forEach(function (m) {
                                                    mappings.splice(mappings.indexOf(m), 1);
                                                });
                                                for (var j = 0; j < jOrgCur.length; j++) {
                                                    var orgJsonPath = childMapping.OrgJsonPath.replace("[*]", "[".concat(j, "]"));
                                                    var newMapping = {
                                                        AimJsonPath: "".concat(childMapping.AimJsonPath).concat(j),
                                                        OrgJsonPath: "".concat(orgJsonPath),
                                                        TranType: childMapping.TranType
                                                    };
                                                    siblingMappings1.forEach(function (m) {
                                                        var aimChildJsonPath = m.AimJsonPath.replace("".concat(childMapping.AimJsonPath), "".concat(newMapping.AimJsonPath));
                                                        var regexSibling = "^".concat(mappingItem.OrgJsonPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]"), "\\[\\*\\]\\..*$");
                                                        var matchs = m.OrgJsonPath.match(new RegExp(regexSibling));
                                                        var orgChildJsonPath = matchs && matchs.length > 0 ? m.OrgJsonPath.replace("".concat(mappingItem.OrgJsonPath, "[*]."), "".concat(mappingItem.OrgJsonPath, "[").concat(j, "].")) : m.OrgJsonPath;
                                                        var newMappingChild = {
                                                            AimJsonPath: aimChildJsonPath,
                                                            OrgJsonPath: orgChildJsonPath,
                                                            TranType: m.TranType
                                                        };
                                                        mappings.push(newMappingChild);
                                                    });
                                                    childMappings1.forEach(function (m) {
                                                        var aimChildJsonPath = m.AimJsonPath.replace("".concat(childMapping.AimJsonPath, "."), "".concat(newMapping.AimJsonPath, "."));
                                                        var regexChild = "^".concat(mappingItem.OrgJsonPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]"), "\\[\\*\\]\\..*$");
                                                        var matchs = m.OrgJsonPath.match(new RegExp(regexChild));
                                                        var orgChildJsonPath = matchs && matchs.length > 0 ? m.OrgJsonPath.replace("".concat(mappingItem.OrgJsonPath, "[*]."), "".concat(mappingItem.OrgJsonPath, "[").concat(j, "].")) : m.OrgJsonPath;
                                                        var newMappingChild = {
                                                            AimJsonPath: aimChildJsonPath,
                                                            OrgJsonPath: orgChildJsonPath,
                                                            TranType: m.TranType
                                                        };
                                                        mappings.push(newMappingChild);
                                                    });
                                                    mappings.push(newMapping);
                                                }
                                            }
                                            var jAimChildKey = null;
                                            for (var key in jAimCur) {
                                                jAimChildKey = key;
                                                break;
                                            }
                                            if (jAimChildKey) {
                                                var jAim_CurChild_Org = JSON.parse(JSON.stringify(jAimCur[jAimChildKey]));
                                                for (var prop in jAimCur) {
                                                    delete jAimCur[prop];
                                                }
                                                for (var j = 0; j < jOrgCur.length; j++) {
                                                    var jAim_CurChild = JSON.parse(JSON.stringify(jAim_CurChild_Org));
                                                    jAimCur["".concat(jAimChildKey).concat(j)] = jAim_CurChild;
                                                }
                                            }
                                        }
                                    }
                                    else { //源属性是个对象
                                        var regex = "^".concat(jAimCurPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]"), "\\.\\w*$");
                                        childMappings = mappings.filter(function (m) {
                                            var matchs = m.AimJsonPath.match(new RegExp(regex));
                                            return matchs && matchs.length > 0;
                                        });
                                        //判断【对象 =》对象】的情况下，映射关系里是否包含目标对象属性的映射，如果包含说明客户端已经进行了指定在此不做默认处理，如果不存在则按默认操作将目标对象和源对象按照属性名和TransType 进行映射
                                        if (childMappings.length <= 0) {
                                            var orgChildKeyList = [];
                                            for (var orgChildKey_1 in jOrgCur) {
                                                orgChildKeyList.push(orgChildKey_1);
                                            }
                                            var _loop_1 = function (aimChildKey) {
                                                if (orgChildKeyList.find(function (k) { return k == aimChildKey; })) {
                                                    orgChildKey = aimChildKey;
                                                    mappings.push({
                                                        AimJsonPath: "".concat(mappingItem.AimJsonPath, ".").concat(aimChildKey),
                                                        OrgJsonPath: "".concat(mappingItem.OrgJsonPath, ".").concat(orgChildKey),
                                                        TranType: mappingItem.TranType
                                                    });
                                                }
                                            };
                                            var orgChildKey;
                                            //轮询所有目标对象的所有属性构建与源对象同属性名的映射
                                            for (var aimChildKey in jAimCur) {
                                                _loop_1(aimChildKey);
                                            }
                                        }
                                    }
                                    break;
                                case "string":
                                case "number":
                                case "boolean":
                                default:
                                    //判断【非对象和数组 =》对象】的情况下，映射关系里是否包含目标对象属性的映射，如果包含说明客户端已经进行了指定在此不做默认处理，如果不存在则将此【非对象=》对象】的映射关系删掉，因为系统不知如何将其转换为对象
                                    mappings.forEach(function (m) {
                                        if (m.AimJsonPath.indexOf("".concat(jAimCurPath, "."))) {
                                            mappings.splice(mappings.indexOf(m), 1);
                                        }
                                    });
                            }
                        }
                        mappings.splice(mappings.indexOf(mappingItem), 1);
                    }
                }
                break;
            case "string":
                break;
            case "number":
                break;
            case "boolean":
                break;
            default:
        }
        switch (jAimCurType.toLowerCase()) {
            case "object":
                for (var key in jAimCur) {
                    var jAim_CurChild = jAimCur[key];
                    var jAim_CurChildType = typeof jAim_CurChild;
                    var jAim_CurChildPath = "";
                    switch (jAim_CurChildType.toLowerCase()) {
                        case "object":
                            if (Array.isArray(jAimCur)) { //目标属性是个数组
                                jAim_CurChildPath = jAimCurPath ? "".concat(jAimCurPath, "[").concat(key, "]") : "[".concat(key, "]");
                            }
                            else { //目标属性是个对象
                                jAim_CurChildPath = jAimCurPath ? "".concat(jAimCurPath, ".").concat(key) : "".concat(key);
                            }
                            break;
                        default:
                            jAim_CurChildPath = jAimCurPath ? "".concat(jAimCurPath, ".").concat(key) : "".concat(key);
                            break;
                    }
                    if (jAim_CurChildPath) {
                        this.buildJsonMapping(jOrg, jAim, jAim_CurChildPath, jAim_CurChild, mappings);
                    }
                }
                break;
            default:
                break;
        }
    };
    ;
    /**
     * Json数据转换
     */
    JsonTranferUtil.prototype.tranJson_inner = function (jOrg, jAim, jAimCurPath, jAimCur, mappings) {
        var _this = this;
        var regexArray = /^.*(\[.*?\])$/;
        var regexObject = /^.*(\.\w*)$/;
        var newJAimCurPath = jAimCurPath;
        var jAim_Cur_MappingList = mappings.filter(function (d) { return d.AimJsonPath == jAimCurPath; });
        jAim_Cur_MappingList.forEach(function (mappingItem) {
            var jAimCurPaths = lodash.toPath(mappingItem.AimJsonPath);
            var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
            var jAimCurParentPaths = lodash.initial(jAimCurPaths);
            var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);
            var jOrgCur = lodash.get(jOrg, mappingItem.OrgJsonPath);
            var jOrgCurPaths = lodash.toPath(mappingItem.OrgJsonPath);
            var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
            var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
            var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);
            /// 转换类型
            /// 1：源Key->目标Key
            /// 2：源Key->目标Value
            /// 3：源Value->目标Key
            /// 4：源Value->目标Value
            switch (mappingItem.TranType) {
                case 1:
                    var jAimCurParentType = typeof jAimCurParent;
                    switch (jAimCurParentType.toLowerCase()) {
                        case "object":
                            if (Array.isArray(jAimCurParent)) { //属性是个数组
                                jAimCurParent.splice(jAimCurParent.indexOf(jAimCur), 1);
                                // newJAimCurPath=`${jAimCurParentPaths}[${jOrgCurKey}]`            
                                newJAimCurPath = _this.replaceLastStrs("".concat(jAimCurPath), "[".concat(jOrgCurKey, "]"), 1);
                            }
                            else { //属性是个对象
                                newJAimCurPath = _this.replaceLastStrs("".concat(jAimCurPath), "".concat(jOrgCurKey), 2);
                                //将当前目标从目标父亲中移除
                                delete jAimCurParent[jAimCurKey];
                            }
                            //使用源的Key和目标的值构造一个目标父亲的新属性
                            jAimCurParent[jOrgCurKey] = jAimCur;
                            var replaceMappting = mappingItem.AimJsonPath;
                            mappings.forEach(function (item) {
                                item.AimJsonPath = item.AimJsonPath.replace("".concat(replaceMappting), newJAimCurPath);
                            });
                            break;
                        default:
                            break;
                    }
                    break;
                case 2:
                    jAimCurParent[jAimCurKey] = jOrgCurKey;
                    break;
                case 3:
                    var jAimCurParentType = typeof jAimCurParent;
                    switch (jAimCurParentType.toLowerCase()) {
                        case "object":
                            if (Array.isArray(jAimCurParent)) { //属性是个数组
                                jAimCurParent.splice(jAimCurParent.indexOf(jAimCur), 1);
                                // newJAimCurPath = `${jAimCurParentPaths}[${jOrgCur}]`
                                newJAimCurPath = _this.replaceLastStrs("".concat(jAimCurPath), "[".concat(jOrgCur, "]"), 1);
                            }
                            else { //属性是个对象
                                // newJAimCurPath = `${jAimCurParentPaths}.${jOrgCur}`
                                newJAimCurPath = _this.replaceLastStrs("".concat(jAimCurPath), "".concat(jOrgCur), 2);
                                //将当前目标从目标父亲中移除
                                delete jAimCurParent[jAimCurKey];
                            }
                            jAimCurParent[jOrgCur] = jAimCur;
                            var replaceMappting = mappingItem.AimJsonPath;
                            mappings.forEach(function (item) {
                                item.AimJsonPath = item.AimJsonPath.replace("".concat(replaceMappting), newJAimCurPath);
                            });
                            break;
                        default:
                            break;
                    }
                    break;
                case 4:
                    jAimCurParent[jAimCurKey] = jOrgCur;
                    break;
                default:
                    break;
            }
        });
        var jAimCurType = typeof jAimCur;
        switch (jAimCurType.toLowerCase()) {
            case "object":
                for (var key in jAimCur) {
                    var jAim_CurChild = jAimCur[key];
                    var jAim_CurChildType = typeof jAim_CurChild;
                    var jAim_CurChildPath = "";
                    switch (jAim_CurChildType.toLowerCase()) {
                        case "object":
                            if (Array.isArray(jAimCur)) { //目标属性是个数组
                                jAim_CurChildPath = newJAimCurPath ? "".concat(newJAimCurPath, "[").concat(key, "]") : "[".concat(key, "]");
                            }
                            else { //目标属性是个对象
                                jAim_CurChildPath = newJAimCurPath ? "".concat(newJAimCurPath, ".").concat(key) : "".concat(key);
                            }
                            break;
                        default:
                            jAim_CurChildPath = newJAimCurPath ? "".concat(newJAimCurPath, ".").concat(key) : "".concat(key);
                            break;
                    }
                    this.tranJson_inner(jOrg, jAim, jAim_CurChildPath, jAim_CurChild, mappings);
                }
                break;
            default:
                break;
        }
    };
    ;
    /**********************私有方法 结束*************************** */
    /**
      * Json数据转换
      */
    JsonTranferUtil.prototype.tranJson = function () {
        console.log("*************************构建前的Mappings*********************************");
        console.log(JSON.parse(JSON.stringify(this.mappings)), 1001);
        console.log("*************************构建前的Aims*********************************");
        console.log(JSON.parse(JSON.stringify(this.jAim)), 1002);
        this.buildJsonMapping(this.jOrg, this.jAim, "", this.jAim, this.mappings);
        console.log("*************************构建后的Mappings*********************************");
        console.log(JSON.parse(JSON.stringify(this.mappings)), 1003);
        console.log("*************************构建后的Aims*********************************");
        console.log(JSON.parse(JSON.stringify(this.jAim)), 1004);
        var jsonOrgNew = JSON.parse(JSON.stringify(this.jOrg));
        var jsonAimNew = JSON.parse(JSON.stringify(this.jAim));
        var mappingsNew = JSON.parse(JSON.stringify(this.mappings));
        this.tranJson_inner(jsonOrgNew, jsonAimNew, "", jsonAimNew, mappingsNew);
        console.log("*************************转换后的Mappings*********************************");
        console.log(JSON.parse(JSON.stringify(mappingsNew)), 1005);
        console.log("*************************转换后的Aims*********************************");
        console.log(JSON.parse(JSON.stringify(jsonAimNew)), 1006);
        return jsonAimNew.root;
    };
    ;
    /**
     * 检查JsonMapping信息
     *
     * @return
     */
    JsonTranferUtil.prototype.checkJsonMapping = function () {
        var _this = this;
        var resultMsg = "";
        this.mappings.forEach(function (jsonMapping) {
            var regex = new RegExp(_this.Json_Path_Regex);
            var result = regex.test(jsonMapping.OrgJsonPath);
            if (!result) {
                resultMsg = "".concat(resultMsg, "\u3010").concat(jsonMapping.OrgJsonPath, "\u3011Json\u8DEF\u5F84\u9A8C\u8BC1\u5931\u8D25\uFF01");
            }
            result = regex.test(jsonMapping.AimJsonPath);
            if (!result) {
                resultMsg = "".concat(resultMsg, "\u3010").concat(jsonMapping.AimJsonPath, "\u3011Json\u8DEF\u5F84\u9A8C\u8BC1\u5931\u8D25\uFF01");
            }
        });
        if (resultMsg != null && resultMsg != "") {
            return { IsSuccess: false, Msg: resultMsg };
        }
        else {
            this.mappings.forEach(function (jsonMapping) {
                //验证源路径
                var orgJsonPath = jsonMapping.OrgJsonPath.replace("[*]", "[0]");
                while (orgJsonPath.indexOf(".*") >= 0) {
                    var tempOrgJsonPath = orgJsonPath.substring(0, orgJsonPath.indexOf(".*"));
                    if (tempOrgJsonPath != null && orgJsonPath != "") {
                        var jsonMember_1 = lodash.get(_this.jOrg, tempOrgJsonPath);
                        if (jsonMember_1 == null) {
                            resultMsg = "".concat(resultMsg, "\u3010").concat(jsonMapping.OrgJsonPath, "\u3011Json\u8DEF\u5F84\u65E0\u6CD5\u5B9A\u4F4D\u5230json\u5C5E\u6027\uFF01");
                        }
                        if (jsonMember_1.getChildren().size() <= 0) {
                            resultMsg = "".concat(resultMsg, "\u3010").concat(jsonMapping.OrgJsonPath, "\u3011Json\u8DEF\u5F84\u6CA1\u6709\u5B50\u5C5E\u6027\uFF01");
                        }
                        orgJsonPath = orgJsonPath.replace(tempOrgJsonPath + ".*", tempOrgJsonPath + "." + jsonMember_1.getChildren().get(0).getName());
                    }
                }
                var jsonMember = lodash.get(_this.jOrg, orgJsonPath);
                if (jsonMember == null) {
                    resultMsg = "".concat(resultMsg, "\u3010").concat(jsonMapping.OrgJsonPath, "\u3011Json\u8DEF\u5F84\u65E0\u6CD5\u5B9A\u4F4D\u5230json\u5C5E\u6027\uFF01");
                }
                //验证目标路径
                var aimJsonPath = jsonMapping.AimJsonPath.replace("[*]", "[0]");
                while (aimJsonPath.indexOf(".*") >= 0) {
                    var tempAimJsonPath = aimJsonPath.substring(0, aimJsonPath.indexOf(".*"));
                    if (tempAimJsonPath != null && aimJsonPath != "") {
                        var jsonMemberAim_1 = lodash.get(_this.jAim, tempAimJsonPath);
                        if (jsonMemberAim_1 == null) {
                            resultMsg = "".concat(resultMsg, "\u3010").concat(jsonMapping.AimJsonPath, "\u3011Json\u8DEF\u5F84\u65E0\u6CD5\u5B9A\u4F4D\u5230json\u5C5E\u6027\uFF01");
                        }
                        if (jsonMemberAim_1.getChildren().size() <= 0) {
                            resultMsg = "".concat(resultMsg, "\u3010").concat(jsonMapping.AimJsonPath, "\u3011Json\u8DEF\u5F84\u6CA1\u6709\u5B50\u5C5E\u6027\uFF01");
                        }
                        aimJsonPath = aimJsonPath.replace(tempAimJsonPath + ".*", tempAimJsonPath + "." + jsonMemberAim_1.getChildren().get(0).getName());
                    }
                }
                var jsonMemberAim = lodash.get(_this.jAim, aimJsonPath);
                if (jsonMemberAim == null) {
                    resultMsg = "".concat(resultMsg, "\u3010").concat(jsonMapping.AimJsonPath, "\u3011Json\u8DEF\u5F84\u65E0\u6CD5\u5B9A\u4F4D\u5230json\u5C5E\u6027\uFF01");
                }
            });
        }
        if (resultMsg) {
            return { IsSuccess: false, Msg: resultMsg };
        }
        else {
            return { IsSuccess: true, Msg: "" };
        }
    };
    return JsonTranferUtil;
}());
exports.default = JsonTranferUtil;
