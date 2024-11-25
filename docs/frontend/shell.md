---
title: 一文上手 shell 脚本
author: xiyue
date: '2024-11-25'
---

## 基础

脚本第一行声明bash脚本：`#!/bin/bash`

## echo 屏幕输出文本

```bash
echo "hello world"

echo -e "hello world\n" # -e 开启转义
```

## 引号

- 单引号''：原样输出，不解析变量
- 双引号""：解析变量
- 反引号``：解析命令

## 变量

所有的变量值都是字符串
```bash
message="Hello World" # message 为变量名

echo $message # 打印message变量
```

## 参数变量

- `$#` 参数的数目
- `$0` 被运行的脚本名称
- `$1` 第一个参数
- `$2` 第二个参数
- `$N` 第N个参数

```bash
# shift.sh（具体内容）
#!/bin/bash
echo "第一个参数是 $1"
shift
echo "第一个参数是 $1"

# 控制台
./shift.sh p1 p2 p3
第一个参数是 p1
第一个参数是 p2
# 同样是 $1 ，通过 shift 使得它的值会变成原本是 $2 的值。因此 shift 命令常被用在循环中，使得参数一个接一个地被处理。
```

## 环境变量


- `BASHPID`： Bash 进程的进程 ID 。
- `EDITOR`：默认的文本编辑器。
- `HOME`：用户的主目录。
- `HOST`：当前主机的名称。
- `LANG`：字符集以及语言编码，比如 zh_CN.UTF-8。
- `PATH`：由冒号分开的目录列表，当输入可执行程序名后，会搜索这个目录列表。
- `PWD`：当前工作目录。
- `SHELL`： Shell 的名字。
- `TERM`：终端类型名，即终端仿真器所用的协议。
- `UID`：当前用户的 ID 编号。
- `USER`：当前用户的用户名。

```bash
env # 显示所有环境变量。
echo $PATH # 单独输出PATH环境变量

# 自定义环境变量
1. vim .bashrc # 进入bash的配置文件
2. export EDITOR=vim # 写入一个全局变量EDITOR并赋值vim
```

## 数组

```bash
#!/bin/bash
# 定义数组
array=('v1' 'v2' 'v3') 

# 访问数组
echo ${array[2]} # 访问数组（bash下标是从0开始）
echo ${array[*]} # 使用*号访问数组所有的值

```

## 运算

```bash
#!/bin/bash

let "a = 5"
let "b = 2"
let "c = a + b"

echo "c = $c" # 输出 c = 7
```

## 输入

```bash
#!/bin/bash

read name

read -p "Enter your name: " name # -p 参数可以指定提示符

read -p "请输入您的姓名：" -n 5 name # -n 参数可以指定输入字符数

read -p "请输入您的姓名：" -n 5 -t 10 name # -t 参数可以指定输入等待时间(s)

read -p "请输入密码：" -s password # -s 参数可以隐藏输入内容

echo "hello $name !"

```

## 条件判断

```bash
name="lion"
# 条件测试左右必须要有空格
if [ $name = 'lion' ] # 这里使用 = 做判断条件，而不是 ==
then 
    echo "hello $name"
elif [ $1 = "frank" ]  
then 
	echo "hello frank"
else
	echo "我不认识你"
fi # 结束符
```

测试字符串：

- `$string1 = $string2` 表示两个字符串是否相等。
- `$string1 != $string2` 表示两个字符串是否不相等。
- `-z $string` 表示字符串 string 是否为空。
- `-n $string` 表示字符串 string 是否不为空。

测试数字：

- `$num1 -eq $num2` **equal** 的缩写，表示两个数字是否相等。
- `$num1 -ne $num2` **not equal** 的缩写，表示两个数字是否不相等。
- `$num1 -lt $num2` **lower than** 的缩写，表示 num1 是否小于 num2 。
- `$num1 -le $num2` **lower or equal** 的缩写，表示 num1 是否小于或等于 num2 。
- `$num1 -gt $num2` **greater than** 的缩写，表示 num1 是否大于 num2 。
- `$num1 -ge $num2` **greate or equal** 的缩写，表示 num1 是否大于或等于 num2 。

测试文件：

- `-e $file` `exist` 的缩写，表示文件是否存在。
- `-d $file` `directory` 的缩写，表示文件是否为一个目录。
- `-f $file` `file` 的缩写，表示文件是否是一个文件。
- `-L $file` `Link` 的缩写，表示链接。
- `-r $file` `readable` 的缩写，表示文件是否可读。
- `-w $file` `writable` 的缩写，表示文件是否可写。
- `-x $file` `executable` 的缩写，表示文件是否可执行。
- `$file1 -nt $file2` 表示文件 file1 是否比 file2 更新。
- `$file1 -ot $file2` 表示文件 file1 是否比 file2 更旧。

同时测试多个条件：

- `&&` 表示逻辑与，只要有一个不为真，整个条件测试为假。
- `||` 表示逻辑或，只要有一个为真，整个条件测试就为真。
- `!` 表示反转测试条件。

## 循环语句

```bash
while [ -z $response ] || [ $response != 'yes' ] # 输入的语句为空或者不是yes就会一直循环
do
    read -p 'Say yes：' response
done 

# 遍历一组值
for animal in 'dog' 'cat' 'pig'
do
    echo "$animal"
done

# 遍历 ls 命令的执行结果
listfile=`ls`
for file in $listfile
do
	echo "$file"
done

# 借助 seq 的 for 循环（seq后面会详细讲解）
for i in `seq 1 10`
do
	echo $i
done  

```

## 函数

```bash
line_in_file(){
	cat $1 | wc -l
}

line_num=$(line_in_file $1) # 函数的返回值赋给变量了

echo "这个文件 $1 有 $line_num 行"
```

## 局部变量

```bash
local_global(){
  local var1='local 1' # 通过 local 关键字定义局部变量
  echo "var1 is $var1"
}

local_global
```