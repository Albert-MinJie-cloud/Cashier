import React, {useEffect, useState} from 'react';
import './style.less'
import {
    ArrowLeftOutlined,
    MinusCircleOutlined,
    MoneyCollectOutlined
} from "@ant-design/icons";
import {Modal} from 'antd';
import common from '../../common';
import {connect} from "react-redux";
import MemberPay from "../member/memberpay";
import BigNumber from "bignumber.js";


function CheckOut(props) {

    //支付方式列表
    const [paymentList, setPaymentList] = useState([])
    //实际收到的金额
    const [actualIncome, setActualIncome] = useState(0)
    //应收金额
    const [harvest, setHarvest] = useState()
    //总金额
    const [originHarvest, setOriginHarvest] = useState()
    //抹零前半段
    const [firstHalf, setFirstHalf] = useState()
    //抹零后半段
    const [secondHalf, setSecondHalf] = useState()
    //获取聚焦框状态值
    const [active, setActive] = useState(null)
    //折扣值
    const [discount, setDiscount] = useState('')
    //抹零值
    const [wipe, setWipe] = useState('')
    //优惠金额
    const [decrease, setDecrease] = useState(0)
    // 订单详情
    const [order, setOrder] = useState({})
    // 支付种类列表
    const [payment, setPayment] = useState([])

    //显示打折页面
    const [displayPage, setDisplayPage] = useState(false)
    //抹零
    const [displayPage1, setDisplayPage1] = useState(false)

    //显示微信支付宝支付界面
    const [wechatOrAli, setWechatOrAli] = useState(false)
    //存入微信支付或者支付宝支付对象
    const [wechatOrAliItem, setWechatOrAliItem] = useState(null)
    //微信支付宝支付码
    const [wechatOrAliCode, setWechatOrAliCode] = useState('')


    //  会员支付的组件是否打开的状态
    const [memberPaymentVisible, setMemberPaymentVisible] = useState(false)
    //  会员支付成功返回的会员和card信息
    const [memberInfo, setMemberInfo] = useState({memberId: 0, cardId: 0, mobile: "", code: "", paidMoney: 0})
    //  支付方式code为card的支付方式对象
    const [paymentChannel, setPaymentChannel] = useState({id: 0, code: 'CARD', name: ''})

    //  会员支付结束存menberID，cardId，mobile，code
    function storeMemberInfo(memberId, cardId, mobile, code, paidMoney) {
        console.log(123456);
        setMemberInfo({
            memberId: memberId,
            cardId: cardId,
            mobile: mobile,
            code: code,
            paidMoney: paidMoney
        })
    }

    //  会员卡选择成功后回调
    function addMoneyInput(money, item) {
        console.log(item);
        pushArray({
            code: `CARD`, name: `${item.name}`, money: money, paymentChannelId: `${item.id}`
        })
    }

    useEffect(() => {
        console.log('memberInfo', memberInfo);
    }, [memberInfo.cardId])

    // 请求要付的基础金额
    function getMoney() {
        common.loadingStart()
        common.ajax('post', '/operation/billOrder/create', {billIdList: props.billId})
        .then(response => {
            setOrder(response)
            setHarvest(response.totalFee)
            setOriginHarvest(response.totalFee)
        })
        .finally(common.loadingStop)
    }

    // 获取支付方式的种类
    function getPayment() {
        common.ajax('get', '/manage/paymentChannel/list', {status: 1})
        .then(response => {
            setPayment(response)
        })
    }

    //input 聚焦时要输入的内容 
    function handleClick(item) {
        if (active === null) {
            return
        }
        switch (active.name) {
            case 'discount':
                if (item === '11') {
                    setDiscount(discount.slice(0, discount.length - 1))
                    setHarvest(originHarvest)
                    setDecrease(0)
                } else if (item === '10') {
                    setDiscount('')
                } else {
                    if ((discount === '' || discount === '0') && item === '.') {
                        setDiscount('0.')
                    } else if (discount === '' && item === '00') {
                        setDiscount('0')
                    } else if (discount === '0' && (item === '00' || item === '0')) {
                        setDiscount('0')
                    } else if (discount === '0' && (item !== '00' || item !== '0')) {
                        setDiscount(item)
                    } else {
                        setDiscount(discount + item)
                    }
                }
                break;
            case 'payment':
                if (item === '11') {
                    paymentList[active.index].money = paymentList[active.index].money.slice(0, paymentList[active.index].money.length - 1)
                } else if (item === '10') {
                    paymentList[active.index].money = ''
                } else {
                    if ((paymentList[active.index].money === '' || paymentList[active.index].money === '0') && item === '.') {
                        paymentList[active.index].money = '0.'
                    } else if (paymentList[active.index].money === '' && item === '00') {
                        paymentList[active.index].money = '0'
                    } else if (paymentList[active.index].money === '0' && (item === '00' || item === '0')) {
                        paymentList[active.index].money = '0'
                    } else if (paymentList[active.index].money === '0' && (item !== '00' || item !== '0')) {
                        paymentList[active.index].money = item
                    } else {
                        paymentList[active.index].money += item
                    }
                }
                setPaymentList([...paymentList])
                break;
            case 'wipe':
                if (item === '11') {
                    setWipe(wipe.slice(0, wipe.length - 1))
                    setHarvest(originHarvest)
                    setDecrease(0)
                } else if (item === '10') {
                    setWipe('')
                } else {
                    if ((wipe === '' || wipe === '0') && item === '.') {
                        setWipe('0.')
                    } else if (wipe === '' && item === '00') {
                        setWipe('0')
                    } else if (wipe === '0' && (item === '00' || item === '0')) {
                        setWipe('0')
                    } else if (wipe === '0' && (item !== '00' || item !== '0')) {
                        setWipe(item)
                    } else {
                        setWipe(wipe + item)
                    }
                }
                break;
        }
    }

    // 向数组中加支付方式
    function pushArray(item) {
        for (let i = 0; i < paymentList.length; i++) {
            if (paymentList[i].paymentChannelId === item.paymentChannelId) {
                return
            }
        }
        setPaymentList([...paymentList, item])
    }

    // 金额更新
    function update() {
        common.ajax(
            'get',
            '/operation/billOrder/calc',
            {
                id: order.id,
                cardId: memberInfo.cardId,
                memberId: memberInfo.memberId,
                percentage: (discount === '' ? 100 : (Number(discount) > 100 ? setDiscount(100) : Number(discount))),
                discount: (wipe === '' ? 0 : wipe)
            })
        .then(res => {
            setHarvest(res.totalFee)
            setDecrease(res.discount)
        })
    }

    useEffect(() => {
        getPayment()
        getMoney()
    }, [props.billId])

    useEffect(() => {

        // 如果order.id 值存在则执行update方法；短路
        order.id && update()
        /**
         * if(order.id){
         *   update()
         * }
         */
    }, [paymentList, discount, wipe, memberInfo.cardId])

    useEffect(() => {
        let receive = 0
        for (let i in paymentList) {
            receive = Number(paymentList[i].money) + Number(receive)
        }

        // 实际收到的金额
        setActualIncome(receive)
    }, [paymentList])

    function residue() {
        let z
        let x = new BigNumber(harvest)
        let y = new BigNumber(actualIncome)
        z = x.minus(y)

        return Number(z)
    }

    return (
        <div className = {'CheckOut'}>
            <div className = {'checkOut-left'}>
                <div className = {'checkOut-left-money'}>
                    应收：￥{harvest}
                </div>
                <div className = {'checkOut-left-details'}>
                    <div className = {'checkOut-left-details-one'}>
                        <div className = {'checkOut-left-details-one-desk'}>台桌</div>
                        <div className = {'checkOut-left-details-one-button'}>收银备注</div>
                    </div>
                    <div className = {'checkOut-left-details-two'}>
                        <span style = {{width: 75, display: 'inline-block'}}>用餐人数：</span><span>{}人</span>
                    </div>
                    <div className = {'checkOut-left-details-three'}>
                        <span style = {{width: 75, display: 'inline-block'}}>订单号：</span><span>{order.number}</span>
                    </div>
                    <div className = {'checkOut-left-details-four'}>
                        <span style = {{width: 75, display: 'inline-block'}}>总金额：</span>
                        <span className = {'checkOut-left-details-five-money'}>{'￥' + order.totalFee}</span>
                    </div>
                    <div className = {'checkOut-left-details-five'}>
                        <span style = {{width: 75, display: 'inline-block'}}>优惠金额：</span><span>￥{decrease}</span>
                    </div>

                </div>

                <div className = {'hide-input'}>
                    {
                        paymentList.map((item, index) => {
                            return (
                                <div className = {'hide-input-block'} key = {index}>
                                    <span className = {'payment-title'}>{item.name}</span>
                                    <input
                                        onChange = {(e) => {
                                            for (let i = 0; i < paymentList.length; i++) {
                                                if (item.name === paymentList[i].name) {
                                                    paymentList[i].money = e.target.value
                                                }
                                            }
                                            setPaymentList([...paymentList])
                                        }}
                                        value = {item.money} type = "text"
                                        onFocus = {() => {
                                            setActive({name: "payment", index: index})
                                        }}/>

                                    <div onClick = {() => {
                                        let newArray = []
                                        for (let i = 0; i < paymentList.length; i++) {
                                            if (i !== index) {
                                                newArray.push(paymentList[i])
                                            }
                                        }
                                        setPaymentList([...newArray])
                                    }}>
                                        <MinusCircleOutlined style = {{color: '#666'}}/>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <div className = {'checkOut-right'}>
                <div className = {'payment-details'}>
                    <div className = {'payment-details-title'}>
                        <span/>支付详情
                    </div>

                    <div className = {'payment-details-money'}>
                        <div>
                            <span>实收</span>
                            <input
                                readOnly
                                value = {actualIncome}
                                type = "text"/>
                        </div>
                    </div>


                </div>
                <div className = {'payment-method'}>
                    <div className = {'payment-method-title'}>
                        <span/>支付方式
                    </div>
                    <div>
                        {
                            payment.map((item, index) => {
                                return (
                                    <div className = {'payment-method-block'}
                                         key = {index}
                                         onClick = {() => {
                                             console.log(item)
                                             if (item.code === 'CARD') {
                                                 // 会员支付
                                                 setPaymentChannel(item)
                                                 setMemberPaymentVisible(true)
                                             } else if (item.code === 'ALIPAY' || item.code === 'WXPAY') {
                                                 setWechatOrAliItem(item)
                                                 setWechatOrAli(true)
                                             } else {
                                                 pushArray({
                                                     code: `${item.code}`,
                                                     name: `${item.name}`,
                                                     money: `${residue()}`,
                                                     paymentChannelId: `${item.id}`
                                                 })
                                             }
                                         }}>
                                        <MoneyCollectOutlined/>
                                        <span>{item.name}</span>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>

                <div className = {'keys'}>
                    <div onClick = {() => handleClick('1')}>1</div>
                    <div onClick = {() => handleClick('2')}>2</div>
                    <div onClick = {() => handleClick('3')}>3</div>
                    <div className = {'fun'} onClick = {() => handleClick('11')}>
                        <ArrowLeftOutlined/>
                    </div>
                    <div className = {'fun'} onClick = {() => handleClick('10')}>清空</div>
                    <div onClick = {() => handleClick('4')}>4</div>
                    <div onClick = {() => handleClick('5')}>5</div>
                    <div onClick = {() => handleClick('6')}>6</div>
                    <div className = {'fun'}>订单详情</div>
                    <div className = {'fun'}>打印账单</div>
                    <div onClick = {() => handleClick('7')}>7</div>
                    <div onClick = {() => handleClick('8')}>8</div>
                    <div onClick = {() => handleClick('9')}>9</div>
                    <div className = {'fun'}
                         onClick = {() => {
                             setSecondHalf('0' + harvest.toString().slice(harvest.toString().indexOf('.')))
                             setDisplayPage1(true)
                         }}>抹零
                    </div>
                    <div className = {'fun'} onClick = {() => setDisplayPage(true)}>打折
                    </div>
                    <div onClick = {() => handleClick('0')}>0</div>
                    <div onClick = {() => handleClick('00')}>00</div>
                    <div onClick = {() => handleClick('.')}>.</div>
                    <div className = {'ok'}
                         onClick = {() => {
                             common.loadingStart()
                             common.ajax(
                                 'post',
                                 '/operation/billOrder/complete',
                                 {
                                     id: order.id,
                                     cardId: memberInfo.cardId,    //会员卡id
                                     memberId: memberInfo.memberId,  //会员id
                                     mobile: memberInfo.mobile,    //手机号
                                     code: memberInfo.code,     //验证码
                                     smallChange: secondHalf,    //
                                     percentage: wipe !== '' ? setDiscount('') : (discount === '' ? 100 : (Number(discount) > 100 ? setDiscount(100) : Number(discount))),
                                     discount: discount !== '' ? setWipe('') : (wipe === '' ? 0 : wipe),
                                     paymentCreateList: paymentList
                                 },
                                 {
                                     contentType: 'application/json'
                                 })
                             .then(() => {
                                 props.setIsModalVisible1(false)
                             })
                             .finally(() => {
                                 common.loadingStop()
                                 setPaymentList([])
                             })
                         }}>确定
                    </div>
                </div>
            </div>

            <Modal
                title = "会员支付"
                className = "model_min_width"
                centered
                visible = {memberPaymentVisible}
                onCancel = {() => setMemberPaymentVisible(false)}
                width = {1200}
                footer = {null}
                bodyStyle = {{padding: 0}}
                destroyOnClose = {true}
                maskClosable = {false}>
                <MemberPay
                    totalFee = {harvest}
                    havePaid = {actualIncome}
                    order = {order}
                    storeMemberInfo = {storeMemberInfo}
                    closeModal = {setMemberPaymentVisible}
                    paymentChannel = {paymentChannel}
                    addMoneyInput = {addMoneyInput}/>
            </Modal>

            <Modal
                onCancel = {() => setDisplayPage(false)}
                onOk = {() => setDisplayPage(false)}
                maskClosable = {false}
                title = "打折"
                width = {400}
                visible = {displayPage}>
                <div className = {'checkOut-left-details-six'}>
                    <div className = {'checkOut-left-details-six-name'}>
                        整单折扣：
                    </div>
                    <div className = {'checkOut-left-details-six-discount'}>
                        <div>
                            <input type = "text"
                                   onChange = {(e) => {
                                       let pat = /^[0-9]*$/
                                       let str = e.target.value
                                       if (!pat.test(str)) {
                                           return
                                       }
                                       setDiscount(e.target.value)
                                       setOrder({...order, percentage: e.target.value})
                                   }}
                                   value = {discount}
                                   onFocus = {() => {
                                       setActive({name: "discount"})
                                   }}/> %
                        </div>
                        <span>100%为原价，0为免单</span>
                    </div>
                </div>
                <div className = {'checkOut-left-details-seven'}>
                    <span style = {{width: 90, display: 'inline-block'}}>整单优惠：</span>
                    <input type = "text"
                           onChange = {(e) => {
                               let pat = /^[0-9]*$/
                               let str = e.target.value
                               if (!pat.test(str)) {
                                   return
                               }
                               setWipe(e.target.value);
                               setOrder({...order, discount: e.target.value})
                           }}
                           value = {wipe}
                           onFocus = {() => setActive({name: "wipe"})}/>元
                </div>
            </Modal>


            <Modal
                onCancel = {() => setDisplayPage1(false)}
                width = {400}
                visible = {displayPage1}
                maskClosable = {false}
                onOk = {() => {
                    common.ajax(
                        'get',
                        '/operation/billOrder/calc',
                        {
                            id: order.id,
                            smallChange: secondHalf
                        }).then((res) => {
                        setHarvest(res.totalFee)
                        setDisplayPage1(false)
                    })
                }}
                title = {'抹零'}>
                <div className = {'checkOut-left-details-seven'}>
                    <span>抹零金额：</span>
                    <input type = "text" value = {secondHalf} onChange = {(e) => setSecondHalf(e.target.value)}/>
                </div>
            </Modal>


            <Modal
                title = {wechatOrAliItem === null ? '' : `${wechatOrAliItem.name}` + '支付'}
                visible = {wechatOrAli}
                onCancel = {() => {
                    setWechatOrAli(false)
                    setWechatOrAliCode('')
                }}
                maskClosable = {false}
                footer = {null}>
                <div className = {'money'}>
                    金额：<span>￥{residue()}</span>
                </div>
                <div className = {'payment-details-code'}>
                    <span>付款码</span>
                    <input type = "text"
                           value = {wechatOrAliCode}
                           onChange = {e => setWechatOrAliCode(e.target.value)}
                           onKeyDown = {(e) => {
                               if (e.keyCode === 13) {
                                   common.loadingStart()
                                   common.ajax('post', '/api/cashier/pay', {
                                       dynamicId: wechatOrAliCode,
                                       money: `${residue()}`,
                                       number: order.number,
                                       paymentChannelId: wechatOrAliItem.id,
                                       subject: '111'
                                   }).then(() => {
                                       setWechatOrAliCode('')
                                       pushArray({
                                           code: `${wechatOrAliItem.code}`,
                                           name: `${wechatOrAliItem.name}`,
                                           money: `${residue()}`,
                                           paymentChannelId: `${wechatOrAliItem.id}`
                                       })
                                       setWechatOrAli(false)
                                   }).finally(common.loadingStop)
                               }
                           }}/>
                </div>
            </Modal>
        </div>
    );
}


//取值
const mapStateToProps = (state) => {
    return {
        isModalVisible1: state.baseData.isModalVisible1,
        billId: state.baseData.billId,
    }
}

//传值
const mapDispatchToProps = (dispatch) => {
    return {
        setIsModalVisible1: (isModalVisible1) => {
            dispatch({type: 'CHANGE_CHECKOUT', isModalVisible1: isModalVisible1})
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckOut)