import React from 'react';
import Menu from "../../../components/menu";
import {
    AppstoreAddOutlined,
    CoffeeOutlined,
    CreditCardOutlined,
    DeploymentUnitOutlined,
    TableOutlined
} from "@ant-design/icons";
import './style.less'

function Other(props) {
    return (
        <div className = {'other'}>
            <Menu num = {4}/>
            <div className = {'other-content'}>
                <div className={'other-item'} onClick = {() => {
                    props.history.push('/manage/product')
                }}>
                    <AppstoreAddOutlined className = {'size'}/>
                    <span>商品管理</span>
                </div>
                <div className={'other-item'} onClick = {() => {
                    props.history.push('/manage/category')
                }}>
                    <DeploymentUnitOutlined className = {'size'}/>
                    <span>商品分类</span>
                </div>
                <div className={'other-item'} onClick = {() => {
                    props.history.push('/manage/area')
                }}>
                    <DeploymentUnitOutlined className = {'size'}/>
                    <span>区域管理</span>
                </div>
                <div className={'other-item'} onClick = {() => {
                    props.history.push('/manage/plate')
                }}>
                    <DeploymentUnitOutlined className = {'size'}/>
                    <span>桌台管理</span>
                </div>
                <div className={'other-item'} onClick = {() => {

                    props.history.push('/manage/craft')
                }}>
                    <CoffeeOutlined className = {'size'}/>
                    <span>加工方式</span>
                </div>

                <div className={'other-item'} onClick = {() => {
                    props.history.push('/manage/paymentChannel')
                }}>
                    <CoffeeOutlined className = {'size'}/>
                    <span>支付渠道</span>
                </div>

                <div className={'other-item'} onClick = {() => {
                    props.history.push('/manage/plan')
                }}>
                    <TableOutlined className = {'size'}/>
                    <span>价格方案</span>
                </div>
                <div className={'other-item'} onClick = {() => {
                    props.history.push('/manage/cardCategory')
                }}>
                    <CreditCardOutlined className = {'size'}/>
                    <span>卡类管理</span>
                </div>
            </div>
        </div>
    );
}

export default Other;