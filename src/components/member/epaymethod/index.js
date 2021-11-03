import React, { useState, useEffect } from 'react';
import "./index.less"
import common from '../../../common';
import phoneimage from "./images/phone.png"
import scanimage from "./images/scan.png"

function EPayMethod(props) {

    let [shouldPaid, setShouldPaid] = useState()  //  总金额
    let [dynamicId, setDanamicId] = useState("")  // 条码内容
    let [number, setNumber] = useState("")  //  订单创建成功返回的number
    let [rechargeId, setRechargeId] = useState("")  //  订单号
    let [subject, setSubject] = useState("电子支付")  //  交易简介

    let [sn, setSn] = useState("")  //  收钱吧系统单号
    let [paymentId, setPaymentId] = useState("")  //  第三方支付结果未知时返回的paymentId

    useEffect(() => {
        moneyChange(props.money)
    }, [props.money])

    useEffect(() => {
        setNumber(props.number)  //  订单创建成功返回的number
        setRechargeId(props.rechargeId)  //  电子支付的订单号
    }, [])

    /* 金钱处理函数 */
    function moneyChange(money) {
        if (money.toString().includes(".")) {
            setShouldPaid(money);
        } else {
            let paid = money + "." + "00"
            setShouldPaid(paid);
        }
    }

    /* 点击确定调用第三方支付接口,支付成功关闭窗口，将付费的钱传出去 */
    function ePayOk() {
        common.loadingStart()
        let data = {
            dynamicId: dynamicId,
            money: shouldPaid,
            number: number,
            paymentChannelId: props.paymentChannelId,
            subject: subject
        }
        common.ajax("post", "/api/cashier/pay", data).then((res) => {
            console.log("调用支付接口成功得到的数据", res);
            let paySuccessData = res
            setSn(paySuccessData.sn)
            setPaymentId(paySuccessData.paymentId)
            if (paySuccessData.resultCode === "PAY_SUCCESS") {
                common.loadingStop()
                props.selectPayMethod(props.epaymethod, shouldPaid)
                props.modelControl(false)
                return
            }
            if (paySuccessData.resultCode === "PAY_IN_PROGRESS") {
                setTimeout(() => {
                    queryPayStatus()
                }, 1000)
            }
        }).catch((err) => {
            console.log("调用支付接口失败得到的数据", err);
            common.loadingStop()
        }).finally((result) => {
            console.log("调用支付接口结束后得到的数据", result);
        })
    }

    /* 支付状态查询 */
    function queryPayStatus() {
        if (paymentId !== "" && sn !== "") {
            let data = {
                number: number,
                paymentId: paymentId,
                sn: sn
            }
            common.ajax("", "/api/cashier/query", data).then((res) => {
                console.log("轮询查询接口得到的数据", res);
                let querySuccessData = res
                if (querySuccessData.resultCode === "PAY_SUCCESS") {
                    common.loadingStop()
                    props.selectPayMethod(props.epaymethod, shouldPaid)
                    props.modelControl(false)
                }
                if (querySuccessData.resultCode === "PAY_IN_PROGRESS") {
                    queryPayStatus()
                }
            }).catch((err) => {
                console.log(err);
            })
        }
    }

    return (
        <div className="e_pay_method">

            <div className="e_pay_method_top">
                <div className="paymoney_title">付款金额</div>
                <div className="paymoney_money">￥{shouldPaid}</div>
                <div className="labal_two">
                    <label htmlFor="paymethod" className="paymethod_label">付款码:</label>
                    <input
                        className="paymethod_input"
                        id="paymethod"
                        type="text"
                        placeholder="请输入付款码"
                        value={dynamicId}
                        onChange={(e) => {
                            setDanamicId(e.target.value)
                        }}
                        onKeyDown={(e) => {
                            if (e.keyCode === 13) {
                                ePayOk()
                            }
                        }}
                    />
                </div>
            </div>

            <div className="e_pay_method_middle">
                <div className="step step_left">
                    <div className="step_img">
                        <img src={phoneimage} alt="手机付款" />
                    </div>
                    <div className="step_description">step1、打开支付宝或者微信进入"付款"。</div>
                </div>
                <div className="empty_middle"></div>
                <div className="step step_right">
                    <div className="step_img">
                        <img src={scanimage} alt="付款条码" />
                    </div>
                    <div className="step_description">step2、输入手机支付成功后的条码。</div>
                </div>
            </div>

            <div className="e_pay_method_footer">
            </div>

        </div>
    )
}

export default EPayMethod;