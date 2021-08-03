想开一个 `webassembly` 整活系列来记录一下我对于 `webassembly` 的学习。

## What is webassembly

首先，什么是 `webassembly`? 

直接拆词来看就是 `web` + `assembly`，直译就是 *网络汇编*，这种解释是对的，但又不全对。严格来讲 `webassembly` 是字节码，不是汇编，汇编是可以进一步生成字节码或机器码的编程语言，而 `webassembly` 是特指这种生成之后的字节码文件。

那 `webassembly` 的出现是为了解决什么问题？

按照MDN的说法是为了解决JS的性能问题，JS是脚本语言，每个JS文件都需要被下载解析编译再执行，而 `webassembly` 是用其他语言(c++, rust)编译好的字节码，下载完之后就可以直接执行了，按官方说法就是具有媲美原生的性能。

## Webassembly 是怎么执行的？

为了把这个讲清楚可能得从芯片说起，芯片都是通过识别一系列的0和1，即高低电平来识别不同的指令，然后输出对应的结果。为了让这些01更易读点，人们发明了汇编语言，汇编的语法集与芯片指令集是一一对应的，它可以被直接编译成对应的01机器码，这大大降低了编程难度，但随之而来的一个问题是由于汇编与芯片指令是一一对应的，不同的芯片你需要专门去学习它对应的汇编语法，这是个耗时耗力的工程。

![机器码和汇编的关系](/blog/2021/关于Webassembly/1.png)

为了解决这个问题，更高级的C语言出现了，写同一份C的代码，可以直接将其编译成各个芯片对应的机器码，但这一方案也不是完美无缺的，首先每个芯片你都需要单独去编译一遍，其次为了让代码能够运行在尽可能多的芯片上，即保持更高的兼容性，一些芯片的高级指令可能会被舍弃，无法物尽其用。于是前辈们用上了万能公式又创造了一个抽象层，即一个虚拟的微处理器，它有自己的字节码和对应的汇编语言，我们可以先编译成它的字节码，然后它再将其解析为真实的微处理器可以识别的机器码，这其实就是JAVA虚拟机及其跨平台原理。

![虚拟机原理](/blog/2021/关于Webassembly/2.png)

代码跑在虚拟机上，虚拟机再将它变成特定平台的机器码，虚拟机到真实芯片的编译可以不断优化以充分挖掘芯片性能。`Webassembly` 用的正是同样的思想，区别是真实的芯片变成了各种现代浏览器，虚拟机变成了浏览器的虚拟机。

![webassembly原理](/blog/2021/关于Webassembly/3.png)

在浏览器里有一套通用的[JS API](https://webassembly.org/getting-started/js-api/)，通过这些API即可执行 `.wasm` 的文件，目前 `webassembly` 还无法直接和DOM通信，所以需要一些JS的胶水代码来实现和DOM交互的功能。初始化完的 `webassembly` 实例即可被当作一个JS模块对象来调用其对外暴露的方法。其实不仅仅是浏览器， `webassembly` 还可以跑在 `命令行` 和 `NodeJS` 中。

![浏览器和webassembly](/blog/2021/关于Webassembly/4.png)

## 如何生成 Webassembly 文件

根据民间说法[这个列表](https://github.com/appcypher/awesome-wasm-langs)里的语言应该都支持编译成 `webassembly`，但根据[官方文档](https://developer.mozilla.org/en-US/docs/WebAssembly/Concepts)目前有以下几种比较主流稳定的生成方式：

1. 直接用 `webassembly` 对应的汇编语言(webassembly text format)编译，有一整套对应的[工具集](https://github.com/WebAssembly/wabt)

2. 用 [Binaryen](https://github.com/WebAssembly/binaryen) 将 `AssemblyScript` (一种TS的变种)编译成  `webassembly` 

3. 用 [Emscripten](https://emscripten.org/) 将 `C/C++` 编译成 `webassembly`

4. 用 [wasm-pack](https://github.com/rustwasm/wasm-pack) 将 `Rust` 编译成 `webassembly`
