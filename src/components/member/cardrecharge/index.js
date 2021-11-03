import React, { useState, useEffect } from 'react';
import "./index.less"
import common from "../../../common"
import { Input, Select, DatePicker, Button, message, Modal } from "antd"
import { MoneyCollectOutlined, AlipayOutlined, WechatOutlined, InsertRowRightOutlined } from "@ant-design/icons"
import moment from 'moment';
import EPayMethod from "../../../components/member/epaymethod"
import NP from 'number-precision'

function CardRecharge(props) {
    const { Option } = Select;

    let [payMethodArr, setPayMethodArr] = useState([])  //  支付方式
    let [money, setMoney] = useState(0)  //  充值金额
    let [realPay, setRealPay] = useState("")  //  实付金额
    let [remainAmount, setRemainAmount] = useState("")  //  待付款金额

    let [payMethodSelect, setPayMethodSelect] = useState([])  //  选择的支付方式和金额
    let [payMethodStatus, setPayMethodStatus] = useState(false)  //  选择的支付方式的修改状态

    let [ePayMethod, setEPayMethod] = useState(false)  //  电子支付的开关

    let [ePayTitle, setEPayTitle] = useState("")  // 弹窗的title
    let [paymentChannelId, setPaymentChannelId] = useState("")  //  支付渠道的id

    let [rechargeId, setRechargeId] = useState("")
    let [number, setNumber] = useState("")

    let [epaymethod, setEpaymethod] = useState({})  //  选择的电子支付方式

    /* ajax请求拿到支付方式的数据 */
    useEffect(() => {
        getPayMethodAxios()
    }, [])

    /* 实付金额 */
    useEffect(() => {
        realPaid(payMethodSelect)
    }, [money, payMethodStatus])

    /* 待付款金额,当输入的充值金额发送变化的时候 */
    useEffect(() => {
        waittingPaidAmount()
    }, [money, realPay])

    /* 进入支付页面就进来获取会员卡支付订单 */
    useEffect(() => {
        createMemberCardRechargeBill()
    }, [])

    /* 获取支付方式的ajax请求 */
    const getPayMethodAxios = () => {
        /* 0为全部，1为可用，2为禁用 */
        let data = { status: 1 }
        common.ajax("get", "/manage/paymentChannel/list", data).then((res) => {
            setPayMethodArr(res)
        })
    }

    /* 创建会员卡充值订单 */
    const createMemberCardRechargeBill = () => {
        let data = {
            cardId: props.cardinfo.id,
            memberId: props.memberid
        }
        common.ajax("post", "/member/rechargeOrder/create", data).then((res) => {
            setRechargeId(res.id)
            setNumber(res.number)
        })
    }

    /* 实付金额的计算，遍历支付方式的数组，得到实付金额 */
    const realPaid = (arr) => {
        if (arr.length === 0) {
            setRealPay(0)
            return
        }
        if (arr.length > 0) {
            let wm = 0
            for (let i = 0; i < arr.length; i++) {
                wm += arr[i].value * 1
                setRealPay(wm)
            }
        }
    }

    /* 待付款金额的计算 */
    const waittingPaidAmount = () => {
        let waittingPaid = NP.minus(money, realPay)
        setRemainAmount(waittingPaid)
    }

    /* 时间禁止选择超过当天的时间 */
    function disabledDate(current) {
        return current && current < moment().endOf('day');
    }

    /* 选择支付方式，并且将待付款金额充值到选择的支付方式里面 */
    const selectPayMethod = (item, waittingPaid) => {
        /* result用来检测当前选择的这种支付方式是否已经被选过了 */
        var result = payMethodSelect.some(a => a.name === item.name)
        if (!result && waittingPaid > 0) {
            let arr = payMethodSelect
            switch (item.code) {
                case "CASH":
                    item.value = waittingPaid
                    arr.push(item)
                    setPayMethodSelect([...arr])
                    setPayMethodStatus(!payMethodStatus)
                    break;
                case "ALIPAY":
                    if (!ePayMethod) {
                        ePaySelect("支付宝支付", item.id, item)
                    } else {
                        item.value = waittingPaid
                        arr.push(item)
                        setPayMethodSelect([...arr])
                        setPayMethodStatus(!payMethodStatus)
                    }
                    break;
                case "WXPAY":
                    if (!ePayMethod) {
                        ePaySelect("微信支付", item.id, item)
                    } else {
                        item.value = waittingPaid
                        arr.push(item)
                        setPayMethodSelect([...arr])
                        setPayMethodStatus(!payMethodStatus)
                    }
                    break;
                case "POS":
                    item.value = waittingPaid
                    arr.push(item)
                    setPayMethodSelect([...arr])
                    setPayMethodStatus(!payMethodStatus)
                    break;
                default:
                    break;
            }
        }
        if (waittingPaid === 0) {
            message.info("待付款金额为0，无需选择支付方式")
            return
        }
        if (waittingPaid < 0) {
            message.info("实收金额大于待付款金额")
        }
    }

    /* 点击支付方式 ,的名称与结余的钱*/
    function ePaySelect(name, id, item) {
        setEPayTitle(name)
        setPaymentChannelId(id)
        setEpaymethod(item)
        setEPayMethod(true)
    }

    /* 生成支付方式列表 */
    const createPayMethod = (arr) => {
        let filterArr = arr.filter(item => (item.code !== "CARD"))
        return filterArr.map((item, index) => {
            let Icon
            switch (item.code) {
                case "CASH":
                    Icon = <MoneyCollectOutlined />
                    break;
                case "ALIPAY":
                    Icon = <AlipayOutlined />
                    break;
                case "WXPAY":
                    Icon = <WechatOutlined />
                    break;
                case "POS":
                    Icon = <InsertRowRightOutlined />
                    break;
                default:
                    break;
            }
            return (
                <div className="pay_method_cash"
                    key={index}
                    onClick={() => {
                        selectPayMethod(item, remainAmount)
                    }}
                >
                    <div>
                        {Icon}
                        <div>{item.name}</div>
                    </div>
                </div>
            )
        })
    }

    /* 生成支付的输入框 */
    const createPayMethodInput = (arr) => {
        return arr.map((item, index) => {
            if (item.code === "ALIPAY" || item.code === "WXPAY") {
                return (<div className="pay_method_input" key={index}>
                    <span className="pay_method_input_left">{item.name}</span>
                    <div className="pay_method_input_right">
                        <Input value={item.value} disabled></Input>
                    </div>
                </div>)
            } else {
                return (
                    <div className="pay_method_input" key={index}>
                        <span className="pay_method_input_left">{item.name}</span>
                        <div className="pay_method_input_right">
                            <Input
                                value={item.value}
                                onChange={(e) => {
                                    changeInputValue(e.target.value, item.id)
                                }}
                            >
                            </Input>
                        </div>
                        <span
                            className="pay_method_input_delete"
                            onClick={() => {
                                deleteInputValue(item)
                            }}
                        ></span>
                    </div>
                )
            }
        })
    }

    /* 支付的输入框改变值的方法 */
    const changeInputValue = (value, id) => {
        let changePayMethodArr = payMethodSelect
        for (let i = 0; i < changePayMethodArr.length; i++) {
            if (changePayMethodArr[i].id === id) {
                changePayMethodArr[i].value = value
                setPayMethodSelect([...changePayMethodArr])
                setPayMethodStatus(!payMethodStatus)
            }
        }
    }

    /* 支付的输入框的删除 */
    const deleteInputValue = (item) => {
        let payMethodDelete = payMethodSelect.filter(a => a.id !== item.id)
        setPayMethodSelect([...payMethodDelete])
        setPayMethodStatus(!payMethodStatus)
    }

    /* 点击确定 */
    const okPaid = () => {
        if (remainAmount === 0 && money !== 0) {
            let paymentCreateDtoList = []
            for (let i = 0; i < payMethodSelect.length; i++) {
                let obj = {}
                obj.money = payMethodSelect[i].value
                obj.paymentChannelId = payMethodSelect[i].id
                paymentCreateDtoList.push(obj)
            }
            let rechargeData = {
                cardId: props.cardinfo.id,
                id: rechargeId,
                number: number,
                memberId: props.memberid,
                paymentCreateDtoList: paymentCreateDtoList,
                totalMoney: money,
            }
            let config = {
                'contentType': 'application/json',
            }
            common.ajax("post", "/member/rechargeOrder/complete", rechargeData, config).then((res) => {
                props.closeModel(false)
                props.refresh(!props.refreshStatus)
            })
            return
        }
        if (money === 0) {
            message.info("充值金额不能为0")
            return
        }
        if (remainAmount > 0) {
            message.info("还有未付清的余额")
            return
        }
        if (remainAmount < 0) {
            message.info("实际付款金额超出充值金额")
            return
        }
    }

    /* 点击取消 */
    const cancelPaid = () => {
        props.closeModel(false)
        props.refresh(!props.refreshStatus)
    }

    return (
        <div className="card_recharge">
            <div className="content_right">
                <div className="card_recharge_type">会员卡充值</div>
                <div className="card_recharge">
                    <div className="card_recharge_ui">
                        <h2 className="card_type">{props.cardinfo.cardCategoryDto.cardCategoryName}</h2>
                        <div className="card_balance">￥ <span>{props.cardinfo.balance}</span></div>
                        <div className="card_discount_time">
                            <div className="card_discount_time_left">
                                <h4 className="card_discount_text">消费优惠</h4>
                                <div className="card_discount_number">{props.cardinfo.cardCategoryDto.discount}%</div>
                            </div>
                            <div className="card_discount_time_right">
                                <h4 className="card_time_text">有效期限</h4>
                                <div className="card_time_number">
                                    {props.cardinfo.availableStart.substring(0, 10)} ~ {props.cardinfo.availableEnd.substring(0, 10)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card_recharge_pay">
                        <div className="card_recharge_validity_time">
                            <span className="validity_time_left">充值金额</span>
                            <div className="validity_time_right">
                                <Input
                                    value={money}
                                    onChange={(e) => {
                                        setMoney(e.target.value)
                                    }}>
                                </Input>
                            </div>
                        </div>
                        <div className="card_recharge_validity_time">
                            <span className="validity_time_left">实收金额</span>
                            <div className="validity_time_right">
                                <Input
                                    value={realPay}
                                    disabled >
                                </Input>
                            </div>
                        </div>
                        <div className="card_recharge_validity_time">
                            <span className="validity_time_left">有效日期</span>
                            <div className="validity_time_right">
                                <DatePicker picker="date" disabledDate={disabledDate} />
                            </div>
                        </div>
                        <div className="card_recharge_validity_time">
                            <span className="validity_time_left">销售人员</span>
                            <div className="validity_time_right">
                                <Select style={{ width: "100%" }}>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card_recharge_method_title">支付渠道</div>
                <div className="card_method">
                    <div className="card_method_left">
                        {
                            createPayMethod(payMethodArr)
                        }
                    </div>
                    <div className="card_method_right">

                        {
                            createPayMethodInput(payMethodSelect)
                        }

                    </div>
                    <div className="card_pay_btn">
                        <div>
                            <div className="card_pay_btn_title_text">待付款金额</div>
                            <div className={remainAmount !== 0 ? "card_pay_btn_waitting_paid" : "card_pay_btn_waitting_paid_ok"}>￥ <span>{remainAmount}</span></div>
                        </div>
                        <div style={{ margin: "10px 0" }}>
                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={() => {
                                    okPaid()
                                }}
                            >
                                确认(Enter)
                            </Button>
                        </div>
                        <div>
                            <Button
                                type="danger"
                                size="large"
                                block
                                onClick={() => {
                                    cancelPaid()
                                }}
                            >
                                取消(Esc)
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                title={ePayTitle}
                className="model_min_width"
                centered
                visible={ePayMethod}
                onCancel={() => setEPayMethod(false)}
                width={960}
                footer={null}
                bodyStyle={{ padding: 0 }}
                destroyOnClose={true}
                maskClosable={false}
            >
                <EPayMethod
                    rechargeId={rechargeId}
                    number={number}
                    money={remainAmount}
                    modelControl={setEPayMethod}
                    paymentChannelId={paymentChannelId}
                    selectPayMethod={selectPayMethod}
                    epaymethod={epaymethod}
                    cardId={props.cardinfo.id}
                    memberId={props.memberid}
                ></EPayMethod>
            </Modal>

        </div >
    )
}

export default CardRecharge;