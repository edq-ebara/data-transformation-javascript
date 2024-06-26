
一、对象到对象
源:{a:{k:v,a:b}}  目标:{b1:{k1:v1}}
a->b1  v-v 追加   {"b1":{"k1":"v1","k1_0002_9":{"k":"v","a":"b"}}} 替换  {"b1":{"k1_0001_9":{"k":"v","a":"b"}}}
a->b1  k-k 替换   {a:{k1:v1}}
a->b1  k-v 追加   {b1:{k1:v1,k10:a}} 替换  {b1:{k10:a}}
a->b1  v-k 替换   {object:{k1:v1}}//此处可报错也可强转，建议强转即可

a.*->b1 v-v 追加  {b1:{k1:v1,k10:v,k11:b}} 替换 {b1:{k10:b}}//由于a.*中有两个值依次进行替换b1的值所以b1最终值变为b
a.*->b1 k-k 替换  {a:{k1:v1}} //此处的a是a.a
a.*->b1 k-v 追加  {b1:{k1:v1,k10:k,k11:a}} 替换  {b1:{k10:a}}//此处的a是a.a
a.*->b1 v-k 替换  {b:{k1:v1}} 

此处将源换为:{a:{k:v,a:b}}
此处将目标换为:{b1:{k1:v1,f1:g1}}
a.*->b1.* v-v 追加  {b1:{k1:b,f1:b}} 替换 {b1:{k1:b,f1:b}} //追加时由于b1.*是基础类型无法进行追加，所以只能替换;替换时由于a.*中有两个值依次替换b.* k1和f1的值，保留最后依次替换所以都是b
a.*->b1.* k-k  替换 {b1:{a:v1,a:g1}}->{b1:{a:g1}} //替换时由于a.*中有两个值依次替换b.* k1和f1的键，由于替换b1.f1是，发现已经存在键值a,所以此时会异常可以选择报错或自动忽略异常保留第一次的结果
a.*->b1.* k-v  追加 {b1:{k1:a,f1:a}} 替换 {b1:{k1:a,f1:a}} //追加时由于b1.*是基础类型无法进行追加，所以只能替换;替换时由于a.*中有两个键依次替换b.* k1和f1的值，保留最后依次替换所以都是a
a.*->b1.* v-k  替换 {b1:{b:v1,b:g1}}->{b1:{b:g1}} //替换时由于a.*中有两个键依次替换b.* k1和f1的键，由于替换b1.f1是，发现已经存在键值b,所以此时会异常可以选择报错或自动忽略异常保留第一次的结果

此处将源换为:{a:{k:{n:1},a:{n:2}}} 
此处将目标换为:{b1:{k1:{n:11},f1:{n:22}}}
a.*.n->b1.*.n v-v   追加 {b1:{k1:{n:2},f1:{n:2}}} 替换 {b1:{k1:{n:2},f1:{n:2}}} //追加时由于b1.*.n是基础类型无法进行追加应，所以只能替换;替换时由于a.*.n匹配出两个值依次替换b.*.n k1.n和f1.n的值，保留最后依次替换所以都是2
a.*.n->b1.*.n k-k   替换 {b1:{k1:{n:11},f1:{n:22}}}  同 a.*->b1.* k-k 
a.*.n->b1.*.n k-v   追加 {b1:{k1:{n:n},f1:{n:n}}}  替换{b1:{k1:{n:n},f1:{n:n}}}  同 a.*->b1.* k-v
a.*.n->b1.*.n v-k   替换{b1:{k1:{1:11},f1:{1:22}}} 同 a.*->b1.* v-k//由于a.*.n匹配出两个元素{n:1}{n:2}，而在执行第一个元素时，已经将目标{k1:{n:11},f1:{n:22}}变成了{k1:{1:11},f1:{1:22}}所以当执行第二个映射的时候会找不到目标元素

此处将源换为:{a:{k:{n:1},a:{n1:2}}} 
此处将目标换为:{b1:{k1:{a:11},f1:{n:22}}}
a.*.*-b1.* v-v 追加 {b1:{k1:{a:11,a0:1,a1:2},f1:{n:22,n0:1,n1:2}}} 替换 {b1:{k1:{n1:2},f1:{n1:2}}}
a.*.*-b1 v-v 追加 {b1:{k1:{n:11},f1:{n:22},k10:2,k11:2}} 替换 {b1:{k10:2}}



二、数组到数组
源:{a:[{k:v,c:2},{a:b}]}  目标:{b1:[{k1:v1},{g1:f1}]}
a->b1  v-v 追加   {"b1":[{"k1":"v1"},{"g1":"f1"},[{"k":"v","c":2},{"a":"b"}]]}  替换  {"b1":[[{"k":"v","c":2},{"a":"b"}]]} 
a->b1  k-k 替换   {a:[{k1:v1},{g1:f1}]}
a->b1  k-v 追加   {b1:[{k1:v1},{g1:f1},"a"]} 替换  {b1:[a]}
a->b1  v-k 替换   {array:[{k1:v1},{g1:f1}]}//此处可报错也可强转，建议强转即可


a[*]->b1 v-v 追加  {"b1":[{"k1":"v1"},{"g1":"f1"},{"k":"v","c":2},{"a":"b"}]} 替换 {"b1":[{"a":"b"}]}//由于a[*]中有两个值依次进行替换b1的值所以b1最终值变为b
a[*]->b1 k-k 替换  {1:[{k1:v1},{g1:f1}]} //数组比较特殊他的key时a[0]
a[*]->b1 k-v 追加  {b1:[{k1:v1},{g1:f1},"0","1"]} 替换  {b1:[1]}//此处的a是a[1].a
a[*]->b1 v-k 替换  {object:[{k1:v1},{g1:f1}]} 


a[*]->b1[*] v-v 追加  {"b1":[{"k1":"v1","k":"v","a":"b"},{"g1":"f1","k":"v","a":"b"}]}  替换 {"b1":[{"a":"b"},{"a":"b"}]} 
a[*]->b1[*] k-k  不支持//数组的索引到数组的索引不支持
a[*]->b1[*] k-v  追加 {"b1":[{"k1":"v1","k1_0002_9":"0","k1_0003_9":"1"},{"g1":"f1","g1_0002_9":"0","g1_0003_9":"1"}]} 替换 {"b1":[{"k1_0001_9_0001_9":"1"},{"g1_0001_9_0001_9":"1"}]} 
a[*]->b1[*] v-k  不支持//数组的索引到数组的索引不支持

此处将源换为:{a:[{k:{n:1}},{a:{n:2}}]} 
此处将目标换为:{b1:[{k1:{n:11}},{f1:{n:22}}]}
a[*].*.n->b1[*].*.n v-v   追加 {"b1":[{"k1":{"n":2}},{"f1":{"n":2}}]} 替换 {b1:[{k1:{n:2}},{f1:{n:2}}]} //追加时由于b1[*].n是基础类型无法进行追加，所以只能替换;替换时由于a[*].n匹配出两个值依次替换b[*].n k1.n和f1.n的值，保留最后依次替换所以都是2
a[*].*.n->b1[*].*.n k-k   替换 {b1:[{k1:{n:11}},{f1:{n:22}}]} 
a[*].*.n->b1[*].*.n k-v   追加 {"b1":[{"k1":{"n":"n"}},{"f1":{"n":"n"}}]} 替换{b1:[{k1:{n:n}},{f1:{n:n}}]}  
a[*].*.n->b1[*].*.n v-k   替换 {"b1":[{"k1":{"1":11}},{"f1":{"1":22}}]} 

此处将源换为:{a:[{k:{n1:1}},{a:{n2:2}}]}
此处将目标换为:{b1:[{k1:{na:11}},{f1:{nb:22}}]}
a[*].*-b1[*].* v-v 追加 {"b1":[{"k1":{"na":11,"n1":1,"n2":2}},{"f1":{"nb":22,"n1":1,"n2":2}}]} 替换{"b1":[{"k1":{"n2":2}},{"f1":{"n2":2}}]} 
a[*].*-b1[*] v-v 追加 {"b1":[{"k1":{"na":11},"n1":1,"n2":2},{"f1":{"nb":22},"n1":1,"n2":2}]} 替换 {"b1":[{"n2":2},{"n2":2}]}
a[*].*-b1 v-v 追加 {"b1":[{"k1":{"na":11}},{"f1":{"nb":22}},{"n1":1},{"n2":2}]} 替换{"b1":[{"n2":2}]}


三、对象到数组

源:{a:{k:{n:1},a:{n1:2}}}   目标:{b1:[{k1:v1},{g1:f1}]}
a->b1  v-v 追加   {"b1":[{"k1":"v1"},{"g1":"f1"},{"k":{"n":1},"a":{"n1":2}}]}  替换  {"b1":[{"k":{"n":1},"a":{"n1":2}}]} 
a->b1  k-k 替换   {a:[{k1:v1},{g1:f1}]}
a->b1  k-v 追加   {b1:[{k1:v1},{g1:f1},"a"]} 替换  {b1:[a]}
a->b1  v-k 替换   {object:[{k1:v1},{g1:f1}]}//此处可报错也可强转，建议强转即可

a.*->b1 v-v 追加  {"b1":[{"k1":"v1"},{"g1":"f1"},{"n":1},{"n1":2}]} 替换 {"b1":[{"n1":2}]}
a.*->b1 k-k 替换  {a:[{k1:v1},{g1:f1}]} //此处的a是a.a
a.*->b1 k-v 追加  {b1:[{k1:v1},{g1:f1},"k","a"]} 替换  {b1:"a"}//此处的a是a.a
a.*->b1 v-k 替换  {object:[{k1:v1},{g1:f1}]} 


a.*->b1[*] v-v 追加 {"b1":[{"k1":"v1","n":1,"n1":2},{"g1":"f1","n":1,"n1":2}]}  替换 {b1:{k1:{n1:2},g1:{n1:2}}} //追加时由于b1[*]是基础类型无法进行追加应报错;替换时由于a.*中有两个值依次替换b1[*] k1和f1的值，保留最后依次替换所以都是{n1:2}
a.*->b1[*] k-k  不支持//对象的key到数组的索引不支持
a.*->b1[*] k-v  追加 {"b1":[{"k1":"v1","k1_0002_9":"k","k1_0003_9":"a"},{"g1":"f1","g1_0002_9":"k","g1_0003_9":"a"}]} 替换 {b1:[{k1:a},{g1:a}]}
a.*->b1[*] v-k  不支持//对象的key到数组的索引不支持

此处将源换为:{a:{k:{n:1},a:{n:2}}} 
此处将目标换为:{b1:[{n:v1},{n:f1}]}
a.*.n->b1[*].n v-v   追加 {"b1":[{"n":2},{"n":2}]}  替换 {b1:[{n:2},{n:2}]} 
a.*.n->b1[*].n k-k   替换  {b1:[{n:v1},{n:f1}]}   
a.*.n->b1[*].n k-v   追加 {"b1":[{"n":"n"},{"n":"n"}]} 替换 {b1:[{n:n},{n:n}]} 
a.*.n->b1[*].n v-k   替换{"b1":[{"1":"v1"},{"1":"f1"}]}

此处将源换为:{a:{k:{n:1},a:{n1:2}}} 
此处将目标换为:{b1:[{n:v1},{n:f1}]}
a.*.*-b1[*] v-v 追加  {"b1":[{"n":"v1","n_0002_9":1,"n_0003_9":2},{"n":"f1","n_0002_9":1,"n_0003_9":2}]} 替换{b1:[{n:2},{n:2}]}
a.*.*-b1 v-v 追加 {"b1":[{"n":"v1"},{"n":"f1"},1,2]} 替换 {b1:["2"]}


四、数组到对象


源:{a:[{k:v},{a:b}]}  目标:{b1:{k1:{a:11},f1:{n:22}}}
a->b1  v-v 追加   {"b1":{"k1":{"a":11},"f1":{"n":22},"k1_0003_9":[{"k":"v"},{"a":"b"}]}} 替换  {"b1":{"k1_0001_9":[{"k":"v"},{"a":"b"}]}}
a->b1  k-k 替换   {a:{k1:{a:11},f1:{n:22}}}
a->b1  k-v 追加   {b1:{k1:{a:11},f1:{n:22},k10:"a"}} 替换  {b1:a}
a->b1  v-k 替换   {Array:{k1:{a:11},f1:{n:22}}}//此处可报错也可强转，建议强转即可

a[*]->b1 v-v 追加 {"b1":{"k1":{"a":11},"f1":{"n":22},"k1_0003_9":{"k":"v"},"k1_0004_9":{"a":"b"}}} 替换 {"b1":{"k1_0001_9_0001_9":{"a":"b"}}} 
a[*]->b1 k-k 替换  {1:{k1:{a:11},f1:{n:22}}}
a[*]->b1 k-v 追加 {b1:{k1:{a:11},f1:{n:22},k10:"0",k11:"1"}}  替换  {b1:"1"}
a[*]->b1 v-k 替换  {object:[{k1:v1},{g1:f1}]} 


a[*]->b1.* v-v 追加 {b1:{k1:{a:11,a0:{k:v},a1:{a:b}},f1:{n:22,n0:{k:v},n1:{a:b}}}} 替换 {b1:{k1:{a:b},f1:{a:b}}} 
a[*]->b1.* k-k  替换 {b1:{"a[0]":{a:11},"a[1]":{n:22}}}
a[*]->b1.* k-v  追加 {b1:{k1:{a:11,a0:"a[0]",,a1:"a[1]"},f1:{n:22,n0:"a[0]",,n1:"a[1]"}}} 替换 {b1:[{k1:"a[1]"},{g1:"a[1]"}]}
a[*]->b1.* v-k  替换{b1:{object:{a:11},object:{n:22}}}->{b1:[{object:{a:11}}]} 

此处将源换为:{a:[{n:v},{n:b}]}
此处将目标换为:{b1:{k1:{n:11},f1:{n:22}}}
a[*].n->b1.*.n v-v   追加 Error 替换 {b1:{k1:{n:b},f1:{n:b}}}
a[*].n->b1.*.n k-k   替换  {b1:{k1:{n:11},f1:{n:22}}}
a[*].n->b1.*.n k-v   追加 Error 替换 {b1:{k1:{n:n},f1:{n:n}}}
a[*].n->b1.*.n v-k   替换{b1:{k1:{b:11},f1:{b:22}}}


a[*].*-b1.* v-v 追加 追加 {b1:[{k1:v1,n0:v,n1:b},{f1:{n:22,n0:v,n1:b}}]} 替换 {b1:{k1:b,f1:b}}
a[*].*-b1 v-v 追加 {b1:{k1:{n:11},f1:{n:22},k10:"v",k11:"b"}} 替换 {b1:{k10:"v",k11:"b"}}
