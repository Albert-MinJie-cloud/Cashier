import axios from 'axios';
import qs from 'qs';

import {Modal, message} from 'antd';
import baseApi from "./config-local"

let tokenKey = `cashier-token`

let common = {}

common.redirectToLogin = function () {
    window.location = window.location.pathname + '#/login'
}

common.setToken = function (token) {
    if (token) {
        window.localStorage.setItem(tokenKey, token)
    } else {
        window.localStorage.removeItem(tokenKey)
    }
}

common.getToken = function () {
    let token = window.localStorage.getItem(tokenKey)
    return token == null ? '' : token
}


common.getBaseApiUrl = function () {
    return baseApi
}

common.getApiUrl = function (api, param = {}) {

    if (api.startsWith('http')) {
        return api
    }

    let queryArr = []
    for (let k in param) {
        queryArr.push(encodeURIComponent(k) + '=' + encodeURIComponent(param[k]))
    }

    let queryStr = ''
    if (queryArr.length > 0) {
        const mark = api.indexOf('?') >= 0 ? '&' : '?'
        queryStr = mark + queryArr.join('&')
    }

    return common.getBaseApiUrl() + api + queryStr
}

common.ajax = function (method, api, data, config = {}) {

    data = data || {}

    const isGet = method.toLowerCase() === 'get'

    const configDefault = {
        'contentType': 'application/x-www-form-urlencoded', // application/x-www-form-urlencoded、multipart/form-data、application/json
        'timeout': 20000,                  // 调用api超时时间为20秒
        'displayError': true,              // 调用api出错时，是否显示错误消息
        'useToken': true,                  // api是否需要使用token。如果需要token而本地没有token时，将重定向到登录页
        'interceptInvalidToken': true,     // api返回token无效时，是否拦截。如果拦截，将重定向到登录页
    }

    config = Object.assign(configDefault, config)

    let headers = {
        'Content-Type': config['contentType']
    }

    let urlData = {}
    if (config.useToken) {

        urlData.token = common.getToken()
        // headers['token'] = common.getToken()
    }

    if (!isGet && config['contentType'].toLowerCase() === 'application/x-www-form-urlencoded') {
        data = qs.stringify(isGet ? null : data)
    }
    if (isGet) {
        urlData = {...data, ...urlData}
        data = {}
    }

    return new Promise((resolve, reject) => {

        axios({
            method: method,
            url: common.getApiUrl(api, urlData),
            data: data,
            headers: headers,
            timeout: config.timeout
        }).then((response) => {
            // console.log(response.data)
            if (response.data.code === 'SUCCESS') {
                resolve(response.data.data)
                return
            }

            switch (response.data.code) {
                case 'INVALID_TOKEN':
                    if (config.interceptInvalidToken) {

                        common.setToken(null)

                        if (config.displayError) {

                            common.toast('请登录')
                        }

                        common.redirectToLogin()
                    }
                    break

                default:
                    if (config.displayError) {
                        common.toast(response.data.message)
                    }
            }

            reject(response.data)

        }).catch((error) => {
            config.displayError && common.toast("" + error)
            reject({code: 'ERROR', message: '' + error, data: null})
        })

    })
}


common.alert = function (content, callback, title) {
    title = title || '提示'
    callback = callback || function () {
    }

    Modal.info({
        title: title,
        content: content,
        onOk() {
            callback()
        },
    });
}

common.message = function (content, type = "info") {
    common.toast(content, null, 2, type)
}

common.toast = function (content, callback, duration, type = "info") {
    duration = duration || 2 // 单位：秒

    callback = callback || function () {
    }

    setTimeout(callback, duration * 1000)

    switch (type) {
        case "info":
            message.info(content, duration);
            break
        case "error":
            message.error(content, duration);
            break
        case "success":
            message.success(content, duration);
            break
        default:
            message.info(content, duration);
    }
}

common.loadingStart = function (message) {
    message = message || '加载中...'

    let mask = document.createElement("div")
    mask.setAttribute("id", "myloadingmask")
    mask.style.position = "absolute"
    mask.style.width = "100%"
    mask.style.height = "100%"
    mask.style.zIndex = 999
    mask.style.top = "0px"
    mask.style.left = "0px"
    document.getElementsByTagName("body")[0].appendChild(mask)

    let container = document.createElement("div")
    container.setAttribute("id", "myloading")
    container.setAttribute("class", "container")

    let loading = document.createElement("div")
    loading.setAttribute("class", "loading")
    container.appendChild(loading)

    let style = document.createElement("style")
    style.innerHTML = `
     .container {
        z-index: 10000;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .loading {
        width: 60px;
        height: 60px;
        border-radius: 100%;
        border: 5px #aaa solid;
        border-right-color: #1890ff;
        animation: loading 1s linear infinite;
    }

    @keyframes loading {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }`

    container.appendChild(style)
    document.getElementsByTagName("body")[0].appendChild(container)

}

common.loadingStop = function () {
    let myloading = document.getElementById("myloading")
    if (myloading) {
        document.getElementsByTagName("body")[0].removeChild(myloading)
    }

    let myloadingmask = document.getElementById("myloadingmask")
    if (myloadingmask) {
        document.getElementsByTagName("body")[0].removeChild(myloadingmask)
    }
}

common.confirm = function (message, okCallback, cancelCallback, title) {
    title = title || '提示'

    okCallback = okCallback || function () {
    }
    cancelCallback = cancelCallback || function () {
    }

    Modal.confirm({
        title: title,
        content: message,
        onOk() {
            okCallback()
        },
        onCancel() {
            cancelCallback()
        },
    });
}

export default common

