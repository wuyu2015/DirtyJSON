# DirtyJSON

DirtyJSON is a Node.js library designed for fixing and parsing invalid JSON data.

Douglas Crockford created and promoted the JSON format with the intention of providing a strict, user-friendly, and standardized data format, where syntax errors are not allowed. JSON output by programs is also expected to be flawless (as it ideally shouldn't be handwritten). However, with the emergence of artificial intelligence like ChatGPT, instances of incorrect JSON output have been observed. In my existing data, out of 80,000 conversations, approximately 4,000 outputs were in an incorrect JSON format. DirtyJSON attempts to rectify some of the errors in JSON generated by AI.


DirtyJSON provides the following automatic repair features:

1. Automatically removes `//` and `/* */` comments;
2. Automatically removes the trailing comma `,`;
3. Automatically corrects misuse and mismatch of `{}`, `[]`;
4. Automatically adds quotes to keys and values (except for numbers and `true`, `false`, `null`, of course);
5. Automatically escapes unescaped quotes inside quotes, for example: `["quotes in "quotes" in quotes"]` to `["quotes in \"quotes\" in quotes"]`;
6. Unifies `true`, `false`, `null` to lowercase;
7. Tolerantly supports illegal full-width symbols whenever possible;
8. Automatically identifies and removes improperly written symbols;
9. Automatically completes unfinished JSON by appending `]` or `}` at the end of the JSON structure.

No more worries about poorly formatted JSON output by AI. You can even write JSON by hand recklessly.

## Installation

```bash
npm install @wu__yu/dirtyjson
```

## Examples

`DirtyJSON` does not require object keys to be quoted, and can handle single-quoted value strings.

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
console.log(DirtyJSON.fix("{ test: 'this is a test', 'number': 1.23e10 }"));
// output: {"test":"this is a test","number":1.23e10}
```

`DirtyJSON` can handle embedded quotes in strings.

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
console.log(DirtyJSON.fix('{"test": "some text "a quote" more text"}'));
// output: {"test":"some text \"a quote\" more text"}
```

`DirtyJSON` can handle newlines inside a string.

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
console.log(DirtyJSON.fix('{"test": "each \n on \n new \n line"}'));
// output: {"test":"each \n on \n new \n line"}
```

`DirtyJSON` can handle `//` and `/* */` comments.

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
const jsonDataWithComments = `
{
    // This is a comment
    "name": "John",

    /*
    This is a multiline
    comment
    */
    "age": 30
}
`;
const fixedData = DirtyJSON.fix(jsonDataWithComments);
console.log(fixedData);
// output: {"name":"John","age":30}
```

`DirtyJSON` can handle the trailing comma `,`.

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
const jsonDataWithCommas = `
{
    "name": "John",
    "age": 30, // Notice this trailing comma
}
`;
const fixedData = DirtyJSON.fix(jsonDataWithCommas);
console.log(fixedData);
// output: {"name":"John","age":30}
```

`DirtyJSON` can handle misuse and mismatch of `{}`, `[]`.

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
const jsonDataWithMismatch = `
{
    "name": "John",
    "age": 30,
    "friends": [
        "Alice",
        "Bob",
    } // this '}' should be ']'
】// this abnormal square bracket  should be '}'
`;
const fixedData = DirtyJSON.fix(jsonDataWithMismatch);
console.log(fixedData);
// output: {"name":"John","age":30,"friends":["Alice","Bob"]}
```

`DirtyJSON` can handle unfinished JSON.

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
const unfinishedJsonData = `
{
    "name": "John",
    "age": 30,
    "friends": [
        "Alice",
        "Bob",`;
const fixedData = DirtyJSON.fix(unfinishedJsonData);
console.log(fixedData);
// output: {"name":"John","age":30,"friends":["Alice","Bob"]}
```

`DirtyJSON` can handle improperly written symbols.

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
const improperlyWrittenJSON = '},{「a」:1,,b:[2,,“3”:},]},';
const fixedData = DirtyJSON.fix(jsonDataWithCommas);
console.log(fixedData);
// output: {"a":1,"b":[2,"3"]}
```

## License

MIT License

---

Simplified Chinese introduction:

# 超强纠错 JSON 解析器

DirtyJSON 可以为你解析非法的 JSON 数据。

Douglas Crockford 创建和推广 JSON 格式的初衷是提供一种严格、易用、统一的数据格式，语法错误等是不被允许的。通过程序生成的 JSON 完美无暇（这本来就不应该是手写的格式），直到人工智能 ChatGPT 出现，让它输出 JSON 的时候，在我已有的数据看来，8 万次对话有 4000 次输出了错误格式的 JSON，DirtyJSON 试图修复一些 AI 生成 JSON 的错误。

DirtyJSON 提供以下自动修复功能：

1. 自动删除 `//` 和 `/* */` 注释；
2. 自动删除末尾的 `,`；
3. 自动纠正 `{}`, `[]` 的乱写和不匹配问题；
4. 自动为键和值添加引号（当然，除了数字和 `true`, `false`, `null`)；
5. 自动转义引号内未转义的引号，例如：`["quotes in "quotes" in quotes"]` 转为 `["quotes in \"quotes\" in quotes"]`；
6. 将 `true`、`false`、`null` 统一转换为小写；
7. 尽可能宽容地支持非法的全角符号；
8. 自动识别并删除错误写入的符号；
9. 通过在结尾处添加 `]` 或 `}` 自动补全未完成的 JSON 结构。

再也不怕 AI 输出的 JSON 乱写一气了。你也可以用手写的方式乱写 JSON 了。

## 安装

```bash
npm install @wu__yu/dirtyjson
```

## 示例

不写引号或写为单引号：

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
console.log(DirtyJSON.fix("{ test: 'this is a test', 'number': 1.23e10 }"));
// 输出: {"test":"this is a test","number":12300000000}
```

处理字符串中嵌入的引号：

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
console.log(DirtyJSON.fix('{"test": "some text "a quote" more text"}'));
// 输出: {"test":"some text \"a quote\" more text"}
```

转义字符串内的换行符。

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
console.log(DirtyJSON.fix('{"test": "each \n on \n new \n line"}'));
// 输出: {"test":"each \n on \n new \n line"}
```

在 JSON 内部随意书写单行 `//` 和多行 `/* */` 注释：

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
const jsonDataWithComments = `
{
    // 这个是单行注释
    "name": "小明",

    /*
    这个是多行注释
    这个是多行注释
    */
    "age": 30
}
`;
const fixedData = DirtyJSON.fix(jsonDataWithComments);
console.log(fixedData);
// 输出: {"name":"小明","age":30}
```

自动删除最后一个逗号 `,`：

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
const jsonDataWithCommas = `
{
    "name": "小明",
    "age": 30, // 注意这个逗号将被删除
}
`;
const fixedData = DirtyJSON.fix(jsonDataWithCommas);
console.log(fixedData);
// 输出: {"name":"小明","age":30}
```

`DirtyJSON` 可以处理不匹配的 `{}`, `[]`：

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
const jsonDataWithCommas = `
{
    "name": "小明",
    "age": 30,
    "friends": [
        "小红",
        "小刚",
    } // 这里的 '}' 应该是 ']'
】// 这里的 '】' 应该是 '}'
`;
const fixedData = DirtyJSON.fix(jsonDataWithCommas);
console.log(fixedData);
// 输出: {"name":"小明","age":30,"friends":["小红","小刚"]}
```

`DirtyJSON` 可以处理未完成的 JSON.

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
const unfinishedJsonData = `
{
    "name": "小明",
    "age": 30,
    "friends": [
        "小红",
        "小刚",`;
const fixedData = DirtyJSON.fix(unfinishedJsonData);
console.log(fixedData);
// 输出: {"name":"小明","age":30,"friends":["小红","小刚"]}
```

让事情更混乱一些：

```javascript
import DirtyJSON from '@wu__yu/dirtyjson';
const improperlyWrittenJSON = '},{「a」:1,,b:[2,,“3”:},]},';
const fixedData = DirtyJSON.fix(jsonDataWithCommas);
console.log(fixedData);
// 输出: {"a":1,"b":[2,"3"]}
```

## 许可证

MIT License
