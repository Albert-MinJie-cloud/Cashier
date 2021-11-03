import React, {useEffect, useState} from 'react';
import './index.less'
import Menu from "../../../components/menu";
import {Modal, Space} from 'antd'
import {ArrowLeftOutlined} from "@ant-design/icons";
import CheckOut from "../../../components/checkOut";
import common from "../../../common";
import {connect} from "react-redux";

function Home(props) {

    //区域列表
    const [areaList, setAreaList] = useState([]);
    //点击区域的键值
    const [areaKey, setAreaKey] = useState(0);

    //开台呼出页面
    const [isModalVisible, setIsModalVisible] = useState(false);

    //选中的桌台
    const [deskForDetails, setDeskForDetails] = useState(null);
    //当前选中桌台的人数
    const [peoples, setPeoples] = useState('')

    //账单Id列表
    const [billIdList, setBillIdList] = useState([])


    //将本地数据进行重组并分类---桌台列表
    const getShowDeskList = (areaId) => {

        if (areaId === 0) {
            return props.deskList
        }
        let temp = {}
        for (let i = 0; i < props.deskList.length; i++) {

            let areaId = props.deskList[i].areaId
            if (!(areaId in temp)) {
                temp[areaId] = []
            }
            temp[areaId].push(props.deskList[i])
        }

        if (areaId in temp) {
            return temp[areaId]
        } else {
            return []
        }
    }

    //开台页面呼出函数
    function deskShow() {
        setIsModalVisible(true)
    }

    //虚拟键盘控制器
    function count(item) {
        if (item === 10) {
            setPeoples('')
        } else if (item === 11) {
            setPeoples(peoples.slice(0, peoples.length - 1))
        } else {
            if (item === 0 && peoples === '') {
                setPeoples('')
            } else {
                setPeoples(peoples + item)
            }
        }
    }

    //获取区域列表
    function getAreaList(id) {
        common.ajax('get', '/manage/area/list').then(r => {
            setAreaList(r.list)
        })
    }

    //获取台桌列表
    function getDeskList() {
        common.ajax('get', '/manage/plate/list', {status: 1}).then(r => {
            props.setDeskList(r.list)
        })
    }

    //获取账单列表
    const getBillList = () => {
        let list = []
        common.ajax('get', '/operation/bill/list', {status: 1}).then(r => {
            props.setBillList(r.list)
            for (let i = 0; i < r.list.length; i++) {
                list.push(r.list[i].id)
            }
        }).finally(() => {
            getConsumerList(list)
            setBillIdList(list)
        })
    }


    //获取消费列表
    const getConsumerList = (id) => {
        common.ajax(
            'get',
            '/operation/consume/list',
            {
                limit: 200,
                status: 1,
                paymentStatus: [1, 2],
                billIdList: id,
            },
            {contentType: 'application/json'})
        .then(r => {
            props.setConsumerList(r.list);
        })
    }

    //将本地数据进行重组并分类---消费账单列表
    function getShowConsumerList(billId) {

        if (billId === null) {
            return []
        }

        let obj = {}
        for (let i = 0; i < props.consumerList.length; i++) {
            let id = props.consumerList[i].billId
            if (!(id in obj)) {
                obj[id] = []
            }
            obj[id].push(props.consumerList[i])
        }

        if (billId.billId in obj) {
            return obj[billId.billId]
        } else {
            return []
        }
    }

    //关于台桌底色问题
    function aboutColor(status) {
        let backgroundColor
        let color

        switch (status) {
            case 1:
                break
            case 2:
                backgroundColor = "#0697ff";
                color = '#fff'
                break
            case 3:
                backgroundColor = "#f88510";
                color = '#fff'
                break
            case 4:
                backgroundColor = "#0cca45";
                color = '#fff'
                break
            default:
                break
        }
        return ({
            backgroundColor,
            color
        })
    }

    //获取菜单分类列表
    function TypesOfCourses() {
        common.ajax('get', '/manage/category/list').then(r => {
            if (r.list === null) {
                props.setCategoryList([])
            }
            props.setCategoryList(r.list)
        })
    }

    //获取菜品列表
    function getProductList(id) {
        common.ajax('get', '/manage/product/list', {categoryId: typeof id == "undefined" ? 0 : id}).then(res => {
            props.setProductList(res.list)
        })
    }

    //获取加工方式
    function getTags() {
        common.ajax('get', '/manage/craft/list').then(r => {
            props.setTagsData(r.list)
        })
    }

    useEffect(() => {
        getAreaList()
        getDeskList()
        getBillList()
        TypesOfCourses()
        getProductList()
        getTags()

    }, []);

    useEffect(() => {
        props.setOrderedDishes(getShowConsumerList(deskForDetails))
    }, [deskForDetails])


    function format(num) {
        return num.split('.')[0]
    }

    function totalMoney(arr) {
        if (arr.length <= 0) {
            return 0
        }

        let total = 0
        arr.map((item) => total += (format(item.quantity) * item.basePrice))

        return total
    }

    return (
        <div className = {'Home'}>
            <Menu num = {1}/>
            <div className = {'home-content'}>

                {/*左侧台桌页面*/}
                <div className = {'home-content-left'}>

                    {/* 区域分类列表 */}
                    <div className = {'home-content-left-top'}>
                        <div
                            onClick = {() => setAreaKey(0)}
                            className = {
                                areaKey === 0 ? 'home-content-left-top-item option' : 'home-content-left-top-item'
                            }>全部
                        </div>
                        {
                            areaList.map((item) => {
                                return (
                                    <div key = {item.id}
                                         onClick = {() => {
                                             setAreaKey(item.id)
                                         }}
                                         className = {areaKey === item.id ? 'home-content-left-top-item option' : 'home-content-left-top-item'}>
                                        {item.name}
                                    </div>
                                )
                            })
                        }
                    </div>

                    {/* 桌台列表 */}
                    <div className = {'home-content-left-middle'}>
                        {
                            getShowDeskList(areaKey).map((item) => {
                                return (
                                    <div className = {'desk'}
                                         key = {item.id}
                                         style = {aboutColor(item.use)}
                                         onClick = {() => {
                                             let obj
                                             for (let i = 0; i < props.billList.length; i++) {
                                                 if (props.billList[i].plateId === item.id) {
                                                     obj = {
                                                         billId: props.billList[i].id,
                                                         plateId: props.billList[i].plateId,
                                                         serviceType: props.billList[i].serviceType,
                                                         totalPerson: props.billList[i].totalPerson
                                                     }
                                                 }
                                             }

                                             if (item.use === 1) {
                                                 deskShow()
                                                 setDeskForDetails(item)
                                             } else {
                                                 setDeskForDetails({...obj, ...item})
                                             }
                                         }}>
                                        <span
                                            className = {item.use === 1 ? 'desk-title' : 'desk-title1'}>{item.name}</span>
                                        <span>{item.areaName}</span>
                                        <span>{item.use === 1 ? `空闲/${item.people}人桌` : `${item.people}/${item.people}人桌`}</span>
                                    </div>
                                )
                            })
                        }
                    </div>

                    {/* 图例 */}
                    <div className = {'home-content-left-bottom'}>
                        <div>
                            <div key = {'空闲'}>
                                <span style = {{backgroundColor: '#cfcfcf'}}/>
                                <p>空闲</p>
                            </div>
                            <div key = {'开台'}>
                                <span style = {{backgroundColor: '#0697ff'}}/>
                                <p>开台</p>
                            </div>
                            <div key = {'下单'}>
                                <span style = {{backgroundColor: '#f88510'}}/>
                                <p>下单</p>
                            </div>
                            <div key = {'付款'}>
                                <span style = {{backgroundColor: '#0cca45'}}/>
                                <p>付款</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/*页面右侧账单列表*/}
                <div className = {'home-content-right'}>
                    <div className = {'home-content-right-top'}>
                        <div
                            className = {'home-content-right-top-one'}>桌台：{deskForDetails === null ? null : deskForDetails.name}</div>
                        <div>
                            <div
                                className = {'home-content-right-top-two'}>人数：{deskForDetails === null ? null : deskForDetails.totalPerson}</div>
                            <div className = {'home-content-right-top-two'}>备注：</div>
                        </div>
                    </div>
                    <div className = {'home-content-right-bottom-left'}>
                        <div className = {'home-content-right-bottom-left-item'}>移台</div>
                        <div className = {'home-content-right-bottom-left-item'}>合台</div>
                        <div className = {'home-content-right-bottom-left-item'}>合台<br/>结账</div>
                        <div className = {'home-content-right-bottom-left-item'}>打印<br/>预结</div>
                        <div className = {'home-content-right-bottom-left-item'}
                             onClick = {() => {
                                 if (deskForDetails === null) {
                                     common.message('请选择要结账的台桌', 'info')
                                 } else if (deskForDetails.use === 4) {
                                     common.ajax('post', '/manage/plate/reset', {plateId: deskForDetails.id})
                                     .then(() => {
                                         common.message('清台成功', 'success')
                                     })
                                 } else {
                                     common.message('该台桌未结账', 'error')
                                 }
                             }}>清台
                        </div>
                    </div>

                    {/* 消费列表 */}
                    <div className = {'home-content-right-bottom-right'}>
                        <div className = {'home-content-right-bottom-right-list'}>
                            <div className = {'home-content-right-bottom-right-item '}>
                                <span className = {'item-name'} style = {{float: 'left'}}>商品名称</span>
                                <span className = {'item-quantity'}>数量</span>
                                <span className = {'item-price'} style = {{float: 'right'}}>价格（元）</span>
                            </div>

                            {getShowConsumerList(deskForDetails).map((item) => {
                                return (
                                    <div
                                        key = {item.id}
                                        className = {'home-content-right-bottom-right-item'}
                                        style = {{border: 'none', color: '#000', cursor: 'pointer'}}>
                                        <span className = {'item-name'}
                                              style = {{float: 'left'}}>{item.productName}</span>
                                        <span className = {'item-quantity'}>*{format(item.quantity)}</span>
                                        <span className = {'item-price'}
                                              style = {{float: 'right'}}>{item.basePrice}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className = {'home-content-right-bottom-right-btn'}>
                        <div className = {'how-much'}>合计：{totalMoney(getShowConsumerList(deskForDetails))}</div>
                        <div className = {'how-much-discounts'}>
                            <div>折扣：</div>
                            <div>找零：</div>
                        </div>

                        {/* 点菜、结账功能 */}
                        <div className = {'settle-accounts'}>
                            <button
                                style = {{backgroundColor: '#0996ff', borderColor: '#0996ff', color: '#fff'}}
                                onClick = {() => {
                                    if (deskForDetails === null) {
                                        common.message('请先选择需要点菜的台桌', 'error')
                                    } else if (deskForDetails.use === 4) {
                                        common.message('请先清台', 'error')
                                    } else if (deskForDetails.use === 1) {
                                        common.message('请先开台', 'error')
                                    } else {
                                        props.history.push(
                                            '/product?deskId=' + deskForDetails.id
                                            + '&howMany=' + deskForDetails.totalPerson
                                            + '&billId=' + deskForDetails.billId
                                            + '&deskName=' + deskForDetails.name)
                                    }
                                }}>下单
                            </button>
                            <button
                                onClick = {() => {
                                    if (deskForDetails === null) {
                                        common.message('请选择要结账的台桌', 'error')
                                        return
                                    } else if (getShowConsumerList(deskForDetails).length > 0) {
                                        props.setIsModalVisible1(true);
                                        props.setBillId(deskForDetails.billId)
                                    } else {
                                        {
                                            common.message('请选择要结账的台桌', 'error')
                                        }
                                    }
                                }}>结账
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/*开台*/}
            <Modal
                visible = {isModalVisible}
                title = {'订餐人数'}
                footer = {null}
                onCancel = {() => {
                    setIsModalVisible(false)
                    setPeoples('')
                }}
                bodyStyle = {{padding: 0}}
                width = {360}>
                <div className = {'open-desk-top'}>
                    <Space className = {'open-desk-top-title'}>桌台号：
                        <p>{deskForDetails === null ? null : deskForDetails.name}</p></Space>
                    <Space size = {0}>
                        <span>人数</span>
                        <input value = {peoples}
                               onChange = {(e) => setPeoples(e.target.value)}
                               type = "text"/>
                    </Space>
                </div>
                <div className = {'open-desk-middle'}>
                    <div className = {'number'} onClick = {() => count(1)}>1</div>
                    <div className = {'number'} onClick = {() => count(2)}>2</div>
                    <div className = {'number'} onClick = {() => count(3)}>3</div>
                    <div className = {'number'} onClick = {() => count(4)}>4</div>
                    <div className = {'number'} onClick = {() => count(5)}>5</div>
                    <div className = {'number'} onClick = {() => count(6)}>6</div>
                    <div className = {'number'} onClick = {() => count(7)}>7</div>
                    <div className = {'number'} onClick = {() => count(8)}>8</div>
                    <div className = {'number'} onClick = {() => count(9)}>9</div>
                    <div className = {'number'} onClick = {() => count(10)}>清空</div>
                    <div className = {'number'} onClick = {() => count(0)}>0</div>
                    <div className = {'number'} onClick = {() => count(11)}>
                        <ArrowLeftOutlined/>
                    </div>
                </div>
                <div className = {'open-desk-bottom'}>
                    <button onClick = {() => {
                        if (peoples.length === 0) {
                            return
                        } else {
                            common.ajax(
                                'post',
                                '/operation/bill/create',
                                {
                                    plateId: deskForDetails.id,
                                    serviceType: 1,
                                    totalPerson: peoples,
                                })
                            .then(res => {
                                props.history.push('/product?deskId=' + deskForDetails.id + '&howMany=' + peoples + '&deskName=' + deskForDetails.name + '&billId=' + res.id)
                            })
                        }
                    }}>确定
                    </button>
                </div>
            </Modal>

            {/*结账*/}
            <Modal
                width = {850}
                title = {'收银台'}
                style = {{top: 30}}
                footer = {null}
                maskClosable={false}
                bodyStyle = {{
                    backgroundColor: '#e8e9eb',
                    padding: 0,
                    display: 'flex',
                    justifyContent: "space-between"
                }}
                onCancel = {() => {
                    props.setIsModalVisible1(false)
                }}
                visible = {props.isModalVisible1}>
                <CheckOut/>
            </Modal>
        </div>
    );
}

//取值
const mapStateToProps = (state) => {
    return {
        baseData: state.baseData,
        isModalVisible1: state.baseData.isModalVisible1,
        orderNumber: state.baseData.orderNumber,
        deskList: state.baseData.deskList,
        billList: state.baseData.billList,
        consumerList: state.baseData.consumerList,
        orderedDishes: state.baseData.orderedDishes,
    }
}

//传值
const mapDispatchToProps = (dispatch) => {
    return {
        setCategoryList: (categoryList) => {
            dispatch({type: 'CHANGE_CATEGORY', categoryList: categoryList})
        },
        setProductList: (productList) => {
            dispatch({type: 'CHANGE_PRODUCT', productList: productList})
        },
        setTagsData: (tagsList) => {
            dispatch({type: 'CHANGE_TAG', tagsList: tagsList})
        },
        setOrderedDishes: (orderedDishes) => {
            dispatch({type: 'CHANGE_ORDERED', orderedDishes: orderedDishes})
        },
        setIsModalVisible1: (isModalVisible1) => {
            dispatch({type: 'CHANGE_CHECKOUT', isModalVisible1: isModalVisible1})
        },
        setBillId: (billId) => {
            dispatch({type: 'CHANGE_BILL', billId: billId})
        },
        setDeskList: (deskList) => {
            dispatch({type: 'CHANGE_DESK', deskList: deskList})
        },
        setConsumerList: (consumerList) => {
            dispatch({type: 'CHANGE_CONSUMER', consumerList: consumerList})
        },
        setBillList: (billList) => {
            dispatch({type: 'CHANGE_BILLLIST', billList: billList})
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
//如果只需要取值或者传值的时候可以删除另一个方法
//connect(null, mapDispatchToProps)或者connect(mapStateToProps, null)
