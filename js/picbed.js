// 图床对象，拉取图床数据，存储图片链接
const picbed = (function () {
    var rootDir;

    // LocalStorage 加载图床目录/初始化图床目录
    try {
        rootDir = JSON.parse(localStorage.getItem('rootDir')) || iniDir("images");
    } catch (error) {
        localStorage.removeItem('rootDir');
        rootDir = iniDir("images");
        console.log('初始化错误，清除本地存储', error);
    }
    // localStorage.setItem('rootDir', JSON.stringify(rootDir));
    // 初始化文件夹
    function iniDir(_name) {
        return {
            name: _name,
            etag: undefined,
            subdirs: [],
            files: []
        }
    }
    // 以JSON数据设置文件夹
    function setupDir(dir, data, etag = rootDir.etag) {
        dir.etag = etag;
        dir.subdirs = [];
        dir.files = [];
        data.forEach(ele => {
            if (ele.type == "dir") {
                dir.subdirs.push(iniDir(ele.name));
            } else {
                dir.files.push(ele.name);
            }
        });
        localStorage.setItem('rootDir', JSON.stringify(rootDir));
    }
    // 查找文件夹
    function searchDir(dir, pathArr = [], pathFound = []) {
        if (pathArr[0] == "") {
            pathArr.splice(0, 1);
        }
        if (pathArr.length == 0)
            return dir;
        var dirfound = dir.subdirs.find((x) => {
            return x.name == pathArr[0];
        })
        if (dirfound == undefined) {
            console.log('没有找到文件夹' + pathArrToPath(pathFound.concat(pathArr[0])))
            return dir;
        }
        pathFound.push((pathArr.splice(0,1))[0]);
        if (pathArr.length > 0) {
            return searchDir(dirfound, pathArr, pathFound);
        }
        return dirfound;
    }
    // 文件夹名数组转路径
    function pathArrToPath(pathArr) {
        var path = "";
        pathArr.forEach(element => {
            if (path == "")
                path += element;
            else
                path += '/'+element;
        });
        return path;
    }

    const api = "https://api.github.com/repos/Zachary3234/picture/contents/images/";
    // Promise 检查图床是否更新（仅初始化时检查）
    var etagPromise = (function () {
        const promise = new Promise((resolve, reject) => {
            $.ajax({
                url: api,
                headers: {
                    "Authorization": "token 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",
                    "If-None-Match": rootDir.etag // etag验证图床仓库数据变化
                }
            })
                .always(
                    function (dataxhr, textStatus, xhrerr) {
                        switch (textStatus) {
                            case 'success':
                                console.log("x-ratelimit-remaining", xhrerr.getResponseHeader("x-ratelimit-remaining"));
                                console.log('图床已更新，返回数据', dataxhr);
                                // 更新本地数据
                                setupDir(rootDir, dataxhr, xhrerr.getResponseHeader('etag'));
                                resolve(true);
                                break;
                            case 'notmodified':
                                console.log("x-ratelimit-remaining", xhrerr.getResponseHeader("x-ratelimit-remaining"));
                                console.log('图床无更新，使用本地数据', textStatus);
                                // 直接输出本地数据
                                resolve(true)
                                break;
                            default:
                                console.log("x-ratelimit-remaining", dataxhr.getResponseHeader("x-ratelimit-remaining"));
                                console.log(dataxhr, textStatus, xhrerr);
                                // 错误或未知响应
                                reject(xhrerr)
                                break;
                        }
                    }
                );
        })
        return promise;
    })();
    // Promise 加载目录及文件
    function loadDirFiles(pathArr){
        var pathFound = [];
        var dir = searchDir(rootDir,pathArr,pathFound);
        const promise = new Promise((resolve, reject) => {
            if (dir.etag) {
                resolve(dir);
            }
            $.ajax({
                url: api + pathArrToPath(pathFound),
                headers: {
                    "Authorization": "token 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",
                }
            })
                .always(
                    function (dataxhr, textStatus, xhrerr) {
                        switch (textStatus) {
                            case 'success':
                                // 更新本地数据
                                setupDir(dir, dataxhr);
                                resolve(dir);
                                break;
                            default:
                                // 错误或未知响应
                                reject(xhrerr)
                                break;
                        }
                    }
                );
        })
        return promise;
    }

    var urlpre = "https://cdn.jsdelivr.net/gh/Zachary3234/picture@main/images/";
    return {
        getFiles: async function (pathArr = []) {
            await etagPromise;
            var dir = await loadDirFiles(pathArr);
            var path = pathArrToPath(pathArr);
            var filesrcs = [];
            var dirnames = [];
            for (let i = 0; i < dir.files.length; i++) {
                filesrcs.push(urlpre + path + '/' + dir.files[i]);
            }
            for (let i = 0; i < dir.subdirs.length; i++) {
                dirnames.push(dir.subdirs[i].name);
            }
            return [filesrcs,dirnames];
        }
    }
})();