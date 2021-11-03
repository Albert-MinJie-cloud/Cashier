import React, { useEffect, useState } from 'react';
import {
    Button,
    Form,
    Input,
    Select,
    Col,
    Row,
    InputNumber,
    DatePicker,
    Checkbox,
} from 'antd';
import common from "../../../common";
import moment from 'moment';
import Menu from "../../../components/menu";

function Plan(props) {

    const { RangePicker } = DatePicker;
    const [createForm] = Form.useForm()
    const { Option } = Select;
    const typeData = ['通用方案', '会员卡专用方案'];

    let [type, setType] = useState(typeData[0])
    let [productList, setProductList] = useState([])
    let [name, setName] = useState("")

    let emptyData = { productId: "", paramIn: "", paramOut: "" };
    let [planItemList, setPlanItemList] = useState([emptyData])

    useEffect(() => {
        let data = {
            name: name
        }
        getProductList(data)
    }, [name])

    function getProductList(data) {
        common.ajax('get', '/manage/product/list', data).then((res) => {
            setProductList(res.list)
        })
    }

    function onSearch(val) {
        setName(val)
    }


    //新增
    let onFinish = (values) => {

        for (let i = 0; i < planItemList.length; i++) {
            if (planItemList[i].productId === "" || planItemList[i].paramIn === "" || planItemList[i].paramOut === "") {
                common.alert("存在不完整的价格方案明细，请检查价格方案明细列表")
                return
            }
        }

        //验证productId是否重复
        let productIds = []
        for (let i = 0; i < planItemList.length; i++) {
            productIds.push(planItemList[i].productId)
        }
        let unique = [...new Set(productIds)]
        if (unique.length !== planItemList.length) {
            common.alert("价格方案明细中有重复的商品")
            return;
        }

        //拆分堂食和外卖的数据
        var dine = ''
        var takeout = ''
        let itemdata = {}
        var newPlanItemList = []
        for (let i = 0; i < planItemList.length; i++) {
            dine = planItemList[i].paramIn
            if (dine.endsWith('%')) {
                itemdata = {
                    serviceType: 1,
                    productId: planItemList[i].productId,
                    type: 2,
                    price: 0,
                    percentage: dine.slice(0, -1)
                }
                newPlanItemList.push(itemdata)
            } else {
                itemdata = { serviceType: 1, productId: planItemList[i].productId, type: 1, price: dine, percentage: 100 }
                newPlanItemList.push(itemdata)
            }


            takeout = planItemList[i].paramOut
            if (takeout.endsWith('%')) {
                itemdata = {
                    serviceType: 2,
                    productId: planItemList[i].productId,
                    type: 2,
                    price: 0,
                    percentage: takeout.slice(0, -1)
                }
                newPlanItemList.push(itemdata)
            } else {
                itemdata = {
                    serviceType: 2,
                    productId: planItemList[i].productId,
                    type: 1,
                    price: takeout,
                    percentage: 100
                }
                newPlanItemList.push(itemdata)
            }


        }


        let data = {
            name: values.name,
            sort: values.sort,
            type: type === '通用方案' ? 1 : 2,
            beginTimestamp: moment(values.timesTamp[0]).format("YYYY-MM-DD"),
            endTimestamp: moment(values.timesTamp[1]).format("YYYY-MM-DD"),
            availableTime: values.availableTime,
            week: values.week.join(","),
            days: values.days,
            remark: values.remark,
            planItemList: newPlanItemList
        }

        common.ajax("post", "/manage/plan/create", JSON.stringify(data), { contentType: 'application/json' })
            .then(res => {
                alert("价格方案新增成功")
                createForm.resetFields()
                props.history.push("/manage/plan")
            }).catch(err => {
                common.toast(err.message)
            })
    };

    const handleTypeChange = value => {
        setType(typeData[value]);
    };

    const options = [
        { label: '周一', value: '1' },
        { label: '周二', value: '2' },
        { label: '周三', value: '3' },
        { label: '周四', value: '4' },
        { label: '周五', value: '5' },
        { label: '周六', value: '6' },
        { label: '周日', value: '7' },
    ];

    return (
        <div className={'Plan'}>
            <Menu num={6} />
            <Form
                name="createPlan"
                form={createForm}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 15 }}
                initialValues={{ name: "", days: "", week: [], availableTime: "", remark: "" }}
                onFinish={onFinish}
            >
                <Form.Item></Form.Item>
                <Form.Item
                    label="方案名称"
                    name="name"
                    rules={[{ required: true, message: '请输入价格计划名称!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="排序"
                    name="sort"
                    rules={[{ required: true, message: '请输入价格计划排序!' }]}
                >
                    <InputNumber
                        style={{
                            width: 200,
                        }}
                        min="1"
                        max="1000"
                        stringMode
                        step={1}
                        placeholder="请输入价格计划排序" />
                </Form.Item>

                <Form.Item
                    label="类型"
                    name="type"
                >
                    <Select style={{ width: 150 }} onChange={handleTypeChange}>
                        {typeData.map(type => (
                            <Option key={type} value={type}>{type}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="方案有效时间"
                    name="timesTamp"
                    rules={[{ required: true, message: '请输入方案有效起始时间!' }]}
                >
                    <RangePicker />
                </Form.Item>

                <Form.Item
                    label="每个月有效的日期"
                    extra="每个月有效的日期，多个日期请用英文逗号隔开，当为空的时候，表示每天都有效；例如：每月的5号、10号、15号为会员日，则为5,10,15"
                    name="days"
                    rules={[{ message: '请输入每个月有效的日期!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="星期"
                    name="week"
                    rules={[{ required: true, message: '请选择星期！' }]}
                >
                    <Checkbox.Group options={options} />
                </Form.Item>

                <Form.Item
                    label="每天有效时间段"
                    name="availableTime"
                    extra="每天有效时间段，多个时间段请用英文逗号隔开，当为空的时候，表示全天都有效；例如：8:00-9:00,14:05-15:00，表示每天8:00到9:00,14:05到15:00有效"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="备注"
                    name="remark"
                >
                    <Input />
                </Form.Item>

                {planItemList.map((item, index) => {
                    return (
                        <Form.Item
                            key={index}
                            label="价格方案明细"
                        >

                            <Input.Group>
                                <Row gutter={8}>
                                    <Col span={5}>
                                        <Select
                                            showSearch
                                            style={{ width: 150 }}
                                            allowClear={true}
                                            onChange={(value) => {
                                                for (let i = 0; i < planItemList.length; i++) {
                                                    if (index === i) {
                                                        planItemList[i].productId = value
                                                    }
                                                }
                                                setPlanItemList([...planItemList])
                                            }}
                                            onSearch={onSearch}
                                            filterOption={false}
                                        >
                                            {productList.map((product) => (
                                                <Option key={product.id} value={product.id}>{product.name}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                    <Col span={7}>
                                        <Input placeholder="堂食价格或者折扣百分比" value={item.paramIn} onChange={(e) => {
                                            for (let i = 0; i < planItemList.length; i++) {
                                                if (index === i) {
                                                    planItemList[i].paramIn = e.target.value
                                                }
                                            }
                                            setPlanItemList([...planItemList])
                                        }} />
                                    </Col>
                                    <Col span={7}>
                                        <Input placeholder="外带价格或者折扣百分比" value={item.paramOut} onChange={(e) => {
                                            for (let i = 0; i < planItemList.length; i++) {
                                                if (index === i) {
                                                    planItemList[i].paramOut = e.target.value
                                                }
                                            }
                                            setPlanItemList([...planItemList])
                                        }} />
                                    </Col>
                                    <Col>
                                        {planItemList.indexOf(item) === planItemList.length - 1 ?
                                            <span>
                                                <Button onClick={() => {
                                                    let str1 = planItemList[planItemList.length - 1].productId
                                                    let str2 = planItemList[planItemList.length - 1].paramIn
                                                    let str3 = planItemList[planItemList.length - 1].paramOut
                                                    //当数据完整时才可以更新
                                                    if (str1 !== "" && str2.replace(/\s*/g, "") !== "" && str3.replace(/\s*/g, "") !== "") {
                                                        let data = {
                                                            productId: '',
                                                            paramIn: '',
                                                            paramOut: ''
                                                        }
                                                        planItemList.push(data)
                                                        setPlanItemList([...planItemList])
                                                    }
                                                }}>+</Button>
                                                {planItemList.length > 1 ?
                                                    <Button
                                                        style={{ marginLeft: 10 }}
                                                        onClick={() => {
                                                            let newArr = []
                                                            for (let i = 0; i < planItemList.length; i++) {
                                                                if (index !== i) {
                                                                    newArr.push(planItemList[i])
                                                                }
                                                            }
                                                            planItemList = newArr
                                                            setPlanItemList([...planItemList])
                                                        }}>-</Button>
                                                    :
                                                    null
                                                }
                                            </span>
                                            :
                                            null
                                        }
                                    </Col>
                                </Row>
                            </Input.Group>

                        </Form.Item>
                    )
                })}

                <Form.Item label="示例">
                    <Input.Group>
                        <Row gutter={8}>
                            <Col span={5}>
                                <Input defaultValue="糖醋排骨" disabled={true} />
                            </Col>
                            <Col span={7}>
                                <Input defaultValue="19.9" disabled={true} />
                            </Col>
                            <Col span={7}>
                                <Input defaultValue="80%" disabled={true} />
                            </Col>
                        </Row>
                    </Input.Group>
                </Form.Item>

                <Form.Item
                    wrapperCol={{
                        offset: 6,
                        span: 15,
                    }}
                >
                    <Button type="primary" htmlType="submit">
                        确认新增
                    </Button>
                </Form.Item>

            </Form>

        </div>
    );
}

export default Plan;