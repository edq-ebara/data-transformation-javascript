import lodash from 'lodash'

/**
 * Json转换工具
 */
class JsonTranferUtil {

    private jAim: any;
    private jOrg: any;
    private mappings: any[];
    private Json_Path_Regex: string = "^[\\d\\w][\\d\\w\\_]*((\\[([\\w\\d\\_]+|\\*)\\])*|((\\.\\*)|(\\.[\\d\\w][\\d\\w\\_]*))*)*$";

    private tranLogs: any[] = [];
    private tranErrors: any[] = [];

    //目标是否替换
    private replaceAimArr: any[] = [];


    /**
     *构造函数
     */
    constructor(orgTemplate: any, aimTemplate: any, jsonMappings: any[]) {

        if (!orgTemplate || !aimTemplate || !jsonMappings) {
            throw new Error("源模板、目标模板、映射关系不能为空！");
        }

        this.jOrg = { "root": orgTemplate };
        this.jAim = { "root": aimTemplate };
        // jsonMappings = jsonMappings.sort((a, b) => {
        //     if (a.AimJsonPath == b.AimJsonPath) {
        //         if (a.TranType != b.TranType) {
        //             if (a.TranType == 1 || a.TranType == 3) {
        //                 return -1;
        //             }
        //             if (b.TranType == 1 || b.TranType == 3) {
        //                 return 1;
        //             }
        //             return a.TranType - b.TranType;
        //         } else if (a.OrgJsonPath != b.OrgJsonPath) {
        //             return a.OrgJsonPath.localeCompare(b.OrgJsonPath);
        //         }
        //     } else if (a.AimJsonPath != b.AimJsonPath) {
        //         return a.AimJsonPath.localeCompare(b.AimJsonPath);
        //     }
        // });
        this.mappings = JSON.parse(JSON.stringify(jsonMappings));
    }


    /**********************私有方法  开始*************************** */



    /**
     * 依据规则展开Mapping
     * @param jRoot 
     * @param mapping 
     * @param type  1:源路径 2：目标路径
     */
    private expandMappingForPatten(jAimRoot: any, jOrgRoot: any, mappings: any[], mapping: any, type: any) {

        if (mapping.Options && mapping.Options.TranWay == 2) {
            this.expandMappingForPatten_OneToOne(jAimRoot, jOrgRoot, mappings, mapping);
        } else {
            var path = type == 1 ? mapping.OrgJsonPath : mapping.AimJsonPath;
            var jRoot = type == 1 ? jOrgRoot : jAimRoot;
            var curPath = "";
            if (path.indexOf("*") > 0) {
                if (path.indexOf(".*") == (path.indexOf("*") - 1)) { //对象路径
                    curPath = path.substring(0, path.indexOf(".*"))
                    var jcur = this.getElementByPath(jRoot, curPath);
                    var mappingIndex = mappings.indexOf(mapping)
                    //删除原映射
                    mappings.splice(mappingIndex, 1);
                    if (jcur) {

                        var keyIndex = 0;
                        for (const key in jcur) {
                            var newPath = path.replace(`${curPath}.*`, `${curPath}.${key}`);
                            var newMapping =
                            {
                                AimJsonPath: type == 2 ? newPath : mapping.AimJsonPath,
                                OrgJsonPath: type == 1 ? newPath : mapping.OrgJsonPath,
                                TranType: mapping.TranType,
                                Options: mapping.Options
                            };
                            //添加新映射
                            mappings.splice(mappingIndex + keyIndex, 0, newMapping);

                            if (newPath.indexOf("*") > 0) {
                                this.expandMappingForPatten(jAimRoot, jOrgRoot, mappings, newMapping, type);
                            }
                            keyIndex++;
                        }
                    }

                } else if (path.indexOf("[*") == (path.indexOf("*") - 1)) {//数组路径
                    curPath = path.substring(0, path.indexOf("[*"))
                    var mappingIndex = mappings.indexOf(mapping)
                    //删除原映射
                    mappings.splice(mappingIndex, 1);
                    var jcur = this.getElementByPath(jRoot, curPath);
                    if (jcur) {

                        for (let index = 0; index < jcur.length; index++) {
                            var newPath = path.replace(`${curPath}[*]`, `${curPath}[${index}]`);
                            var newMapping =
                            {
                                AimJsonPath: type == 2 ? newPath : mapping.AimJsonPath,
                                OrgJsonPath: type == 1 ? newPath : mapping.OrgJsonPath,
                                TranType: mapping.TranType,
                                Options: mapping.Options
                            };
                            //添加新映射
                            mappings.splice(mappingIndex + index, 0, newMapping);
                            if (newPath.indexOf("*") > 0) {
                                this.expandMappingForPatten(jAimRoot, jOrgRoot, mappings, newMapping, type);
                            }
                        }
                    }
                }
                else {
                    throw Error("无法分析出是什么路径！")
                }
            }
        }
    }

    /**
     * 依据规则展开Mapping（一对一映射）
     * @param jRoot 
     * @param mapping 
     */
    private expandMappingForPatten_OneToOne(jAimRoot: any, jOrgRoot: any, mappings: any[], mapping: any) {


        //针对一对一映射，先处理当前映射的目标路径的 1 key-key 或者3 value-key，后处理当前映射的目标路径的 2 key-value 或者 4 value-value
        var mappings_1_3 = [];

        mappings_1_3 = mappings.filter((item: any) => {
            if ((item.TranType == 1 || item.TranType == 3) && item.AimJsonPath == mapping.AimJsonPath) {
                return true;
            }
        })

        mappings_1_3.forEach(item => {
            var jcurAimArr_1_3: any[] = [];
            var jcurOrgArr_1_3: any[] = [];
            this.getElementByPathWithPatten(jAimRoot, item.AimJsonPath, jcurAimArr_1_3);
            this.getElementByPathWithPatten(jOrgRoot, item.OrgJsonPath, jcurOrgArr_1_3);
            var mappingIndex_1_3 = mappings.indexOf(item)

            for (let index = 0; index < jcurOrgArr_1_3.length; index++) {
                if (jcurAimArr_1_3[index]) {
                var newMapping =
                {
                    AimJsonPath: jcurAimArr_1_3[index].path,
                    OrgJsonPath: jcurOrgArr_1_3[index].path,
                    TranType: mapping.TranType,
                    Options: mapping.Options
                };
                //添加新映射
                mappings.splice(mappingIndex_1_3 + index, 0, newMapping);
            }
            }
            //删除原映射
            mappings.splice(mappings.indexOf(item), 1);
        });



        var mappings_2_4 = [];
        //针对一对一映射，先处理当前映射的目标路径的 1 key-key 或者3 value-key，后处理当前映射的目标路径的 2 key-value 或者 4 value-value
        mappings_2_4 = mappings.filter((item: any) => {
            if ((item.TranType == 2 || item.TranType == 4) && item.AimJsonPath == mapping.AimJsonPath) {
                return true;
            }
        })

        mappings_2_4.forEach(item => {

            var jcurAimArr_2_4: any[] = [];
            var jcurOrgArr_2_4: any[] = [];
            this.getElementByPathWithPatten(jAimRoot, item.AimJsonPath, jcurAimArr_2_4);
            this.getElementByPathWithPatten(jOrgRoot, item.OrgJsonPath, jcurOrgArr_2_4);
            var mappingIndex_2_4 = mappings.indexOf(item)
            for (let index = 0; index < jcurOrgArr_2_4.length; index++) {

                if (jcurAimArr_2_4[index]) {
                    var newMapping =
                    {
                        AimJsonPath: jcurAimArr_2_4[index].path,
                        OrgJsonPath: jcurOrgArr_2_4[index].path,
                        TranType: item.TranType,
                        Options: item.Options
                    };
                    //添加新映射
                    mappings.splice(mappingIndex_2_4 + index, 0, newMapping);
                }
            }

            //删除原映射
            mappings.splice(mappings.indexOf(item), 1);

        });

    }

    /**
       * 
       * @param orgStr 替换最后一个匹配的字符串
       * @param replaceStr 
       * @param reg 
       */
    private replaceLastStrs(orgStr: any, replaceStr: any, objType: any): any {


        var regexArray = /^.*(\[.*?\])$/;
        var regexObject = /^.*(\.\w*)$/;

        var replaceTemp = ""
        var newStr = ""

        if (objType === 1) {//数组

            var regStrs = orgStr.match(regexArray)
            if (regStrs && regStrs.length >= 2) {
                replaceTemp = regStrs[1]
                newStr = orgStr.substr(0, orgStr.lastIndexOf(replaceTemp));
            } else {
                newStr = orgStr;
            }
            return `${newStr}${replaceStr}`;
        }
        else {//对象
            if (orgStr.indexOf(".") >= 0) {
                var regStrs = orgStr.match(regexObject)
                if (regStrs && regStrs.length >= 2) {
                    replaceTemp = regStrs[1]
                    newStr = orgStr.substr(0, orgStr.lastIndexOf(replaceTemp));
                } else {
                    newStr = orgStr;
                }
                return `${newStr}.${replaceStr}`;
            } else {
                return replaceStr;
            }
        }



    }

    /**
     * 依据路径获取元素
     */
    private getElementByPath(jRoot: any, path: string): any {
        return lodash.get(jRoot, path)
    }

    /**
     * 依据路径获取元素(依据规则)
     */
    private getElementByPathWithPatten(jRoot: any, path: string, eleArr: any[]) {
        var curPath = "";
        if (path.indexOf("*") > 0) {

            if (path.indexOf(".*") == (path.indexOf("*") - 1)) { //对象路径
                curPath = path.substring(0, path.indexOf(".*"))
                var jcur = this.getElementByPath(jRoot, curPath);
                if (jcur) {
                    for (const key in jcur) {
                        var newPath = path.replace(`${curPath}.*`, `${curPath}.${key}`);

                        if (newPath.indexOf("*") > 0) {
                            this.getElementByPathWithPatten(jRoot, newPath, eleArr);
                        }
                        else {
                            eleArr.push({ ele: jcur, path: newPath })
                        }
                    }
                }

            } else if (path.indexOf("[*") == (path.indexOf("*") - 1)) {//数组路径
                curPath = path.substring(0, path.indexOf("[*"))
                var jcur = this.getElementByPath(jRoot, curPath);
                if (jcur) {

                    for (let index = 0; index < jcur.length; index++) {
                        var newPath = path.replace(`${curPath}[*]`, `${curPath}[${index}]`);
                        if (newPath.indexOf("*") > 0) {
                            this.getElementByPathWithPatten(jRoot, newPath, eleArr);
                        } else {
                            eleArr.push({ ele: jcur, path: newPath })
                        }
                    }
                }
            }
            else {
                throw Error("无法分析出是什么路径！")
            }

        }
        else {
            eleArr.push({ ele: jRoot, path: path });
        }

    }


    /**
     * 压缩JSON
     * @param obj 
     * @param currentPath 
     * @param paths 
     * @returns 
     */
    private compressJson(obj: any, currentPath: any, paths: any[]): any {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map((item, index) => this.compressJson(item, `${currentPath}[${index}]`, paths));
        }

        const compressedData = {};
        Object.keys(obj).forEach(key => {
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            if (paths.find(p => p.indexOf(newPath) >= 0)) {
                compressedData[key] = this.compressJson(obj[key], newPath, paths);
            }
        });
        return compressedData;
    }

    /**
   * 获取动态变量的值
   * @param var_type 
   */
    private getVaraibleValue(var_type: any): any {

        switch (var_type) {
            case "#Time#":

                // 创建一个Date对象，表示当前时间
                var currentDate = new Date();
                // 如果需要将UTC时间戳转换为UTC时间字符串，可以使用toUTCString()方法
                var utcTimeString = currentDate.toISOString();

                return utcTimeString;
            case "#Time_L#":

                // 创建一个Date对象，表示当前时间
                var currentDate = new Date();

                // 获取当前时间的UTC时间戳（毫秒）
                var utcTimestamp = currentDate.getTime();

                return utcTimestamp;
            default:
                break;
        }
        return null;
    }

    /**
       * Json数据转换
       */
    private tranJson_Inner(jOrg: any, jAim: any, mappings: any[], mapping: any): any {
        var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);
        var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
        var jOrgCurType = typeof jOrgCur;
        var jAimCurType = typeof jAimCur;
        switch (jAimCurType) {
            case "object":

                if (Array.isArray(jAimCur)) { //目标属性是个数组

                    switch (jOrgCurType) {
                        case "object":
                            if (Array.isArray(jOrgCur)) { //源属性是个数组
                                this.tran_Array_Array(jOrg, jAim, mappings, mapping);
                            }
                            else {//源属性是个对象
                                this.tran_Object_Array(jOrg, jAim, mappings, mapping);
                            }

                            break;
                        case "string":
                        case "number":
                        case "boolean":
                        default:
                            //源属性是个基础类型
                            this.tran_Base_Array(jOrg, jAim, mappings, mapping);
                    }

                } else { //目标属性是个对象
                    switch (jOrgCurType) {
                        case "object":
                            if (Array.isArray(jOrgCur)) { //源属性是个数组
                                this.tran_Array_Object(jOrg, jAim, mappings, mapping);
                            }
                            else {//源属性是个对象
                                this.tran_Object_Object(jOrg, jAim, mappings, mapping);
                            }

                            break;
                        case "string":
                        case "number":
                        case "boolean":
                        default:
                            //源属性是个基础类型
                            this.tran_Base_Object(jOrg, jAim, mappings, mapping);
                    }
                }

                break;
            case "string":
            case "number":
            case "boolean":
            default:
                //目标属性是个基础类型
                switch (jOrgCurType) {
                    case "object":
                        if (Array.isArray(jOrgCur)) { //源属性是个数组
                            this.tran_Array_Base(jOrg, jAim, mappings, mapping);
                        }
                        else {//源属性是个对象
                            this.tran_Object_Base(jOrg, jAim, mappings, mapping);
                        }

                        break;
                    case "string":
                    case "number":
                    case "boolean":
                    default:
                        //源属性是个基础类型
                        this.tran_Base_Base(jOrg, jAim, mappings, mapping);
                }
        }

    };

    /**
        * 转换：数组=》数组
        */
    private tran_Array_Array(jOrg: any, jAim: any, mappings: any[], mapping: any): void {

        //1：源Key->目标Key  2：源Key->目标Value  3：源Value->目标Key 4：源Value->目标Value  
        switch (mapping.TranType) {
            case 1:
                this.tran_Key_Key(jOrg, jAim, mappings, mapping);
                break;
            case 2:
                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }

                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;


                /*******************执行转换******************* */

                if (mapping.Options) {
                    //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
                    if (mapping.Options.AddElementsOption == 2) {
                        if (!this.replaceAimArr.find(path => path == mapping.AimJsonPath)) {
                            jAimCur.splice(0, jAimCur.length);
                            this.replaceAimArr.push(mapping.AimJsonPath)
                        }

                    }
                }

                jAimCur.push(jOrgCurKey);

                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);

                break;
            case 3:
                this.tran_Value_Key(jOrg, jAim, mappings, mapping);
                break;
            case 4:


                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;

                /****************执行转换******************* */


                var jAim_CurChild = JSON.parse(JSON.stringify(jAimCur[0]));
                if (mapping.Options) {
                    //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
                    if (mapping.Options.AddElementsOption == 2) {

                        if (!this.replaceAimArr.find(path => path == mapping.AimJsonPath)) {
                            jAimCur.splice(0, jAimCur.length);
                            this.replaceAimArr.push(mapping.AimJsonPath)
                        }
                    }

                    //1:将源子元素复制到目标,使用源子元素的Key 2:将源子元素复制到目标,为源子元素新生成Key 3：依据源元素在目标构建同等数量的目标子元素，且如果目标的子元素存在相应的一对一映射【TranWay=2】,则创建源和目标的一对一映射,当前映射一旦设置【TranOP=3】，则TranWay属性设置无效 默认为1
                    //如果转换操作是 "TranOP":"3",  
                    if (mapping.Options.TranOP == 3) {
                        // var regex = new RegExp(`^${jAimCurPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]")}\\[.*?\\]\\.`);
                        // var childMappings = mappings.filter(m => {
                        //     var result = regex.test(m.AimJsonPath);
                        //     return result && m.Options && m.Options.TranWay == 2;
                        // });

                        // //判断【数组 =》数组】的情况下，映射关系里是否包含目标数组属性的映射，如果包含说明客户端已经进行了指定,如果进行了指定则需要进一步处理，如果不存在则将此【数组=》数组】的映射关系删掉并依据原数组元素个数将目标数组元素添加为相等数量
                        // if (childMappings.length <= 0) {


                        // }
                        // else {
                        //     var regexChild = new RegExp(`^${mapping.OrgJsonPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]")}\\[\\*\\]\\.`);

                        //     var childMappingForPatten = childMappings.filter(m => {
                        //         var result = regexChild.test(m.AimJsonPath);
                        //         return result && m.Options && m.Options.TranWay == 2;
                        //     });

                        //     if (childMappingForPatten) {

                        //         for (var i = 0; i < childMappings.length; i++) {
                        //             var childMapping = childMappings[i];

                        //             for (var j = 0; j < jOrgCur.length; j++) {
                        //                 mappings.splice(mappings.indexOf(childMapping) + j, 0,
                        //                     {
                        //                         AimJsonPath: childMapping.AimJsonPath.replace(`${mapping.AimJsonPath}[*]`, `${mapping.AimJsonPath}[${jAimCur.length + j}]`),
                        //                         OrgJsonPath: childMapping.OrgJsonPath.replace(`${mapping.OrgJsonPath}[*]`, `${mapping.OrgJsonPath}[${j}]`),
                        //                         TranType: childMapping.TranType,
                        //                         Options: childMapping.Options
                        //                     });
                        //             }
                        //             mappings.splice(mappings.indexOf(childMapping), 1);

                        //         }

                        //         for (var j = 0; j < jOrgCur.length; j++) {
                        //             jAimCur.push(JSON.parse(JSON.stringify(jAim_CurChild)));
                        //         }

                        //     }
                        // }

                        for (var j = 0; j < jOrgCur.length; j++) {
                            jAim_CurChild = JSON.parse(JSON.stringify(jAim_CurChild));
                            jAimCur.push(jAim_CurChild);
                        }

                    } else {//1:将源子元素复制到目标,使用源子元素的Key 2:将源子元素复制到目标,为源子元素新生成Key
                        jAimCur.push(jOrgCur);
                    }
                } else {
                    jAimCur.push(jOrgCur);
                }

                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);

                break;

            default:
                break;
        }

    }

    /**
     * 转换：对象=》对象
     */
    private tran_Object_Object(jOrg: any, jAim: any, mappings: any[], mapping: any): void {

        //1：源Key->目标Key  2：源Key->目标Value  3：源Value->目标Key 4：源Value->目标Value  
        switch (mapping.TranType) {
            case 1:
                this.tran_Key_Key(jOrg, jAim, mappings, mapping);
                break;
            case 2:

                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;

                /****************执行转换******************* */


                var jAimChildKey = null;
                for (const key in jAimCur) {
                    jAimChildKey = key;
                    break;
                }

                //设置对象新生成属性的初始索引
                var keyInitIndex = 0;

                if (mapping.Options) {
                    //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
                    if (mapping.Options.AddElementsOption == 2) {

                        if (!this.replaceAimArr.find(path => path == mapping.AimJsonPath)) {
                            for (let prop in jAimCur) {
                                delete jAimCur[prop];
                            }
                            this.replaceAimArr.push(mapping.AimJsonPath)
                        }
                    }

                    keyInitIndex = mapping.Options ? (mapping.Options.KeyInitIndex || 0) : 0;
                }



                if (jAimChildKey) {
                    jAimCur[`${jAimChildKey}_${(Object.keys(jAimCur).length + 1).toString().padStart(4, '0')}_${(keyInitIndex)}`] = jOrgCurKey;
                }


                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);



                break;
            case 3:
                this.tran_Value_Key(jOrg, jAim, mappings, mapping);
                break;
            case 4:


                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;

                /****************执行转换******************* */

                var jAimChildKey = null;
                for (const key in jAimCur) {
                    jAimChildKey = key;
                    break;
                }
                var jAim_CurChild_Org = null;
                if (jAimChildKey) {
                    jAim_CurChild_Org = JSON.parse(JSON.stringify(jAimCur[jAimChildKey]));
                }
                //设置对象新生成属性的初始索引
                var keyInitIndex = 0;

                if (mapping.Options) {
                    //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
                    if (mapping.Options.AddElementsOption == 2) {

                        if (!this.replaceAimArr.find(path => path == mapping.AimJsonPath)) {
                            for (let prop in jAimCur) {
                                delete jAimCur[prop];
                            }
                            this.replaceAimArr.push(mapping.AimJsonPath)
                        }

                    }

                    keyInitIndex = mapping.Options ? (mapping.Options.KeyInitIndex || 0) : 0;

                    var aimKey = "";
                    if (jAimChildKey) {
                        //1:将源子元素复制到目标,使用源子元素的Key 2:将源子元素复制到目标,为源子元素新生成Key 3：依据源元素在目标构建同等数量的目标子元素，且如果目标的子元素存在相应的一对一映射【TranWay=2】,则创建源和目标的一对一映射,当前映射一旦设置【TranOP=3】，则TranWay属性设置无效 默认为1
                        //如果转换操作是 "TranOP":"3",  
                        if (mapping.Options.TranOP == 3) {

                            // var regex = new RegExp(`^${jAimCurPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]")}\\.`);
                            // var childMappings = mappings.filter(m => {
                            //     var result = regex.test(m.AimJsonPath);
                            //     return result && m.Options && m.Options.TranWay == 2;
                            // });

                            // //判断【对象 =》对象】的情况下，映射关系里是否包含目标对象属性的映射，如果包含说明客户端已经进行了指定在此不做默认处理，如果不存在则按默认操作将目标对象和源对象按照属性名和TransType 进行映射
                            // if (childMappings.length <= 0) {
                            //     ``
                            //     var orgChildKeyList = [];
                            //     for (const orgChildKey in jOrgCur) {
                            //         orgChildKeyList.push(orgChildKey);
                            //     }
                            //     //轮询所有目标对象的所有属性构建与源对象同属性名的映射
                            //     var keyIndex = 0;
                            //     for (const aimChildKey in jAimCur) {
                            //         if (orgChildKeyList.find(k => k == aimChildKey)) {
                            //             var orgChildKey = aimChildKey;
                            //             mappings.splice(mappings.indexOf(mapping) + keyIndex, 0, {
                            //                 AimJsonPath: `${mapping.AimJsonPath}.${aimChildKey}`,
                            //                 OrgJsonPath: `${mapping.OrgJsonPath}.${orgChildKey}`,
                            //                 TranType: mapping.TranType,
                            //                 Options: mapping.Options
                            //             });
                            //             keyIndex++;
                            //         }
                            //     }

                            // }


                            
                            for (var j = 0; j < Object.keys(jOrgCur).length; j++) {
                                var aimKey = `${jAimChildKey}_${(Object.keys(jAimCur).length + 1+j).toString().padStart(4, '0')}_${(keyInitIndex+j)}`;
                                jAimCur[aimKey] = JSON.parse(JSON.stringify(jAim_CurChild_Org));
                            }

                        } else if (mapping.Options.TranOP == 2) {// 2:将源子元素复制到目标,为源子元素新生成Key
                            var aimKey = `${jAimChildKey}_${(Object.keys(jAimCur).length + 1).toString().padStart(4, '0')}_${(keyInitIndex)}`;
                            jAimCur[aimKey] = JSON.parse(JSON.stringify(jOrgCur));
                        } else {//1：将源子元素复制到目标,使用源子元素的Key
                            var aimKey = `${jOrgCurKey}`;
                            jAimCur[aimKey] = JSON.parse(JSON.stringify(jOrgCur));
                        }


                    }

                } else {
                    if (jAimChildKey) {
                        jAimCur[`${jOrgCurKey}`] = JSON.parse(JSON.stringify(jOrgCur));
                    }
                }


                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);

                break;

            default:
                break;
        }
    }

    /**
         * 转换：对象=》数组
         */
    private tran_Object_Array(jOrg: any, jAim: any, mappings: any[], mapping: any): void {

        //1：源Key->目标Key  2：源Key->目标Value  3：源Value->目标Key 4：源Value->目标Value  
        switch (mapping.TranType) {
            case 1:
                this.tran_Key_Key(jOrg, jAim, mappings, mapping);
                break;
            case 2:


                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;

                /****************执行转换******************* */

                if (mapping.Options) {
                    //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
                    if (mapping.Options.AddElementsOption == 2) {
                        if (!this.replaceAimArr.find(path => path == mapping.AimJsonPath)) {
                            jAimCur.splice(0, jAimCur.length);
                            this.replaceAimArr.push(mapping.AimJsonPath)
                        }
                    }
                }

                jAimCur.push(jOrgCurKey);

                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);




                break;
            case 3:
                this.tran_Value_Key(jOrg, jAim, mappings, mapping);
                break;
            case 4:


                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;

                /****************执行转换******************* */

                var jAim_CurChild = JSON.parse(JSON.stringify(jAimCur[0]));
                if (mapping.Options) {
                    //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
                    if (mapping.Options.AddElementsOption == 2) {

                        if (!this.replaceAimArr.find(path => path == mapping.AimJsonPath)) {
                            jAimCur.splice(0, jAimCur.length);
                            this.replaceAimArr.push(mapping.AimJsonPath)
                        }
                    }

                    //1:将源子元素复制到目标,使用源子元素的Key 2:将源子元素复制到目标,为源子元素新生成Key 3：依据源元素在目标构建同等数量的目标子元素，且如果目标的子元素存在相应的一对一映射【TranWay=2】,则创建源和目标的一对一映射,当前映射一旦设置【TranOP=3】，则TranWay属性设置无效 默认为1
                    //如果转换操作是 "TranOP":"3",  
                    if (mapping.Options.TranOP == 3) {
                        // var regex = new RegExp(`^${jAimCurPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]")}\\[.*?\\]\\.`);
                        // var childMappings = mappings.filter(m => {
                        //     var result = regex.test(m.AimJsonPath);
                        //     return result && m.Options && m.Options.TranWay == 2;
                        // });

                        // //判断【对象 =》数组】的情况下，映射关系里是否包含目标数组属性的映射，如果包含说明客户端已经进行了指定,如果在指定的映射中源路径包含类似【a.*】则需要进一步处理，否则不做默认处理，如果不存在则将此【对象=》数组】的映射关系删掉，因为系统不知如何将其转换为数组
                        // if (childMappings.length > 0) {


                        //     var regexChild = new RegExp(`^${mapping.OrgJsonPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]")}\\.\\*`);

                        //     var childMappingList = childMappings.filter(m => {
                        //         var result = regexChild.test(m.OrgJsonPath);
                        //         return result;
                        //     });



                        //     var jOrg_CurKeys: any = [];

                        //     for (const key in jOrgCur) {
                        //         jOrg_CurKeys.push(key);
                        //     }

                        //     for (var i = 0; i < jOrg_CurKeys.length; i++) {
                        //         childMappings.forEach(childMapping => {
                        //             mappings.splice(mappings.indexOf(childMapping) + i, 0, {
                        //                 AimJsonPath: childMapping.AimJsonPath.replace(`${mapping.AimJsonPath}[*]`, `${mapping.AimJsonPath}[${jAimCur.length}]`),
                        //                 OrgJsonPath: childMapping.OrgJsonPath.replace(`${mapping.OrgJsonPath}.*`, `${mapping.OrgJsonPath}.${jOrg_CurKeys[i]}`),
                        //                 TranType: childMapping.TranType,
                        //                 Options: childMapping.Options
                        //             });
                        //         });

                        //         jAimCur.push(JSON.parse(JSON.stringify(jAim_CurChild)));
                        //     }
                        //     childMappingList.forEach(item => {
                        //         mappings.splice(mappings.indexOf(item), 1);
                        //     });

                        // }


                        var jOrg_CurKeys: any = [];

                        for (const key in jOrgCur) {
                            jOrg_CurKeys.push(key);
                        }

                        for (var i = 0; i < jOrg_CurKeys.length; i++) {
                            jAimCur.push(JSON.parse(JSON.stringify(jAim_CurChild)));
                        }



                    } else {//1:将源子元素复制到目标,使用源子元素的Key 2:将源子元素复制到目标,为源子元素新生成Key 
                        jAimCur.push(JSON.parse(JSON.stringify(jOrgCur)));
                    }
                } else {
                    jAimCur.push(JSON.parse(JSON.stringify(jOrgCur)));
                }





                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);

                break;

            default:
                break;
        }
    }

    /**
         * 转换：数组=》对象
         */
    private tran_Array_Object(jOrg: any, jAim: any, mappings: any[], mapping: any): void {
        //1：源Key->目标Key  2：源Key->目标Value  3：源Value->目标Key 4：源Value->目标Value  
        switch (mapping.TranType) {
            case 1:
                this.tran_Key_Key(jOrg, jAim, mappings, mapping);
                break;
            case 2:

                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;

                /****************执行转换******************* */
                var jAimChildKey = null;
                for (const key in jAimCur) {
                    jAimChildKey = key;
                    break;
                }

                //设置对象新生成属性的初始索引
                var keyInitIndex = 0;

                if (mapping.Options) {
                    //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
                    if (mapping.Options.AddElementsOption == 2) {

                        if (!this.replaceAimArr.find(path => path == mapping.AimJsonPath)) {
                            for (let prop in jAimCur) {
                                delete jAimCur[prop];
                            }
                            this.replaceAimArr.push(mapping.AimJsonPath)
                        }
                    }

                    keyInitIndex = mapping.Options ? (mapping.Options.KeyInitIndex || 0) : 0;
                }




                if (jAimChildKey) {
                    jAimCur[`${jAimChildKey}_${(Object.keys(jAimCur).length + 1).toString().padStart(4, '0')}_${(keyInitIndex)}`] = jOrgCurKey;
                }


                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);


                break;
            case 3:
                this.tran_Value_Key(jOrg, jAim, mappings, mapping);
                break;
            case 4:


                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;

                /****************执行转换******************* */

                var jAimChildKey = null;
                for (const key in jAimCur) {
                    jAimChildKey = key;
                    break;
                }

                var jAim_CurChild_Org = null;
                if (jAimChildKey) {
                    jAim_CurChild_Org = JSON.parse(JSON.stringify(jAimCur[jAimChildKey]));
                }
                //设置对象新生成属性的初始索引
                var keyInitIndex = 0;

                if (mapping.Options) {
                    //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
                    if (mapping.Options.AddElementsOption == 2) {

                        if (!this.replaceAimArr.find(path => path == mapping.AimJsonPath)) {
                            for (let prop in jAimCur) {
                                delete jAimCur[prop];
                            }
                            this.replaceAimArr.push(mapping.AimJsonPath)
                        }
                    }

                    keyInitIndex = mapping.Options ? (mapping.Options.KeyInitIndex || 0) : 0;


                    if (jAimChildKey) {
                        var aimKey = "";
                        //1:将源子元素复制到目标,使用源子元素的Key 2:将源子元素复制到目标,为源子元素新生成Key 3：依据源元素在目标构建同等数量的目标子元素，且如果目标的子元素存在相应的一对一映射【TranWay=2】,则创建源和目标的一对一映射,当前映射一旦设置【TranOP=3】，则TranWay属性设置无效 默认为1
                        //如果转换操作是 "TranOP":"3",  
                        if (mapping.Options.TranOP == 3) {

                            // var regex = new RegExp(`^${jAimCurPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]")}\\.\\w*$`);
                            // var childMappings = mappings.filter(m => {
                            //     var result = regex.test(m.AimJsonPath);
                            //     return result;
                            //     // return result && m.Options && m.Options.TranWay == 2;//这个误删已做记录，为什么不用过滤TranWay因为，数组在生成对象时会动态生成属性的key所以我们要更改其下所有子节点的路径映射
                            // });

                            // //判断【数组 =》对象】的情况下，映射关系里是否包含目标对象属性的映射且转换类型是【3：源Value->目标Key或4：源Value->目标Value】，如果包含说明客户端已经进行了指定在此需进一步处理，如果不存在则将此【数组=》对象】的映射关系删掉，因为系统不知如何将其转换为对象
                            // if (childMappings.length > 0) {


                            //     var jAimCurChildCount = Object.keys(jAimCur).length;
                            //     for (var j = 0; j < jOrgCur.length; j++) {
                            //         jAimCur[`${jAimChildKey}_${(jAimCurChildCount + 1 + j).toString().padStart(4, '0')}_${(keyInitIndex + j)}`] = JSON.parse(JSON.stringify(jAim_CurChild_Org));
                            //     }


                            //     for (var i = 0; i < childMappings.length; i++) {

                            //         var childMapping = childMappings[i];

                            //         var childMappings_Child = mappings.filter(m => m.AimJsonPath.indexOf(`${childMapping.AimJsonPath}.`) >= 0);


                            //         for (var j = 0; j < jOrgCur.length; j++) {
                            //             var orgJsonPath = childMapping.OrgJsonPath.replace("[*]", `[${j}]`);
                            //             var newMapping =
                            //             {
                            //                 AimJsonPath: `${childMapping.AimJsonPath}${`_${(jAimCurChildCount + 1 + j).toString().padStart(4, '0')}_${(keyInitIndex + j)}`}`,
                            //                 OrgJsonPath: `${orgJsonPath}`,
                            //                 TranType: childMapping.TranType,
                            //                 Options: childMapping.Options
                            //             };



                            //             childMappings_Child.forEach(m => {
                            //                 var aimChildJsonPath = m.AimJsonPath.replace(`${childMapping.AimJsonPath}.`, `${newMapping.AimJsonPath}.`);

                            //                 var regexChild = new RegExp(`^${mapping.OrgJsonPath.replace("$", "\\$").replace(".", "\\.").replace("[", "\\[").replace("]", "\\]")}\\[\\*\\]\\..*$`);
                            //                 var result = regexChild.test(m.OrgJsonPath);
                            //                 //由于childMappings包含交叉映射和一对一映射，这里仅处理一对一映射，为了交叉映射走交叉映射的逻辑
                            //                 var orgChildJsonPath = result && m.Options && m.Options.TranWay == 2 ? m.OrgJsonPath.replace(`${mapping.OrgJsonPath}[*].`, `${mapping.OrgJsonPath}[${j}].`) : m.OrgJsonPath;

                            //                 var newMappingChild =
                            //                 {
                            //                     AimJsonPath: aimChildJsonPath,
                            //                     OrgJsonPath: orgChildJsonPath,
                            //                     TranType: m.TranType,
                            //                     Options: m.Options
                            //                 };

                            //                 mappings.splice(mappings.indexOf(m) + 1, 0, newMappingChild);
                            //             });

                            //             mappings.splice(mappings.indexOf(childMapping) + 1, 0, newMapping);
                            //         }


                            //         childMappings_Child.forEach(m => {
                            //             mappings.splice(mappings.indexOf(m), 1);
                            //         });


                            //     }




                            //     childMappings.forEach(item => {
                            //         mappings.splice(mappings.indexOf(item), 1);
                            //     });

                            // }


                            var jAimCurChildCount = Object.keys(jAimCur).length;
                            for (var j = 0; j < jOrgCur.length; j++) {
                                jAimCur[`${jAimChildKey}_${(jAimCurChildCount + 1 + j).toString().padStart(4, '0')}_${(keyInitIndex + j)}`] = JSON.parse(JSON.stringify(jAim_CurChild_Org));
                            }

                        } else if (mapping.Options.TranOP == 2) {
                            aimKey = `${jAimChildKey}_${(Object.keys(jAimCur).length + 1).toString().padStart(4, '0')}_${(keyInitIndex)}`;
                            jAimCur[aimKey] = JSON.parse(JSON.stringify(jOrgCur));
                        } else {
                            aimKey = `${jOrgCurKey}`;
                            jAimCur[aimKey] = JSON.parse(JSON.stringify(jOrgCur));
                        }
                    }

                } else {

                    if (jAimChildKey) {
                        jAimCur[`${jOrgCurKey}`] = JSON.parse(JSON.stringify(jOrgCur));
                    }
                }


                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);

                break;

            default:
                break;
        }
    }

    /**
        * 转换：基础值=》对象
        */
    private tran_Base_Object(jOrg: any, jAim: any, mappings: any[], mapping: any): void {
        //1：源Key->目标Key  2：源Key->目标Value  3：源Value->目标Key 4：源Value->目标Value  
        switch (mapping.TranType) {
            case 1:
                this.tran_Key_Key(jOrg, jAim, mappings, mapping);
                break;
            case 2:

                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;

                /****************执行转换******************* */

                var jAimChildKey = null;
                for (const key in jAimCur) {
                    jAimChildKey = key;
                    break;
                }

                //设置对象新生成属性的初始索引
                var keyInitIndex = 0;

                if (mapping.Options) {
                    //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
                    if (mapping.Options.AddElementsOption == 2) {

                        if (!this.replaceAimArr.find(path => path == mapping.AimJsonPath)) {
                            for (let prop in jAimCur) {
                                delete jAimCur[prop];
                            }
                            this.replaceAimArr.push(mapping.AimJsonPath)
                        }
                    }

                    keyInitIndex = mapping.Options ? (mapping.Options.KeyInitIndex || 0) : 0;
                }



                if (jAimChildKey) {
                    jAimCur[`${jAimChildKey}_${(Object.keys(jAimCur).length + 1).toString().padStart(4, '0')}_${(keyInitIndex)}`] = jOrgCurKey;
                }


                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);

                break;
            case 3:
                this.tran_Value_Key(jOrg, jAim, mappings, mapping);
                break;
            case 4:


                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;

                /****************执行转换******************* */
                var jAimChildKey = null;
                for (const key in jAimCur) {
                    jAimChildKey = key;
                    break;
                }
                var jAim_CurChild_Org = null;
                if (jAimChildKey) {
                    jAim_CurChild_Org = JSON.parse(JSON.stringify(jAimCur[jAimChildKey]));
                }
                //设置对象新生成属性的初始索引
                var keyInitIndex = 0;

                if (mapping.Options) {
                    //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
                    if (mapping.Options.AddElementsOption == 2) {

                        if (!this.replaceAimArr.find(path => path == mapping.AimJsonPath)) {
                            for (let prop in jAimCur) {
                                delete jAimCur[prop];
                            }
                            this.replaceAimArr.push(mapping.AimJsonPath)
                        }
                    }

                    keyInitIndex = mapping.Options ? (mapping.Options.KeyInitIndex || 0) : 0;

                }


                if (jAimChildKey) {

                    if (mapping.Options && mapping.Options.TranOP == 3) {
                        var aimKey = `${jAimChildKey}_${(Object.keys(jAimCur).length + 1).toString().padStart(4, '0')}_${(keyInitIndex)}`;
                        jAimCur[aimKey] = JSON.parse(JSON.stringify(jAim_CurChild_Org));
                    }
                    else if (mapping.Options && mapping.Options.TranOP == 2) {
                        var aimKey = `${jAimChildKey}_${(Object.keys(jAimCur).length + 1).toString().padStart(4, '0')}_${(keyInitIndex)}`;
                        jAimCur[aimKey] = JSON.parse(JSON.stringify(jOrgCur));
                    } else {
                        var aimKey = `${jOrgCurKey}`;
                        jAimCur[aimKey] = JSON.parse(JSON.stringify(jOrgCur));
                    }

                }


                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);

                break;

            default:
                break;
        }
    }

    /**
     * 转换：基础值=》数组
     */
    private tran_Base_Array(jOrg: any, jAim: any, mappings: any[], mapping: any): void {
        //1：源Key->目标Key  2：源Key->目标Value  3：源Value->目标Key 4：源Value->目标Value  
        switch (mapping.TranType) {
            case 1:
                this.tran_Key_Key(jOrg, jAim, mappings, mapping);
                break;
            case 2:



                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;

                /****************执行转换******************* */

                if (mapping.Options) {
                    //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
                    if (mapping.Options.AddElementsOption == 2) {

                        if (!this.replaceAimArr.find(path => path == mapping.AimJsonPath)) {
                            jAimCur.splice(0, jAimCur.length);
                            this.replaceAimArr.push(mapping.AimJsonPath)
                        }
                    }

                }

                jAimCur.push(jOrgCurKey);

                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);



                break;
            case 3:
                this.tran_Value_Key(jOrg, jAim, mappings, mapping);
                break;
            case 4:



                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;

                /****************执行转换******************* */
                var jAim_CurChild = JSON.parse(JSON.stringify(jAimCur[0]));
                if (mapping.Options) {
                    //1:追加新元素到数组/对象 2：替换数组/对象的原有属性  默认为1
                    if (mapping.Options.AddElementsOption == 2) {
                        if (!this.replaceAimArr.find(path => path == mapping.AimJsonPath)) {
                            jAimCur.splice(0, jAimCur.length);
                            this.replaceAimArr.push(mapping.AimJsonPath)
                        }
                    }
                }

                if (mapping.Options && mapping.Options.TranOP == 3) {
                    jAimCur.push(JSON.parse(JSON.stringify(jAim_CurChild)));

                } else {//1:将源子元素复制到目标,使用源子元素的Key 2:将源子元素复制到目标,为源子元素新生成Key 
                    jAimCur.push(JSON.parse(JSON.stringify(jOrgCur)));
                }




                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);

                break;

            default:
                break;
        }
    }

    /**
     * 转换：数组=》基础值
     */
    private tran_Array_Base(jOrg: any, jAim: any, mappings: any[], mapping: any): void {

        //1：源Key->目标Key  2：源Key->目标Value  3：源Value->目标Key 4：源Value->目标Value  
        switch (mapping.TranType) {
            case 1:
                this.tran_Key_Key(jOrg, jAim, mappings, mapping);
                break;
            case 2:
                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;


                /*******************执行转换******************* */

                jAimCurParent[jAimCurKey] = jOrgCurKey



                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);
                break;
            case 3:
                this.tran_Value_Key(jOrg, jAim, mappings, mapping);
                break;
            case 4:


                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;


                jAimCurParent[jAimCurKey] = jOrgCur

                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);

                break;

            default:
                break;
        }

    }

    /**
     * 转换：对象=》基础值
     */
    private tran_Object_Base(jOrg: any, jAim: any, mappings: any[], mapping: any): void {

        //1：源Key->目标Key  2：源Key->目标Value  3：源Value->目标Key 4：源Value->目标Value  
        switch (mapping.TranType) {
            case 1:
                this.tran_Key_Key(jOrg, jAim, mappings, mapping);
                break;
            case 2:
                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;


                /*******************执行转换******************* */

                jAimCurParent[jAimCurKey] = jOrgCurKey



                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);
                break;
            case 3:
                this.tran_Value_Key(jOrg, jAim, mappings, mapping);
                break;
            case 4:


                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;


                jAimCurParent[jAimCurKey] = jOrgCur

                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);

                break;

            default:
                break;
        }

    }

    /**
    * 转换：基础值=》基础值
    */
    private tran_Base_Base(jOrg: any, jAim: any, mappings: any[], mapping: any): void {

        //1：源Key->目标Key  2：源Key->目标Value  3：源Value->目标Key 4：源Value->目标Value  
        switch (mapping.TranType) {
            case 1:
                this.tran_Key_Key(jOrg, jAim, mappings, mapping);
                break;
            case 2:
                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                if (!jOrgCur || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;


                /*******************执行转换******************* */

                jAimCurParent[jAimCurKey] = jOrgCurKey



                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);
                break;
            case 3:
                this.tran_Value_Key(jOrg, jAim, mappings, mapping);
                break;
            case 4:


                var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
                var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

                //判断原映射是否是变量/函数
                let result = /^#.*#$/.test(mapping.OrgJsonPath);
                if (!jOrgCur && !result || !jAimCur) {
                    if (!jOrgCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
                    }
                    if (!jAimCur) {
                        this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
                    }
                    //转换完成则删掉当前映射
                    mappings.splice(mappings.indexOf(mapping), 1);
                    return;
                }


                var jAimCurPath = mapping.AimJsonPath;
                var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
                var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
                var jAimCurParentPaths = lodash.initial(jAimCurPaths);
                var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


                var jOrgCurPath = mapping.OrgJsonPath;
                var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
                var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
                var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
                var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

                var newJAimCurPath = jAimCurPath;


                //如果源的映射没有定位到元素
                if (!jOrgCur) {
                    //判断原映射是否是变量/函数
                    let result = /^#.*#$/.test(mapping.OrgJsonPath);
                    if (result) {
                        jAimCurParent[jAimCurKey] = this.getVaraibleValue(mapping.OrgJsonPath);
                    }
                }
                else {
                    jAimCurParent[jAimCurKey] = jOrgCur
                }

                //转换完成则删掉当前映射
                mappings.splice(mappings.indexOf(mapping), 1);

                break;

            default:
                break;
        }


    }

    /**
     * 转换（通用）：1：Key=>Key
     * @param jOrg 
     * @param jAim 
     * @param mappings 
     * @param mapping 
     */
    private tran_Key_Key(jOrg: any, jAim: any, mappings: any[], mapping: any): void {

        var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
        var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

        if (!jOrgCur || !jAimCur) {
            if (!jOrgCur) {
                this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
            }
            if (!jAimCur) {
                this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
            }
            //转换完成则删掉当前映射
            mappings.splice(mappings.indexOf(mapping), 1);
            return;
        }


        var jAimCurPath = mapping.AimJsonPath;
        var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
        var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
        var jAimCurParentPaths = lodash.initial(jAimCurPaths);
        var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


        var jOrgCurPath = mapping.OrgJsonPath;
        var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
        var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
        var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
        var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

        var newJAimCurPath = jAimCurPath;


        /*******************执行转换******************* */


        if (Array.isArray(jAimCurParent)) { //属性是个数组
            jAimCurParent.splice(jAimCurParent.indexOf(jAimCur), 1);
            newJAimCurPath = this.replaceLastStrs(`${jAimCurPath}`, `[${jOrgCurKey}]`, 1);
            //使用源的Key和目标的值构造一个目标父亲的新属性
            jAimCurParent[jOrgCurKey] = jAimCur
        } else { //属性是个对象

            // var rebuildProps = [];
            // var isRecord = false;
            // for (const key in jAimCurParent) {
            //     var newKey = key;
            //     if (key == jAimCurKey) {
            //         isRecord = true;
            //         newKey = jOrgCurKey;
            //     }
            //     if (isRecord) {
            //         rebuildProps.push({ "key": newKey, "value": jAimCurParent[key] })
            //         delete jAimCurParent[key];
            //     }
            // }

            // rebuildProps.forEach(item => {
            //     jAimCurParent[item.key] = item.value;
            // });

            delete jAimCurParent[jAimCurKey];
            newJAimCurPath = this.replaceLastStrs(`${jAimCurPath}`, `${jOrgCurKey}`, 2);
            jAimCurParent[jOrgCurKey] = jAimCur;

        }




        var replaceMappting = jAimCurPath;
        var regex = new RegExp(replaceMappting.replaceAll("[", "\\[").replaceAll("]", "\\]") + "(\\..*|\\[(\\w+|\\*).*\\]|$)");
        var relMappings1 = mappings.filter(m => {
            let result = regex.test(m.AimJsonPath);
            return result;
        })
        relMappings1.forEach(item => {
            item.AimJsonPath = item.AimJsonPath.replace(`${replaceMappting}`, newJAimCurPath);
        });


        //转换完成则删掉当前映射
        mappings.splice(mappings.indexOf(mapping), 1);

    }

    /**
    * 转换（通用）：2：Key=>Value
    * @param jOrg 
    * @param jAim 
    * @param mappings 
    * @param mapping 
    */
    private tran_Key_Value(jOrg: any, jAim: any, mappings: any[], mapping: any): void {

        //由于每种类型的Key到Value的转换都不一样，所以此方法不实现
        throw Error("此方法未实现！");

    }

    /**
     * 转换（通用）：3：Value=>Key
     * @param jOrg 
     * @param jAim 
     * @param mappings 
     * @param mapping 
     */
    private tran_Value_Key(jOrg: any, jAim: any, mappings: any[], mapping: any): void {


        var jAimCur = this.getElementByPath(jAim, mapping.AimJsonPath);
        var jOrgCur = this.getElementByPath(jOrg, mapping.OrgJsonPath);

        if (!jOrgCur || !jAimCur) {
            if (!jOrgCur) {
                this.tranErrors.push(`${JSON.stringify(mapping)} 源路径定位不到属性！`)
            }
            if (!jAimCur) {
                this.tranErrors.push(`${JSON.stringify(mapping)} 目标路径定位不到属性！`)
            }
            //转换完成则删掉当前映射
            mappings.splice(mappings.indexOf(mapping), 1);
            return;
        }


        var jAimCurPath = mapping.AimJsonPath;
        var jAimCurPaths = lodash.toPath(mapping.AimJsonPath);
        var jAimCurKey = JSON.parse(JSON.stringify(jAimCurPaths)).splice(jAimCurPaths.length - 1, 1)[0];
        var jAimCurParentPaths = lodash.initial(jAimCurPaths);
        var jAimCurParent = lodash.get(jAim, jAimCurParentPaths, jAim);


        var jOrgCurPath = mapping.OrgJsonPath;
        var jOrgCurPaths = lodash.toPath(mapping.OrgJsonPath);
        var jOrgCurKey = JSON.parse(JSON.stringify(jOrgCurPaths)).splice(jOrgCurPaths.length - 1, 1)[0];
        var jOrgCurParentPaths = lodash.initial(jOrgCurPaths);
        var jOrgCurParent = lodash.get(jOrg, jOrgCurParentPaths, jOrg);

        var newJAimCurPath = jAimCurPath;


        /*******************执行转换******************* */


        if (Array.isArray(jAimCurParent)) { //属性是个数组
            jAimCurParent.splice(jAimCurParent.indexOf(jAimCur), 1);
            newJAimCurPath = this.replaceLastStrs(`${jAimCurPath}`, `[${jOrgCur}]`, 1);
            jAimCurParent[jOrgCur] = jAimCur
        } else { //属性是个对象

            // var rebuildProps = [];
            // var isRecord = false;
            // for (const key in jAimCurParent) {
            //     var newKey = key;
            //     if (key == jAimCurKey) {
            //         isRecord = true;
            //         newKey = jOrgCur;
            //     }
            //     if (isRecord) {
            //         rebuildProps.push({ "key": newKey, "value": jAimCurParent[key] })
            //         delete jAimCurParent[key];
            //     }
            // }

            // rebuildProps.forEach(item => {
            //     jAimCurParent[item.key] = item.value;

            // });

            delete jAimCurParent[jAimCurKey];
            newJAimCurPath = this.replaceLastStrs(`${jAimCurPath}`, `${jOrgCur}`, 2);
            jAimCurParent[jOrgCur] = jAimCur;
        }



        var replaceMappting = mapping.AimJsonPath;

        var regex = new RegExp(replaceMappting.replaceAll("[", "\\[").replaceAll("]", "\\]") + "(\\..*|\\[(\\w+|\\*).*\\]|$)");
        var relMappings1 = mappings.filter(m => {
            let result = regex.test(m.AimJsonPath);
            return result;
        })

        relMappings1.forEach(item => {
            item.AimJsonPath = item.AimJsonPath.replace(`${replaceMappting}`, newJAimCurPath);
        });


        //转换完成则删掉当前映射
        mappings.splice(mappings.indexOf(mapping), 1);

    }


    /**
     * 转换（通用）：4：Value=>Value
     * @param jOrg 
     * @param jAim 
     * @param mappings 
     * @param mapping 
     */
    private tran_Value_Value(jOrg: any, jAim: any, mappings: any[], mapping: any): void {


        //由于每种类型的Value到Value的转换都不一样，所以此方法不实现
        throw Error("此方法未实现！");


    }

    /**********************私有方法 结束*************************** */



    /**
         * 转换Json
         */
    public tranJson(): any {

        // //将mapping排序
        // this.mappings = this.mappings.sort((a, b) => {
        //     if (a.AimJsonPath == b.AimJsonPath) {
        //         if (a.TranType != b.TranType) {
        //             if (a.TranType == 1 || a.TranType == 3) {
        //                 return -1;
        //             }
        //             if (b.TranType == 1 || b.TranType == 3) {
        //                 return 1;
        //             }
        //             return a.TranType - b.TranType;
        //         } else if (a.OrgJsonPath != b.OrgJsonPath) {
        //             return a.OrgJsonPath.localeCompare(b.OrgJsonPath);
        //         }
        //     } else if (a.AimJsonPath != b.AimJsonPath) {
        //         return a.AimJsonPath.localeCompare(b.AimJsonPath);
        //     }
        // });


        //轮询mapping并进行处理，注意这里的mappings一定是排好序的，因为会依据排序的顺序动态改变目标元素，针对目标路径包含【*、[*]】的情况会影响接下来的mapping展开操作
        this.tranLogs.push(`当前映射：${JSON.stringify(this.mappings)}`)
        this.tranLogs.push(`当前目标：${JSON.stringify(this.jAim)}`)
        while (this.mappings.length > 0) {
            let mappingItem = this.mappings[0];
            this.tranLogs.push(`*************************开始****************************`)

            //源路径包含*需要特殊处理
            if (mappingItem.OrgJsonPath.indexOf("*") >= 0) {
                this.tranLogs.push(`处理源规则映射：${mappingItem.OrgJsonPath}`)
                this.expandMappingForPatten(this.jAim, this.jOrg, this.mappings, mappingItem, 1);
            }
            //目标路径包含*需要特殊处理
            else if (mappingItem.AimJsonPath.indexOf("*") >= 0) {
                this.tranLogs.push(`处理目标规则映射：${mappingItem.AimJsonPath}`)
                this.expandMappingForPatten(this.jAim, this.jOrg, this.mappings, mappingItem, 2);
            }
            //如果源路径和目标路径都没有包含【*、[*]】的情况，那就针对当前mapping进行转换
            else {
                this.tranLogs.push(`执行转换的映射:${JSON.stringify(mappingItem)}`)
                this.tranJson_Inner(this.jOrg, this.jAim, this.mappings, mappingItem)
            }
            this.tranLogs.push(`转换后映射：${JSON.stringify(this.mappings)}`)
            this.tranLogs.push(`转换后目标：${JSON.stringify(this.jAim)}`)
            this.tranLogs.push(`*************************结束****************************`)
        }


        // this.tranLogs.forEach(log => {
        //     console.log(log);
        // })

        return this.jAim.root;
    };

    /**
     * 检查JsonMapping信息
     *
     * @return
     */
    public checkJsonMapping(): any {

        var checkResults: any[] = [];


        checkResults = [];
        this.mappings.forEach(jsonMapping => {
            let resultAimMsg: any = "";
            let resultOrgMsg: any = "";
            var checkResult = { mapping: jsonMapping, AimMsg: "", OrgMsg: "" };

            /***************************验证路径有效性*************************** */
            var regex = new RegExp(this.Json_Path_Regex);
            let result = regex.test(jsonMapping.OrgJsonPath);
            //判断原映射是否是变量/函数
            let result_var = /^#.*#$/.test(jsonMapping.OrgJsonPath);
            if (!result && !result_var) {
                resultOrgMsg = `${resultOrgMsg}【${jsonMapping.OrgJsonPath}】Json路径验证失败！`;
            }
            result = regex.test(jsonMapping.AimJsonPath);
            if (!result) {
                resultAimMsg = `${resultAimMsg}【${jsonMapping.AimJsonPath}】Json路径验证失败！`;
            }

            /***************************验证路径是否定位到属性*************************** */

            //验证源路径
            let orgJsonPath = jsonMapping.OrgJsonPath.replaceAll("[*]", "[0]");
            while (orgJsonPath.indexOf(".*") >= 0) {
                let tempOrgJsonPath = orgJsonPath.substring(0, orgJsonPath.indexOf(".*"));
                if (tempOrgJsonPath != null && orgJsonPath != "") {
                    let jsonMember = lodash.get(this.jOrg, tempOrgJsonPath);
                    if (jsonMember == null) {
                        resultOrgMsg = `${resultOrgMsg}【${jsonMapping.OrgJsonPath}】Json路径无法定位到json属性！`;
                    }


                    if (Object.keys(jsonMember).length <= 0) {
                        resultOrgMsg = `${resultOrgMsg}【${jsonMapping.OrgJsonPath}】Json路径没有子属性！`;
                    }
                    orgJsonPath = orgJsonPath.replace(tempOrgJsonPath + ".*", tempOrgJsonPath + "." + Object.keys(jsonMember)[0]);
                }

            }
            let jsonMember = lodash.get(this.jOrg, orgJsonPath);
            if (jsonMember == null) {
                //判断原映射是否是变量/函数
                let result = /^#.*#$/.test(orgJsonPath);
                if (!result) {
                    resultOrgMsg = `${resultOrgMsg}【${jsonMapping.OrgJsonPath}】Json路径无法定位到json属性！`;
                }

            }


            //验证目标路径
            let aimJsonPath = jsonMapping.AimJsonPath.replaceAll("[*]", "[0]");
            while (aimJsonPath.indexOf(".*") >= 0) {
                let tempAimJsonPath = aimJsonPath.substring(0, aimJsonPath.indexOf(".*"));
                if (tempAimJsonPath != null && aimJsonPath != "") {
                    let jsonMemberAim = lodash.get(this.jAim, tempAimJsonPath);
                    if (jsonMemberAim == null) {
                        resultAimMsg = `${resultAimMsg}【${jsonMapping.AimJsonPath}】Json路径无法定位到json属性！`;
                    }

                    if (Object.keys(jsonMemberAim).length <= 0) {
                        resultAimMsg = `${resultAimMsg}【${jsonMapping.AimJsonPath}】Json路径没有子属性！`;
                    }
                    aimJsonPath = aimJsonPath.replace(tempAimJsonPath + ".*", tempAimJsonPath + "." + Object.keys(jsonMemberAim)[0]);
                }

            }
            let jsonMemberAim = lodash.get(this.jAim, aimJsonPath);
            if (jsonMemberAim == null) {
                resultAimMsg = `${resultAimMsg}【${jsonMapping.AimJsonPath}】Json路径无法定位到json属性！`;
            }

            checkResult.OrgMsg = resultOrgMsg;
            checkResult.AimMsg = resultAimMsg;

            checkResults.push(checkResult);
        });

        try {
            this.tranJson();
        } catch (error) {
            this.tranErrors.push(error);
        }

        return { "compileErrors": checkResults, "runtimeErrors": this.tranErrors };
    }

    /**
       * 获取转换日志
       *
       * @return
       */
    public getTranLogs(): any {
        return this.tranLogs;
    }

    /**
       * 获取转换错误
       *
       * @return
       */
    public getTranErrors(): any {
        return this.tranErrors;
    }

    /**
   * 获取压缩后的源Json信息
   *
   * @return
   */
    public getSimpleOrgJson(): any {

        var tempOrgTemplate = JSON.parse(JSON.stringify(this.jOrg));
        return tempOrgTemplate;

    }


}
export default JsonTranferUtil;








