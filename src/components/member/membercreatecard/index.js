import React, { useState, useEffect } from 'react'
import "./index.less"
import { Tabs, Input, DatePicker, Select, Button, message, Modal } from 'antd';
import { MoneyCollectOutlined, AlipayOutlined, WechatOutlined, InsertRowRightOutlined } from "@ant-design/icons"
import common from '../../../common';
import moment from 'moment';
import EPayMethod from "../../../components/member/epaymethod"
import NP from 'number-precision'

function MemberCreateCard(props) {
    const { TabPane } = Tabs;
    const { Option } = Select;

    let [selectCardClass, setSelectCardClass] = useState(1)  //  为table框的卡类选择
    let [cardList, setCardList] = useState([])      //卡的列表
    let [selectCard, setSelectCard] = useState({})      // 选择的卡(单个对象)

    let [payMethodList, setPayMethodList] = useState([])  //  支付方式的列表
    let [payMethod, setPayMethod] = useState([])  //  选择的支付方式

    let [paidAccountChange, setPaidAccountChange] = useState(false)

    let [createCardAmount, setCreateCardAmount] = useState(0) // 开卡金额(应收金额)
    let [rechargeAmount, setRechargeAmount] = useState("")  // 充值金额 = 开卡金额 - 卡自带金额
    let [paidAmount, setPaidAmount] = useState("") // 实收金额 = 现金 + 支付宝/微信
    let [waittingPaid, setWaittingPaid] = useState('')  // 待付款金额 = 开卡金额 - 实收金额

    let [memberCardInfo, setMmberCardInfo] = useState({ cardId: "", memberId: "" })  //  开卡成功,存储卡的信息

    let [ePayTitle, setEPayTitle] = useState("")  // 弹窗的title
    let [ePayMethod, setEPayMethod] = useState(false)  //  电子支付的开关
    let [paymentChannelId, setPaymentChannelId] = useState("")  //  支付渠道的id
    let [epaymethod, setEpaymethod] = useState({})  //  选择的电子支付方式

    let [number, setNumber] = useState("")  // 创建充值订单成功返回的number
    let [rechargeId, setRechargeId] = useState("")  //  创建充值订单成功返回的rechargeID

    /* 获取支付方式(支付渠道) */
    useEffect(() => {
        getPayMethodListAxios()
    }, [])

    /* 再刚进页面的时候做axios请求获取卡的列表的数据 */
    useEffect(() => {
        getCardListAxios()
    }, [selectCardClass])

    /* 计算实收金额 */
    useEffect(() => {
        getPaidAccount()
    }, [paidAccountChange])

    /* 计算待付款金额,当实收金额改变后，再计算待付款金额 */
    useEffect(() => {
        getWaittingPaid()
    }, [paidAmount, createCardAmount])

    /* 开卡金额一变化就计算充值金额 */
    useEffect(() => {
        getActualRecharge()
    }, [createCardAmount])

    /* 获取卡的列表的数据的请求 */
    const getCardListAxios = () => {
        /* status代表不同的卡类，0除了已经删除的,1为正常,2为禁用,9被删除的,*/
        let data = {
            status: 1
        }
        common.ajax("get", "/member/cardCategory/list", data).then((res) => {
            setCardList(res)
        })
    }

    /* 获取支付方式的列表数据 */
    const getPayMethodListAxios = () => {
        /* status代表不同的卡类，0为全部,1为可用,2为禁用*/
        let data = { status: 1 }
        common.ajax("get", "/manage/paymentChannel/list", data).then((res) => {
            setPayMethodList(res)
        })
    }

    /* 时间禁止选择 */
    function disabledDate(current) {
        return current && current < moment().endOf('day');
    }

    /* 会员开卡，开卡成功保存开的卡信息 */
    function memberCreateCard(cardCategoryId, memberId, item, money) {
        let data = { cardCategoryId: cardCategoryId, memberId: memberId }
        common.ajax("post", "/member/card/create", data).then((res) => {
            let memberCard = { cardId: res.id, memberId: props.memberId }
            setMmberCardInfo({ ...memberCard })
            let rachargeData = { cardId: res.id, memberId: props.memberId }
            common.ajax("post", "/member/rechargeOrder/create", rachargeData).then((res) => {
                setRechargeId(res.id)
                setNumber(res.number)
                selectPayMethod(item, money)
            })
        })
    }

    /* 点击支付方式 ,的名称与结余的钱*/
    function ePaySelect(name, id, item) {
        setEPayTitle(name)
        setPaymentChannelId(id)
        setEpaymethod(item)
        setEPayMethod(true)
    }

    /* 支付方式添加金额的方法 */
    function selectPayMethod(item, money) {
        var result = payMethod.some(a => a.name === item.name)
        if (!result && waittingPaid !== 0) {
            let arr = payMethod
            switch (item.code) {
                case "CASH":
                    var obj = {}
                    obj.id = item.id
                    obj.name = item.name
                    obj.value = money
                    obj.code = item.code
                    arr.push(obj)
                    setPayMethod([...arr])
                    setPaidAccountChange(!paidAccountChange)
                    break;
                case "ALIPAY":
                    if (!ePayMethod) {
                        ePaySelect("支付宝支付", item.id, item)
                    } else {
                        var obj = {}
                        obj.id = item.id
                        obj.name = item.name
                        obj.value = money
                        obj.code = item.code
                        arr.push(obj)
                        setPayMethod([...arr])
                        setPaidAccountChange(!paidAccountChange)
                    }
                    break;
                case "WXPAY":
                    if (!ePayMethod) {
                        ePaySelect("微信支付", item.id, item)
                    } else {
                        var obj = {}
                        obj.id = item.id
                        obj.name = item.name
                        obj.value = money
                        obj.code = item.code
                        arr.push(obj)
                        setPayMethod([...arr])
                        setPaidAccountChange(!paidAccountChange)
                    }
                    break;
                case "POS":
                    var obj = {}
                    obj.id = item.id
                    obj.name = item.name
                    obj.value = money
                    obj.code = item.code
                    arr.push(obj)
                    setPayMethod([...arr])
                    setPaidAccountChange(!paidAccountChange)
                    break;
                default:
                    break;
            }
            return
        }
        if (waittingPaid === 0) {
            message.info("待支付金额为0，无需选择支付方式")
            return
        }
    }

    /* 支付方式的选择函数code支付方式，item支付方式的对象 */
    /* 先判断支付金额是否大于0，再判断是否开了会员卡 */
    function payMethodSelect(item, money) {
        if (rechargeAmount > 0) {
            if (memberCardInfo.cardId === "") {
                memberCreateCard(selectCard.id, props.memberId, item, money)
            } else {
                selectPayMethod(item, money)
            }
        } else {
            message.info("充值金额为0,无需选择支付方式")
        }
    }

    /* 生成卡的列表 */
    function createCardList(arr) {
        if (arr.length > 0) {
            return arr.map((item, index) => {
                return (
                    <div key={index}
                        onClick={() => {
                            setSelectCard(item)
                            setCreateCardAmount(0)
                            setPayMethod([])
                            setPaidAccountChange(!paidAccountChange)
                        }}
                        className={selectCard.id === item.id ? "discount_card_active discount_card" : "discount_card"}>
                        <div className="discount_card_title">
                            {item.name}
                        </div>
                        <div className="card_amount">
                            <span>折扣: {item.discount}%</span>
                        </div>
                        <div className="discount_card_validity">
                            <span>有效期：</span>
                            <span>{item.durationDay > 365 ? "长期" : `开卡后${item.durationDay}天`}</span>
                        </div>
                    </div>
                )
            })
        } else {
            return (
                <div>暂无数据</div>
            )
        }
    }

    /* 生成支付方式的函数 */
    function createpayMethod(arr) {
        let filterArr = arr.filter(item => (item.code !== "CARD"))
        return filterArr.map((item, index) => {
            let payMethodIcon
            switch (item.code) {
                case "CASH":
                    payMethodIcon = <MoneyCollectOutlined />
                    break;
                case "ALIPAY":
                    payMethodIcon = <AlipayOutlined />
                    break;
                case "WXPAY":
                    payMethodIcon = <WechatOutlined />
                    break;
                case "POS":
                    payMethodIcon = <InsertRowRightOutlined />
                    break;
                default:
                    break;
            }
            return (
                <div
                    className="pay_method_cash"
                    key={index}
                    onClick={() => {
                        payMethodSelect(item, waittingPaid)
                    }}>
                    <div>
                        {payMethodIcon}
                        <div>{item.name}</div>
                    </div>
                </div>
            )
        })
    }

    /* 生成支付的输入框 */
    function createPayInput(arr) {
        return arr.map((item, index) => {
            if (item.code === "ALIPAY" || item.code === "WXPAY") {
                return (
                    <div className="pay_method_input" key={index}>
                        <span className="pay_method_input_left">{item.name}</span>
                        <div className="pay_method_input_right">
                            <Input value={item.value} disabled></Input>
                        </div>
                    </div>
                )
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
                                deleteInput(item)
                            }}
                        ></span>
                    </div>
                )
            }
        })
    }

    /* 点击减号去掉指定的输入框 */
    function deleteInput(type) {
        let arr = payMethod.filter(item => (item !== type));
        setPayMethod([...arr])
        setPaidAccountChange(!paidAccountChange)
    }

    /* 实收金额的计算 ,pm为余额*/
    function getPaidAccount() {
        let pm = 0
        for (let i = 0; i < payMethod.length; i++) {
            pm += payMethod[i].value * 1
        }
        setPaidAmount(pm)
    }

    /* 待付款金额,wm为待付款金额 */
    function getWaittingPaid() {
        let wm
        wm = createCardAmount * 1 - paidAmount
        if (wm >= 0) {
            setWaittingPaid(wm)
        } else {
            message.info("实际付款金不能大于开卡金额")
        }
    }

    /* 计算实际充值金额=开卡金额-卡类的默认金额 */
    function getActualRecharge() {
        let actualrecharge
        actualrecharge = createCardAmount * 1 - 0
        setRechargeAmount(actualrecharge)
    }

    /* 输入值的时候更改对应数组里面的value */
    function changeInputValue(value, id) {
        let newValueArr = payMethod
        for (let i = 0; i < newValueArr.length; i++) {
            if (newValueArr[i].id === id) {
                newValueArr[i].value = value
                break
            }
        }
        setPayMethod([...newValueArr])
        setPaidAccountChange(!paidAccountChange)
    }

    /* 点击确定支付按钮，检查待付款金额是否为0,如果为0,再判断调充值金额为是否为0，如果为0，则调用开卡的接口，不为0调用充值接口,开卡成功后关掉卡开的页面*/
    const okPaid = () => {
        if (waittingPaid === 0 && rechargeAmount === 0) {
            let data = {
                cardCategoryId: selectCard.id,
                memberId: props.memberId
            }
            common.ajax("post", "/member/card/create", data).then((res) => {
                props.closeMemberCreateCardModal(false)
                props.cardList(1)
            })
            return
        }
        if (waittingPaid === 0 && rechargeAmount > 0) {
            let memberId = props.memberId
            let paymentCreateDtoList = []
            for (let i = 0; i < payMethod.length; i++) {
                let obj = {}
                obj.money = payMethod[i].value.toString()
                obj.paymentChannelId = payMethod[i].id
                paymentCreateDtoList.push(obj)
            }
            let rechargeData = {
                id: rechargeId,
                cardId: memberCardInfo.cardId,
                memberId: memberId,
                number: number,
                paymentCreateDtoList: paymentCreateDtoList,
                totalMoney: rechargeAmount
            }
            let config = {
                'contentType': 'application/json'
            }
            common.ajax("post", "/member/rechargeOrder/complete", rechargeData, config).then((res) => {
                props.closeMemberCreateCardModal(false)
                props.cardList(1)
            })
        }
        if (waittingPaid > 0) {
            message.info("还有未付清的余额")
            return
        }
        if (waittingPaid < 0) {
            message.info("实际付款金额不能大于开卡金额")
            return
        }
        if (rechargeAmount < 0) {
            message.info("开卡金额不能小于卡的实际金额")
            return
        }
    }

    /* 点击取消按钮，关闭办卡的页面 */
    const cancelPaid = () => {
        props.closeMemberCreateCardModal(false)
        props.cardList(1)
    }

    return (
        <div className="membercreatecard">
            <div className="membercreatecard_content">
                <div className="content_left">
                    <div className="left_title">
                        <span className="title_text">
                            备选卡类
                        </span>
                    </div>
                    <Tabs defaultActiveKey="1" centered tabBarStyle={{ marginBottom: 0 }} onChange={(e) => { setSelectCardClass(e) }}>
                        <TabPane tab="全部" key="1">
                            <div className="discountcard">
                                {
                                    selectCardClass == 1 ? createCardList(cardList) : ""
                                }
                            </div>
                        </TabPane>
                        <TabPane tab="打折卡" key="2">
                            <div className="discountcard">
                                {
                                    selectCardClass == 2 ? createCardList(cardList) : ""
                                }
                            </div>
                        </TabPane>
                        <TabPane tab="储值卡" key="3">
                            <div className="discountcard">
                                {
                                    selectCardClass == 3 ? createCardList(cardList) : ""
                                }
                            </div>
                        </TabPane>
                        <TabPane tab="计次卡" key="4">
                            <div className="discountcard">
                                {
                                    selectCardClass == 4 ? createCardList(cardList) : ""
                                }
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
                <div className="content_right" hidden={(JSON.stringify(selectCard) === "{}") ? true : false}>
                    <div className="card_recharge_type">开卡类型</div>
                    <div className="card_recharge">
                        <div className="card_recharge_ui">
                            <h2 className="card_type">{selectCard.name}</h2>
                            <div className="card_balance">￥ <span>{createCardAmount}</span></div>
                            <div className="card_discount_time">
                                <div className="card_discount_time_left">
                                    <h4 className="card_discount_text">消费优惠</h4>
                                    <div className="card_discount_number">{selectCard.discount}%</div>
                                </div>
                                <div className="card_discount_time_right">
                                    <h4 className="card_time_text">有效期限</h4>
                                    <div className="card_time_number">{false ? "yyyy - mm - dd" : selectCard.createdAt}</div>
                                </div>
                            </div>
                        </div>
                        <div className="card_recharge_pay">
                            <div className="card_recharge_validity_time">
                                <span className="validity_time_left">开卡金额</span>
                                <div className="validity_time_right">
                                    <Input
                                        value={createCardAmount}
                                        onChange={(e) => {
                                            setCreateCardAmount(e.target.value)
                                        }}>
                                    </Input>
                                </div>
                            </div>
                            <div className="card_recharge_validity_time">
                                <span className="validity_time_left">实收金额</span>
                                <div className="validity_time_right">
                                    <Input value={paidAmount} disabled ></Input>
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
                                createpayMethod(payMethodList)
                            }

                        </div>
                        <div className="card_method_right">

                            {
                                createPayInput(payMethod)
                            }

                        </div>
                        <div className="card_pay_btn">
                            <div>
                                <div>待付款金额</div>
                                <div className={waittingPaid > 0 ? "card_pay_btn_waitting_paid" : ""}>￥ <span>{waittingPaid}</span></div>
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
            </div >

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
                    money={waittingPaid}
                    modelControl={setEPayMethod}
                    paymentChannelId={paymentChannelId}
                    selectPayMethod={selectPayMethod}
                    epaymethod={epaymethod}
                    cardId={memberCardInfo.cardId}
                    memberId={memberCardInfo.memberId}
                ></EPayMethod>
            </Modal>

        </div >
    )
}

export default MemberCreateCard;