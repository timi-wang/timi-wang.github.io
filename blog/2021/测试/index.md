## kubernetes入门级别的新手引导。

![](klee.jpeg)

![Paul Klee - Color Chart (1931) 入门级别的新手引导](klee.jpeg)

## 基础概念

> Dorothy followed her through many of the beautiful rooms in her castle.


> 简而言之是一个容器管理系统，开源，谷歌背书

 - **Kubernetes Master**是三个跑在同一节点的核心进程的总称：
     - [kube-apiserver](https://kubernetes.io/docs/admin/kube-apiserver/)：提供对外kubernetes api接口
     - [kube-controller-manager](https://kubernetes.io/docs/admin/kube-controller-manager/)：是一群控制器的总称：
         + `node controller`: 发现新节点及监控挂掉的节点
         + *replication controller*: 维护确保pods数量正确
         + **endpoints controller**: 绑定services和pods
         + service account & token controller: 为新的namespace创建默认账号及api访问token
     - [kube-scheduler](https://kubernetes.io/docs/admin/kube-scheduler/)：负责pods与nodes的合理调度分配
 - 其他非master节点上会跑两个进程：
     + [kubelet](https://kubernetes.io/docs/admin/kubelet/)：负责与master通信
     + [kube-proxy](https://kubernetes.io/docs/admin/kube-proxy/)：负责节点间的网络代理

基本kubernetes对象：pod, service, volume, namespace
高级kubernetes对象：replicaSet, deployment, statefulSet, daemonSet, job

一些附加组件：
 - DNS: cluster内部的dns解析系统
 - web ui: web的控制界面
 - container resource monitoring: 资源监控
 - cluster-level logging: 负责将container的log保存到特定的log store


## 创建一个cluster

kubernetes简而言之是一个容器管理系统，开源，谷歌背书。

架构上包含master和node，每个node可以视为一台服务器或ECS，node上可以跑多个process，master管理node。一个线上环境kubernetes集群最少应有三个nodes。

[Minikube](https://github.com/kubernetes/minikube)是kubernetes的一个具体实现，可在本地创建一个虚拟机，模拟一个简单集群。

minikube有关命令：

```bash
$ minikube start              // 启动集群
$ kubectl cluster-info          // 显示集群信息，会显示master的管理界面url
$ kubectl get nodes             // 显示所有节点信息
```

## 部署应用

有关命令：

```bash
$ kubectl run [name] --image=[镜像地址] --port=8080     // 部署应用
$ kubectl get deployments               // 获取所有deployments信息
$ kubectl proxy // 开启cluster内部的网络代理，这样可以直接由外部url访问内部api
```

用`$ kubectl get pods`可以显示pod信息，然后可以通过代理的url直接访问我们部署的应用接口。

```bash
//  将pod名称记到全局变量里
$ export POD_NAME=$(kubectl get pods -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
$ echo Name of the Pod: $POD_NAME

// 假设kubectl proxy返回的是http://localhost:8001
$ curl http://localhost:8001/version    // 同 kubectl version的client version

// 访问应用的api
$ curl http://localhost:8001/api/v1/proxy/namespaces/default/pods/$POD_NAME/
```

## 更多应用交互

**Pod**是一个应用的最小逻辑单元集合，可以包括多个containerized app和多个volume，一个node上可以跑多个pod，他们共享**存储(volumes)**，**ip**，**启动脚本**。


![d33wubrfki0l68](https://d33wubrfki0l68.cloudfront.net/5cb72d407cbe2755e581b6de757e0d81760d5b86/a9df9/docs/tutorials/kubernetes-basics/public/images/module_03_nodes.svg)

有关命令：

```bash
$ kubectl get pods          // 获取pods信息
$ kubectl describe pods     // 查看pods详情，describe命令也可用于node和deployments
```

应用里输出到console（STDOUT）中的内容会被记录到log中，可以通过`kubectl logs $POD_NAME`查看。

使用`kubectl exec`可在container中执行代码：

```bash
$ kubectl exec $POD_NAME env  // 输出container中的环境变量
$ kubectl exec -ti $POD_NAME bash // 在container中启动bash
```

## 启动服务暴露应用接口

service负责维护pods的生命周期，负责保活及暴露对外接口。它定义了一群逻辑相关的pods及它们的接入方式：

 - ClusterIP(默认)：暴露一个仅供集群内访问的ip
 - NodePort：暴露对外可访问的port,ip就是node本身的ip，<NodeIp>:<NodePort>，是clusterIp的父类
 - LoadBalancer：创建一个基于当前cloud的负载均衡实例，提供一个固定的对外ip，NodePort的父类
 - ExternalName：返回一个cname记录，直接用名称暴露对外接口

service用标签和选择器去匹配pods：

![](https://d33wubrfki0l68.cloudfront.net/b964c59cdc1979dd4e1904c25f43745564ef6bee/f3351/docs/tutorials/kubernetes-basics/public/images/module_04_labels.svg)

有关命令：

```bash
$ kubectl get services          // 查看所有服务
$ kubectl expose deployment/kubernetes-bootcamp --type="NodePort" --port 8080 // 启动service
$ kubectl describe services/kubernetes-bootcamp     // 查看service详情

// 将nodeport存入环境变量
$ export NODE_PORT=$(kubectl get services/kubernetes-bootcamp -o go-template='{{(index .spec.ports 0).nodePort}}')
$ echo NODE_PORT=$NODE_PORT

// 测试接口
$ curl $(minikube ip):$NODE_PORT
```

可以自定义标签筛选pods或service：

```bash
$ kubectl describe deployment           // 可以看到标签名称
$ kubectl get pods -l run=kubernetes-bootcamp   // 通过标签筛选pods
$ kubectl get services -l run=kubernetes-bootcamp   //通过标签筛选service

// 将pod名称存入环境变量
$ export POD_NAME=$(kubectl get pods -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
$ echo Name of the Pod: $POD_NAME

$ kubectl label pod $POD_NAME app=v1    // 将pod的label改为app=v1
$ kubectl describe pods $POD_NAME       // 可以看到label值已变为app=v1

$ kubectl delete service -l run=kubernetes-bootcamp // 删除service，但app本身还是在pods里继续跑着的

```

## 水平拓展应用

水平增加deployment的数量

![](https://d33wubrfki0l68.cloudfront.net/30f75140a581110443397192d70a4cdb37df7bfc/b5f56/docs/tutorials/kubernetes-basics/public/images/module_05_scaling2.svg)

有关命令：

```bash
$ kubectl scale deployments/kubernetes-bootcamp --replicas=4    // 拓展replicas到四个
$ kubectl get pods -o wide  // 显示pods及ip
```

## 更新应用

无宕机动态更新，同时保留版本信息，方便回滚。

```bash
// 通知deployment使用新的image
$ kubectl set image deployments/kubernetes-bootcamp kubernetes-bootcamp=jocatalin/kubernetes-bootcamp:v2    
$ kubectl rollout status deployments/kubernetes-bootcamp    // 显示rollout状态
$ kubectl get pods  // 可以看到image信息已更新
$ kubectl rollout undo deployments/kubernetes-bootcamp  // 返回上一个版本
```

```javascript
const searchParams = new URLSearchParams(location.search);
const title = searchParams.get('t');
const year = searchParams.get('y');
if(!title || !year) {
return location.href = 'https://timi-wang.github.io';
}
document.querySelector('head title').innerText = title.split('_').slice(1).join(' ');
```
