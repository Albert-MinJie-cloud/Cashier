import React, { useState, useEffect } from 'react'
import "./index.less"
import { Input, Space, Button, Avatar, Divider, Badge, Select, message, Modal, Empty } from 'antd';
import { MobileOutlined, CloseCircleOutlined, UserOutlined } from "@ant-design/icons"
import MemberCardDetail from "../membercarddetail"
import common from '../../../common';

function MemberPay(props) {
    const { Option } = Select

    let [memberInfo, setMemberInfo] = useState({})  //  查询到的会员信息
    let [buttonStep, setButtonStep] = useState(1)   //  查询会员还是获取验证码的按钮生成
    let [payMethod, setPayMethod] = useState("phonepay")  //  支付方式的导航栏的选中状态
    let [phoneNum, setPhoneNum] = useState("")  //  手机号
    let [phoneStatus, setPhoneStatus] = useState(false)  //  控制验证码输入框是否出现
    let [qrCode, setQrcode] = useState("")  //  二维码输入
    let [qrCodeStatus, setQrcodeStatus] = useState(false)  //  二维码的状态

    let [selectCard, setSelectCard] = useState(0)  //  1为全部卡，2为打折卡，3为储值卡，4为计次卡
    let [cardList, setCardList] = useState([])  //  获取到的卡券的列表

    let [amountAccount, setAmountAccount] = useState("")  //  消费总金额
    let [totalFeeChange, setTotalFeeChange] = useState(false)  //  每次请求到消费总金额变化，就改变这个状态，来更新总金额
    let [alreadyPaid, setAlreadyPaid] = useState("")  //  已经付款金额(别的渠道)

    let [deductions, setDeductions] = useState(false)  //  本次扣款的金额是否改变
    let [waittingPaid, setWaitingPaid] = useState(0)  //  还需支付
    let [waittingPaidChange, setWaittingPaidChange] = useState(false)

    let [selectCoupon, setSelectCoupon] = useState({})  //  选择的卡券
    let [couponValue, setCouponValue] = useState({})  //  卡券支付的列表包含本次扣款的信息

    /* 选择卡券成功返回的订单信息 */
    let [billInfo, setBillInfo] = useState("")
    /* 会员详情的模态框 */
    let [memberDetailModel, setMemberDetailModel] = useState(false)
    let [memberId, setMemberId] = useState("")

    /* 设置支付方式的参数 */
    const options = [
        { label: '手机支付', value: 'phonepay' },
        { label: '扫码支付', value: 'scancode' },
        { label: '刷卡支付', value: 'cardpay' }
    ];

    /* 卡的类型的数据 */
    const cardClass = [
        { label: "全部卡类", numbr: 0, value: 1 },
        { label: "打折卡", numbr: 0, value: 2 },
        { label: "储值卡", numbr: 0, value: 3 },
        { label: "计次卡", numbr: 0, value: 4 }
    ]

    /* 卡券的选择数据 */
    const coupon = [
        { label: "冲1000送500", discount: 0.8, value: 1 },
        { label: "计次卡", discount: 0, value: 2 },
        { label: "专享卡", discount: 0.5, value: 3 },
        { label: "卡券", discount: 0.56, value: 4 }
    ]

    /* props拿到传进来的订单信息和已经支付的钱 */
    useEffect(() => {
        setAlreadyPaid(props.havePaid)
        setAmountAccount(props.totalFee)
        setDeductions(!deductions)
    }, [])

    /* 总消费金额变化,计算还需支付的钱，每次请求成功都计算 */
    useEffect(() => {
        calcWaitPaid()
    }, [selectCoupon.id, deductions])

    /* 将选择的卡券加入到couponvalue里面 */
    useEffect(() => {
        calcCouponValue()
    }, [waittingPaidChange])

    /* 计算还需支付的钱，成功就将选择的卡和卡付的钱加到coupon里面 */
    function calcWaitPaid() {
        let isEmptyObj = JSON.stringify(couponValue) === "{}"
        if (isEmptyObj) {
            let waitpaid = amountAccount * 1 - alreadyPaid * 1
            waitpaid = waitpaid.toFixed(2)
            if (waitpaid > 0) {
                setWaitingPaid(waitpaid)
            } else {
                setWaitingPaid(0)
            }
        } else {
            let waitpaid = amountAccount * 1 - alreadyPaid * 1 - couponValue.value * 1
            waitpaid = waitpaid.toFixed(2)
            if (waitpaid > 0) {
                setWaitingPaid(waitpaid)
            } else {
                setWaitingPaid(0)
            }
        }
        setWaittingPaidChange(!waittingPaidChange)
    }

    /* 计算卡支付的钱,判断卡里面的余额是否够支付，如果卡里面的余额够就支付完所有的钱，如果不够扣完卡里面的余额 */
    function calcCouponValue() {
        let isObjEmpty = JSON.stringify(selectCoupon) === "{}"
        if (isObjEmpty) {
            return
        } else {
            let couponObj = {}
            let result = selectCoupon.balance - waittingPaid
            if (result > 0) {
                couponObj.id = selectCoupon.id
                couponObj.value = waittingPaid
                couponObj.name = selectCoupon.cardCategoryDto.cardCategoryName
                setCouponValue({ ...couponObj })
                setWaitingPaid(0)
                return
            }
            if (result < 0) {
                couponObj.id = selectCoupon.id
                couponObj.value = selectCoupon.balance
                couponObj.name = selectCoupon.cardCategoryDto.cardCategoryName
                setCouponValue({ ...couponObj })
                setWaitingPaid(selectCoupon.balance)
                return
            }
            if (result === 0) {
                couponObj.id = selectCoupon.id
                couponObj.value = waittingPaid
                couponObj.name = selectCoupon.cardCategoryDto.cardCategoryName
                setCouponValue({ ...couponObj })
                setWaitingPaid(0)
                return
            }
        }
    }


    /* 支付方式的导航栏选择生成 */
    function createPayMethod() {
        return options.map((item, index) => {
            return (
                <li className={payMethod === item.value ? "li_active" : ""} key={index} onClick={() => { setPayMethod(item.value) }}>{item.label}</li>
            )
        })
    }

    /* 手机号的输入，检测是否有删除手机号的动作，有删除动作就重置二维码的输入 */
    function phoneInput(e) {
        let inputLength = e.target.value.length
        let realLength = phoneNum.length
        if (inputLength < realLength) {
            setPhoneStatus(false)
            setPhoneNum(e.target.value)
            setButtonStep(1)
            setQrcode("")
            setMemberInfo({})
            setSelectCoupon({})
            setCardList([])
            setMemberId("")
        } else {
            setPhoneNum(e.target.value)
        }
    }

    /* 点击查询会员验证手机号是否合法，合法则查询手机号对应的会员，查到后验证码的输入框打开 */
    function checkPhone() {
        let phoneRxg = /^1[0-9]{10}$/g
        let status = phoneRxg.test(phoneNum)
        if (status) {
            let data = { mobile: phoneNum }
            common.ajax("post", "/member/list", data).then((res) => {
                let memberId = res[0].id
                setMemberId(res[0].id)
                let detailData = { id: memberId }
                common.ajax("get", "/member/detail", detailData).then((res) => {
                    setPhoneStatus(status)
                    setButtonStep(2)
                    setMemberInfo({ ...res })
                    getMemberCard(res.id, 0)
                })
            })
        } else {
            message.info("手机号不合法")
        }
    }

    /* 获取会员卡券 */
    function getMemberCard(id, status) {
        /* status为0为可用，1为未生效， 2为已过期，3出删除外全部卡券*/
        if (id === undefined) {
            message.info("请输入会员手机号后再查询")
            return
        }
        let data = {
            memberId: id,
            status: status
        }
        common.ajax("get", "/member/card/list", data).then((res) => {
            setSelectCard(1)
            setCardList([...res])
        })
    }

    /* 重置手机号 */
    function resetPhone() {
        setPhoneStatus(false)
        setPhoneNum("")
    }

    /* 生成侧边的卡类 */
    function createCardClass(arr) {
        return arr.map((item, index) => {
            return (
                <div key={index} onClick={() => { setSelectCard(item.value) }}>
                    <div className={(selectCard === item.value) ? "pay_method_userCardList_item_active" : "pay_method_userCardList_item"}>
                        <div>{item.label}</div>
                        <Badge count={item.numbr} style={{ backgroundColor: '#f88510' }} />
                    </div>
                    <Divider type="horizontal" style={{ margin: 0 }}></Divider>
                </div>
            )
        })
    }

    /* 生成卡券的选择,现在只支持选择一张会员卡 */
    function createCoupon(obj) {
        let isObjEmpty = JSON.stringify(obj) === "{}"
        if (isObjEmpty) {
            return (
                <div></div>
            )
        } else {
            return (
                <div className="pay_method_userConsume_middle_item" key={1}>
                    <div>
                        <CloseCircleOutlined
                            style={{ color: '#f88510' }} />
                        {obj.name}
                    </div>
                    <div>---</div>
                    <div>{obj.value}</div>
                </div>
            )
        }
    }

    /* 生成按钮查询会员和获取验证码按钮 */
    function createButton(type) {
        /* type为0，1，2，的时候分别对应无内容，查询会员、获取验证码 */
        if (type === 0) {
            return <div></div>
        }
        if (type === 1) {
            return (
                <Space>
                    <Button type="primary" onClick={() => { checkPhone() }}>查询</Button>
                    <Button type="danger" onClick={() => { resetPhone() }}>重置</Button>
                </Space>
            )
        }
        if (type === 2) {
            return (
                <Space>
                    <Button
                        type="primary"
                        onClick={() => { getQrcode() }}>获取验证码</Button>
                </Space>
            )
        }
    }

    /* 获取验证码 */
    function getQrcode() {
        let data = {
            mobile: phoneNum
        }
        common.ajax("post", "/api/sms", data).then((res) => {
            message.info('获取验证码成功')
        })
    }

    /* 生成卡券 */
    function createCardList() {

        if (cardList.length === 0) {
            return <div style={{ height: '100%', display: "flex", alignItems: 'center', justifyContent: "center" }}>
                <Empty />
            </div>
        } else {
            return cardList.map((item, index) => {
                return (
                    <div className={selectCoupon.id === item.id ? "member_coupon_active" : "member_coupon"} key={index} >
                        <div className="coupon_top">
                            <div className="coupon_top_top">
                                <div className="coupon_top_money_center">
                                    <div>￥<span>{item.balance}</span></div>
                                    <div>
                                        <span>{item.cardCategoryDto.cardCategoryName}</span>
                                        <span>【{item.cardCategoryDto.discount}%】</span>
                                    </div>
                                </div>
                            </div>
                            <div className="coupon_top_cardnum">
                                <div><span>No.</span><span>{item.number.substring(4)}</span></div>
                            </div>
                        </div>
                        <div className="coupon_middle">
                            <div>
                                <span>发卡店: </span>
                                <span>--店</span>
                            </div>
                            <div>
                                <span>限品类: </span>
                                <span>不限</span>
                            </div>
                            <div>
                                <span>备注:</span>
                                <span>{item.cardCategoryDto.remark}</span>
                            </div>
                        </div>
                        <div className="coupon_bottom">
                            <div className="coupon_bottom_time">
                                {item.availableStart.substring(0, 10)} ~ {item.availableEnd.substring(0, 10)}
                            </div>
                            <div className="coupon_bottom_btn">
                                {
                                    selectCoupon.id !== item.id ?
                                        <Button
                                            type="primary"
                                            onClick={() => {
                                                addSelectCoupon(item)
                                            }}>立即使用
                                        </Button> :
                                        <Button disabled={true}>已选择</Button>
                                }
                            </div>
                        </div>
                    </div >
                )
            })
        }
    }

    /* 点击后选择对应卡券，得到计算后的钱数 */
    function addSelectCoupon(item) {
        setCouponValue({})
        let data = {
            cardId: item.id,
            discount: props.order.discount,
            id: props.order.id,
            memberId: memberInfo.id,
            percentage: props.order.percentage || 100,
            smallChange: props.order.smallChange || "0"
        }
        common.ajax("get", "/operation/billOrder/calc", data).then((res) => {
            setAmountAccount(res.totalFee)
            setSelectCoupon({ ...item })
            setBillInfo(res)
        })
    }

    /* 点击确定的时候，调用确认会员卡的按钮 */
    function onOkCoupon() {
        if (!couponValue.id || !couponValue.value) {
            message.info("请选择会员卡")
            return
        }
        let data = {
            cardId: couponValue.id,
            code: qrCode,
            mobile: phoneNum,
            money: couponValue.value
        }
        if (qrCode.length > 0) {
            common.ajax("get", "/member/cardUse/confirm", data).then((res) => {
                props.storeMemberInfo(billInfo.memberId, billInfo.cardId, phoneNum, qrCode, couponValue.value)
                props.addMoneyInput(couponValue.value, props.paymentChannel)
                props.closeModal(false)
            })
        } else {
            message.info("验证码不能为空")
        }
    }

    /* 点击取消 */
    function onCancle() {
        props.closeModal(false)
    }

    /* 快速给会员充值 */
    function quickRecharge() {
        if (memberId === "") {
            message.info("请先输入手机号查询会员")
        } else {
            setMemberDetailModel(true)
        }
    }

    return (
        <div className="member_pay">
            <div className="member_pay_left">
                <div className="member_pay_left_top">
                    <div className="pay_method_select">
                        <ul>
                            {
                                createPayMethod()
                            }
                        </ul>
                    </div>
                    <div className="pay_method_input">
                        <div className="pay_method_input_left">
                            <Input
                                value={phoneNum}
                                maxLength={11}
                                addonBefore={<MobileOutlined />}
                                placeholder="请输入会员手机号"
                                onChange={(e) => {
                                    phoneInput(e)
                                }}></Input>
                        </div>
                        <div
                            className="pay_method_input_right"
                            hidden={phoneStatus ? false : true}>
                            <Input
                                value={qrCode}
                                placeholder="请输入验证码"
                                onChange={(e) => {
                                    setQrcode(e.target.value)
                                }}
                            ></Input>
                        </div>
                    </div>
                    <div className="pay_method_getCode">
                        {
                            createButton(buttonStep)
                        }
                    </div>
                </div>

                <div className="member_pay_left_user">
                    <div className="pay_method_userInfo">
                        <div className="pay_method_userInfo_left">
                            <Avatar
                                size="large"
                                src={memberInfo.Avatar !== "" ? memberInfo.Avatar : ""}
                                icon={memberInfo.Avatar !== "" ? <UserOutlined /> : ""} />
                        </div>
                        <div className="pay_method_userInfo_right">
                            <div>{memberInfo.name ? memberInfo.name : "会员名"}</div>
                            <div>{memberInfo.mobile ? memberInfo.mobile : "会员手机号"}</div>
                        </div>
                    </div>
                    <div className="pay_method_userMoney">
                        <div className="pay_method_userMoney_left">
                            <div>账户余额</div>
                            <div>xxxxx.xx</div>
                        </div>
                        <Divider type="vertical" style={{ height: 44 }}></Divider>
                        <div className="pay_method_userMoney_right">
                            <div>账户积分</div>
                            <div>xxxx</div>
                        </div>
                    </div>
                    <Divider type="horizontal" style={{ margin: "6px 0" }}></Divider>
                    <div className="pay_method_userCardList">
                        {
                            createCardClass(cardClass)
                        }
                    </div>
                    <div className="divider_horiable"></div>
                    <div className="pay_method_userConsume">
                        <div className="pay_method_userConsume_top">
                            <div>
                                <div>消费总金额</div>
                                <div>{amountAccount ? amountAccount : 0}</div>
                            </div>
                            <div>
                                <div>已经支付</div>
                                <div>{alreadyPaid ? alreadyPaid : 0}</div>
                            </div>
                            <div>
                                <div>本次扣款</div>
                                <div>{couponValue.value === undefined ? 0.00 : couponValue.value}</div>
                            </div>
                        </div>

                        <div className="pay_method_userConsume_middle">

                            {
                                createCoupon(couponValue)
                            }

                        </div>

                        <div className="pay_method_userConsume_bottom">
                            <div>
                                <div>还需支付</div>
                                <div>{waittingPaid}</div>
                            </div>
                            <div>
                                <div>支付金额</div>
                                <div>{couponValue.value === undefined ? 0.00 : couponValue.value}</div>
                            </div>
                        </div>

                        <div className="pay_method_userConsume_button">
                            <Button
                                type="primary"
                                onClick={() => {
                                    onOkCoupon()
                                }}>
                                确认
                            </Button>
                            <Button
                                type="primary"
                                danger
                                onClick={() => {
                                    onCancle()
                                }} >取消</Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="member_pay_right">
                <div className="member_coupon_class_select">
                    <Select
                        defaultValue={0}
                        bordered={false}
                        onChange={(e) => {
                            getMemberCard(memberInfo.id, e)
                        }}>
                        <Option value={0}>可用卡券</Option>
                        <Option value={1}>未生效卡券</Option>
                        <Option value={2}>已过期卡券</Option>
                    </Select>
                    <a onClick={() => {
                        quickRecharge()
                    }}>点我给本会员快速充值</a>
                </div>
                <div className="member_coupon_scoll">

                    {
                        createCardList()
                    }

                </div>
            </div>

            <Modal
                title="会员信息"
                className="model_min_width"
                centered
                visible={memberDetailModel}
                onCancel={() => setMemberDetailModel(false)}
                width={960}
                footer={null}
                bodyStyle={{ padding: 0 }}
                destroyOnClose={true}
                maskClosable={false}
            >
                <MemberCardDetail memberId={memberId} />
            </Modal>


        </div>
    )
}

export default MemberPay;