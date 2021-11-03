import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Table,
    DatePicker,
    Checkbox,
} from 'antd';
import common from "../../../common";
import moment from 'moment';
import Menu from "../../../components/menu";

function Detail(props) {

    const { RangePicker } = DatePicker;
    const dateFormat = 'YYYY-MM-DD';
    const [detailForm] = Form.useForm()

    let [planItemList, setPlanItemList] = useState([])

    useEffect(() => {
        getDetail()
    }, [])

    let getDetail = () => {
        common.ajax("get", "/manage/plan/detail", { id: props.match.params.id })
            .then(res => {
                detailForm.setFieldsValue({
                    name: res.plan.name,
                    type: res.plan.type === 1 ? '通用方案' : '会员卡专用方案',
                    Timestamp: [moment(res.plan.beginTimestamp, dateFormat), moment(res.plan.endTimestamp, dateFormat)],
                    availableTime: res.plan.availableTime,
                    week: res.plan.week.split(''),
                    days: res.plan.days,
                    remark: res.plan.remark
                })

                let arr = []
                for (let i = 0; i < res.productIdList.length; i++) {
                    let planItem = {
                        id: res.productIdList[i],
                        productName: res.keySet[res.productIdList[i]],
                        paramIn: res.planItemMap[res.productIdList[i]][1],
                        paramOut: res.planItemMap[res.productIdList[i]][2]
                    };
                    arr.push(planItem)
                }
                setPlanItemList([...arr])


            })
            .catch(err => {
                common.toast(err.message)
            })
    }

    const options = [
        { label: '周一', value: '1' },
        { label: '周二', value: '2' },
        { label: '周三', value: '3' },
        { label: '周四', value: '4' },
        { label: '周五', value: '5' },
        { label: '周六', value: '6' },
        { label: '周日', value: '7' },
    ];

    const columns = [
        {
            title: '商品名称',
            dataIndex: 'productName',
            key: 'productName',
            align: 'center'
        },
        {
            title: '堂食价格或折扣百分比',
            dataIndex: 'paramIn',
            key: 'paramIn',
            align: 'center'
        },
        {
            title: '外卖价格或折扣百分比',
            dataIndex: 'paramOut',
            key: 'paramOut',
            align: 'center'
        },

    ];

    return (
        <div className={'Plan'}>
            <Menu num={6} />
            <Form
                name="价格方案详情"
                form={detailForm}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 15 }}
            >
                <Form.Item></Form.Item>

                <Form.Item
                    label="方案名称"
                    name="name"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="类型"
                    name="type"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="方案有效时间"
                    name="Timestamp"
                >
                    <RangePicker />
                </Form.Item>

                <Form.Item
                    label="每个月有效的日期"
                    extra="每个月有效的日期，多个日期请用英文逗号隔开，当为空的时候，表示每天都有效；例如：每月的5号、10号、15号为会员日，则为5,10,15"
                    name="days"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="星期"
                    name="week"
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

                <Form.Item label="价格计划明细">
                    < Table columns={columns} dataSource={planItemList} rowKey={record => record.id} pagination={false} />
                </Form.Item>

            </Form>

        </div>
    );
}

export default Detail;