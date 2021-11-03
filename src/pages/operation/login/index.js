import React, { useEffect, useState } from 'react';
import './style.less';
import common from "../../../common";
import { message } from "antd";

function Login(props) {

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    function onFinish() {

        if (userId === '' || password === '') {
            return message.error("请输入账号密码")
        }

        common.loadingStart()
        common.ajax(
            'post',
            '/passport/token/create',
            { password: password, username: userId },
            { displayError: false }
        )
            .then(res => {
                common.setToken(res.token)
                window.localStorage.setItem('tenantId', res.tenantId)
                props.history.push('/')
                // connect(res.tenantId)
            })
            .catch(err => {
                common.message(err.message, "error")
            })
            .finally(common.loadingStop)
    }

    useEffect(() => {
        if (common.getToken() !== '') {
            props.history.push('/')
        }
    }, []);


    return (
        <div className={'Login'}
            onKeyDown={(e) => {
                if (e.keyCode === 13) {
                    onFinish()
                }
            }}>

            <h1>登录</h1>

            <input type="text"
                onChange={(e) => {
                    setUserId(e.target.value)
                }}
                placeholder="账号" />

            <input type="password"
                onChange={(e) => {
                    setPassword(e.target.value)
                }}
                placeholder={"密码"} />

            <button onClick={onFinish}>登录</button>

        </div>
    );
}

export default Login;