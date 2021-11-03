import React, {useEffect, useState} from 'react';
import Menu from "../../../components/menu";
import './index.less'
import {
    CarryOutOutlined,
    CrownOutlined,
    MinusCircleOutlined,
    PlusCircleOutlined,
    RollbackOutlined,
    TagOutlined
} from "@ant-design/icons";
import {Divider, Modal, Tag} from "antd";
import {connect} from "react-redux";
import common from "../../../common";


function Product(props) {
    const {CheckableTag} = Tag;

    //url中获取参数==================================================================
    const searchParams = new URLSearchParams(props.location.search.substring(1))
    //当前桌子名称
    let deskName = searchParams.get("deskName")
    //当前桌子人数
    let howMany = searchParams.get("howMany")
    // 账单id
    let billId = searchParams.get("billId")

    //新下单菜品列表==================================================================
    const [product, setProduct] = useState([])
    //选中分类效果
    const [categorySelect, setCategorySelect] = useState(0)
    //点击获取到的菜品详情
    const [productDetails, setProductDetails] = useState({})
    //菜品下单数量
    let [productNum, setProductNum] = useState(1)

    //点菜呼出页面
    const [isModalVisible1, setIsModalVisible1] = useState(false)

    //呼出菜品删除页面
    const [isModalVisible2, setIsModalVisible2] = useState(false)

    //要删除的菜品
    const [deleteProduct, setDeleteProduct] = useState(null)

    //选中加工方式===================================================================
    const [selectedTags, setSelectedTags] = useState([])

    //加工方式的标签选择
    function handleChange(tag, checked) {
        const nextSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter(t => t !== tag);
        console.log('选择加工方式: ', nextSelectedTags);
        setSelectedTags(nextSelectedTags);
    }

    // 数量处理函数
    function format(num) {
        if (typeof num === "number" && num.toString().includes(".") === false) {
            return num
        } else if (typeof num === "string" && num.includes(".") === true) {
            return Number(num.split('.')[0])
        }
    }

    // 将菜品数据进行重新重组
    function productRegroup(categoryId) {

        if (categoryId === 0) {
            return props.productList
        }

        let arr = {}
        for (let i = 0; i < props.productList.length; i++) {
            let categoryId = props.productList[i].categoryId
            if (!(categoryId in arr)) {
                arr[categoryId] = []
            }
            arr[categoryId].push(props.productList[i])
        }

        if (categoryId in arr) {
            return arr[categoryId]
        } else {
            return []
        }
    }

    // 进行点菜下单
    function placeAnOrder(arr) {
        common.loadingStart()

        let newArray = []
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].billId === undefined) {
                newArray.push(arr[i]);
            }
        }

        common.ajax(
            'post',
            '/operation/consume/create',
            {
                billId: Number(billId),
                consumeCreateList: newArray,
            },
            {'contentType': 'application/json',}
        )
        .then(() => {
            props.history.push('/')
        })
        .finally(common.loadingStop)
    }

    useEffect(() => {
        setProduct(props.orderedDishes)
    }, [])

    function totalMoney(arr) {

        if (arr.length <= 0) {
            return 0
        }

        let total = 0
        arr.map((item) => total += (format(item.quantity) * item.basePrice))

        return total
    }

    return (
        <div className = {'product'}>
            <Menu num = {1}/>
            <div className = {'product-content'}>
                <div className = {'product-content-left'}>

                    {/* 菜品分类项 */}
                    <div className = {'product-content-left-top'}>
                        <div
                            className = {'product-content-left-top-item'}
                            onClick = {() => props.history.push('/')}
                            style = {{float: 'right', margin: 0}}>
                            <RollbackOutlined/>
                        </div>

                        <div onClick = {() => setCategorySelect(0)}
                             className = {categorySelect === 0
                                 ? 'product-content-left-top-item option'
                                 : 'product-content-left-top-item'}>全部
                        </div>
                        {props.categoryList.map((item) => {
                            return <div
                                key = {item.id}
                                onClick = {() => setCategorySelect(item.id)}
                                className = {
                                    categorySelect === item.id
                                        ? 'product-content-left-top-item option'
                                        : 'product-content-left-top-item'}>
                                {item.name}
                            </div>
                        })}
                    </div>

                    {/* 菜单，可分类 */}
                    <div className = {'product-content-left-middle'}>
                        {
                            productRegroup(categorySelect).map((item) => {
                                return (
                                    <div key = {item.id}
                                        // style = {{backgroundImage: `url("${item.cover}")`}}
                                         onClick = {() => {
                                             setProductDetails({
                                                 id: item.id,
                                                 price: item.price,
                                                 name: item.name,
                                                 cover: item.cover,
                                                 categoryName: item.categoryName,
                                             })
                                             setIsModalVisible1(true)
                                         }}>
                                        {item.name}
                                        <br/>
                                        ￥{item.price}
                                    </div>
                                )
                            })
                        }
                    </div>

                    {/* 脚部功能 */}
                    <div className = {'product-content-left-bottom'}>
                        <div>
                            <TagOutlined/>
                            <span>折扣/抹零</span>
                        </div>
                        <div>
                            <CarryOutOutlined/>
                            <span>整单清空</span>
                        </div>
                        <div>
                            <CarryOutOutlined/>
                            <span>整单清空</span>
                        </div>
                        <div>
                            <CarryOutOutlined/>
                            <span>整单清空</span>
                        </div>
                        <div>
                            <CrownOutlined/>
                            <span>会 员</span>
                        </div>
                    </div>
                </div>

                <div className = {'product-content-right'}>
                    <div className = {'product-content-right-top'}>
                        <div className = {'product-content-right-top-one'}>桌台：{deskName}</div>
                        <div>
                            <div className = {'product-content-right-top-two'}>人数：{howMany} 人</div>
                            <div className = {'product-content-right-top-two'}>备注：{}</div>
                        </div>
                    </div>

                    <div className = {'product-content-right-bottom-left'}>
                        {/*  这里放左侧功能按键  */}
                        {/*  需要的时候进行添加  */}
                    </div>

                    <div className = {'product-content-right-bottom-right'}>
                        {/* 表头 */}
                        <div className = {'product-content-right-bottom-right-item'}>
                            <span className = {'item-name'}>商品名称</span>
                            <span className = {'item-quantity'}>数量</span>
                            <span className = {'item-price'}>价格（元）</span>
                        </div>
                        <div className = {'product-content-right-bottom-right-list'}>

                            {/* 如果订单上已经有菜品就显示订单上的菜品，加菜列表显示在下边的列表中；如果订单上没有菜品显示加菜的菜品列表 */}
                            {product.map((item, index) => {
                                return (
                                    <div className = {item.billId === undefined
                                        ? 'product-content-right-bottom-right-item bottom-right-item color'
                                        : 'product-content-right-bottom-right-item bottom-right-item'}
                                         key = {index}
                                         style = {{border: 'none', color: '#000'}}>
                                        <span className = {'item-name'}
                                              style = {{overflow: 'hidden'}}>
                                            {item.productName.length > 4 ? item.productName.slice(0, 4) + '...' : item.productName}
                                        </span>
                                        <span className = {'item-quantity'}>
                                            <span>
                                                <MinusCircleOutlined
                                                    style = {{fontSize: 20, color: 'rgb(232, 233, 235)'}}
                                                    onClick = {() => {
                                                        let array = [];
                                                        for (let i = 0; i < product.length; i++) {
                                                            if (product[i].productId === item.productId) {
                                                                if (format(item.quantity) <= 1) {
                                                                    if (item.billId === undefined) {
                                                                        console.log(item)
                                                                        setDeleteProduct(item)
                                                                        setIsModalVisible2(true)
                                                                        return;
                                                                    } else {
                                                                        return;
                                                                    }
                                                                }
                                                                product[i].quantity = format(product[i].quantity) - 1
                                                            }
                                                            array.push(product[i])
                                                        }
                                                        setProduct([...array])
                                                    }}/>
                                            </span>
                                            <span style = {{
                                                display: 'inline-block',
                                                width: '25px',
                                                cursor: 'auto',
                                                fontSize: '16px'
                                            }}>
                                                {format(item.quantity)}
                                            </span>
                                            <span>
                                                <PlusCircleOutlined
                                                    style = {{fontSize: 20, color: 'rgb(248, 133, 16)'}}
                                                    onClick = {() => {
                                                        let array = [];
                                                        for (let i = 0; i < product.length; i++) {
                                                            if (product[i].productName === item.productName) {
                                                                product[i].quantity = format(product[i].quantity) + 1
                                                            }
                                                            array.push(product[i])
                                                        }
                                                        setProduct([...array])
                                                    }}/>
                                            </span>
                                        </span>
                                        <span className = {'item-price'}>
                                            {item.basePrice}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* 下单、结账按钮 */}
                        <div className = {'product-content-right-bottom-right-btn'}>
                            <div className = {'how-much'}>合计:{totalMoney(product)}</div>
                            <div className = {'how-much-discounts'}>
                                <div>折扣:</div>
                                <div>找零:</div>
                            </div>
                            <div className = {'settle-accounts'}>
                                {/* 下单只下新加的菜品，已有菜品通过加减号进行更新下单。 */}
                                <button
                                    style = {{backgroundColor: '#0996ff', borderColor: '#0996ff', color: '#fff'}}
                                    onClick = {() => {
                                        placeAnOrder(product)
                                    }}>
                                    下单
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal title = {'点菜'}
                   footer = {null}
                   width = {480}
                   visible = {isModalVisible1}
                   onCancel = {() => {
                       setIsModalVisible1(false)
                       setProductNum(1)
                       setSelectedTags([])
                   }}>
                <div className = {'order-dishes'}>
                    <Divider orientation = "left">{productDetails.categoryName}</Divider>
                    <div className = {'order-dishes-div'}>
                        <div className = {'order-dishes-block product-name'}
                             style = {{flex: 1, textAlign: 'start'}}>
                            {productDetails.name}
                        </div>
                        <div>
                            <span className = {'order-dishes-block product-name'}>
                                ￥{productDetails.price}
                            </span>
                            <span className = {'order-dishes-div-num'}>
                                <MinusCircleOutlined
                                    style = {{fontSize: 20, cursor: 'pointer', color: '#e8e9eb'}}
                                    onClick = {() => {
                                        if (productNum <= 1) {
                                            return
                                        } else {
                                            setProductNum(productNum - 1)
                                        }
                                    }}/>
                                <span className = {'order-dishes-block'} style = {{width: '50px'}}>
                                    {productNum}
                                </span>
                                <PlusCircleOutlined
                                    style = {{fontSize: 20, cursor: 'pointer', color: '#f88510'}}
                                    onClick = {() => {
                                        setProductNum(productNum + 1)
                                    }}/>
                            </span>
                        </div>
                    </div>

                    <Divider>订单备注</Divider>

                    <div className = {'order-dishes-div'}>
                        <span className = {'methods'}>
                            {props.tagsList.map(item => (
                                <CheckableTag
                                    key = {item.id}
                                    checked = {selectedTags.indexOf(item.id) > -1}
                                    onChange = {checked => handleChange(item.id, checked)}>
                                    {item.name.length > 3 ? item.name.slice(0, 3) + '...' : item.name}
                                </CheckableTag>
                            ))}
                        </span>
                    </div>
                    <button
                        type = "submit"
                        className = {'btn-form'}
                        onClick = {() => {
                            let arr = [];
                            let obj = {
                                productId: productDetails.id,
                                productName: productDetails.name,
                                quantity: productNum,
                                basePrice: productDetails.price,
                                craftIdList: selectedTags,
                                remark: ''
                            }
                            for (let i = 0; i < product.length; i++) {
                                if (product[i].billId === undefined && product[i].productId === productDetails.id) {
                                    common.message('菜品已添加,请在右侧修改数量', "info")
                                    return setIsModalVisible1(false)
                                }
                            }
                            arr.push(obj)
                            setProduct([...product, ...arr])
                            setIsModalVisible1(false)
                            setProductNum(1)
                            setSelectedTags([])
                        }}>点菜
                    </button>
                </div>
            </Modal>

            <Modal
                width = {250}
                onCancel = {() => setIsModalVisible2(false)}
                onOk = {() => {
                    let arr = []

                    product.find((x, index) => {
                        if (x.productId === deleteProduct.productId && x.billId === undefined) {
                            arr = product.splice(0, index)
                        }
                    })

                    setProduct([...arr])
                    setIsModalVisible2(false)
                }}
                visible = {isModalVisible2}>
                <p>确定要删除吗？</p>
            </Modal>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        productList: state.baseData.productList,
        categoryList: state.baseData.categoryList,
        tagsList: state.baseData.tagsList,
        orderedDishes: state.baseData.orderedDishes,
    }
}

export default connect(mapStateToProps, null)(Product)
