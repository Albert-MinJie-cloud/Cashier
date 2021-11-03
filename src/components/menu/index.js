import React, {useState, useEffect} from 'react';
import './style.less'
import {
    AppstoreAddOutlined,
    AppstoreFilled,
    BellFilled, CoffeeOutlined,
    CreditCardOutlined,
    ContainerFilled,
    DeploymentUnitOutlined,
    HomeFilled,
    RetweetOutlined,
    TableOutlined,
    UserOutlined
} from "@ant-design/icons";

import {withRouter} from "react-router-dom"


function Menu(props) {

   

    const [num, setNum] = useState(props.num)

    return (
        <div className = {'menu-container'}>
            <div>
                <div className = {'menu-container-item'} style = {{cursor: 'auto'}}>
                    logo
                </div>
                <div className = {num === 1 ? 'menu-container-item num' : 'menu-container-item'} onClick = {() => {
                    setNum(1)
                    props.history.push('/')
                }}>
                    <HomeFilled className = {'size'}/>
                    <span>台桌</span>
                </div>

                <div className = {num === 3 ? 'menu-container-item num' : 'menu-container-item'} onClick = {() => {
                    setNum(3)
                    props.history.push('/orderList')
                }}>
                    <ContainerFilled className = {'size'}/>
                    <span>订单列表</span>
                </div>
                <div className = {num === 2 ? 'menu-container-item num' : 'menu-container-item'} onClick = {() => {
                    setNum(2)
                    props.history.push('/substitute')
                }}>
                    <RetweetOutlined className = {'size'}/>
                    <span>交接班</span>
                </div>

                <div className = {num === 14 ? 'menu-container-item num' : 'menu-container-item'} onClick = {() => {
                    setNum(14)
                    props.history.push('/member')
                }}>
                    <UserOutlined className = {'size'}/>
                    <span>会员收银</span>
                </div>

                <div className = {num === 4 ? 'menu-container-item num' : 'menu-container-item'} onClick = {() => {
                    setNum(4)
                    props.history.push('/other')
                }}>
                    <AppstoreFilled className = {'size'}/>
                    <span>更多</span>
                </div>
            </div>
            <div>
                <div className = {'menu-container-item item-bottom'}>
                    <BellFilled style = {{fontSize: 18}}/>
                </div>
            </div>
        </div>
    );
}

export default withRouter(Menu);
