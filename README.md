# 搭建Github图床博客

## 准备工作

1. 在Github中创建图床仓库，创建一个index.html文件，并使用Github Pages建立站点
2. 生成token，在图床插件中设置好Github配置
3. 编写index.html令其能够遍历仓库资源并展示

## 引用图片资源

[jsdelivr免费开源CDN加速服务](https://www.jsdelivr.com/?docs=gh)

使用jsdelivr服务的CDN加速链接

https://cdn.jsdelivr.net/gh/Zachary3234/picture@main/images/[文件名]

文件名可利用API遍历仓库获取

##  遍历Github仓库资源

> [Github docs](https://docs.github.com/cn)

> [Github API](https://api.github.com/)

我的Github图床仓库链接：

https://api.github.com/repos/Zachary3234/picture/contents

https://api.github.com/repos/Zachary3234/picture/contents/image

> [jsdelivr API](https://github.com/jsdelivr/data.jsdelivr.com)

我的Github图床仓库链接：

https://data.jsdelivr.com/v1/package/gh/Zachary3234/picture@main

## 上传图片资源

1. 打开图床插件，复制粘贴要上传的图片，图片将自动上传到Github图床仓库
2. 图床中复制图片链接，在合适位置粘贴引用图片
3. 或是通过API遍历仓库中的图片资源

在Markdown中引用图片效果如下：

![样例图片](https://cdn.jsdelivr.net/gh/Zachary3234/picture@main/image/1627194895483-1627194895473-90A9D7F26C420BF6BA5F85A8C99855CD.png)
