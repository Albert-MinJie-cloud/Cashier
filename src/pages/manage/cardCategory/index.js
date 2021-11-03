import React, { useEffect, useState } from 'react';
import {
    PageHeader,
    Button,
    Switch,
    Form,
    Modal,
    Input,
    InputNumber,
    Select,
    Space,
    Table,
    Popconfirm
} from 'antd';
import common from "../../../common";
import Menu from "../../../components/menu";

function CardCategory() {

    const { Option } = Select;
    const [isCreateVisible, setIsCreateVisible] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false)
    const [createCardCategoryForm] = Form.useForm()
    const [CardCategoryDetailForm] = Form.useForm()

    const [cardCategory, setCardCategory] = useState([]) //卡类列表
    const [planList, setPlanList] = useState([]) //价格方案列表
    const [planName, setPlanName] = useState('') //价格方案名称

    const discountTypeData = [{ id: 1, name: '消费不打折' }, { id: 2, name: '整单打折' }, { id: 3, name: '关联折扣方案打折' }];
    const validTypeData = [{ id: 1, name: '长期有效' }, { id: 2, name: '固定时长' }];

    const [discountType, setDiscountType] = useState(0) //折扣类型
    const [validType, setValidType] = useState(0) //有效期类型

    useEffect(() => {
        init()
    }, [])

    useEffect(() => {
        let data = {
            planName: planName
        }
        getPlanList(data)
    }, [planName])

    //价格方案列表
    let getPlanList = (data) => {
        common.ajax("get", "/manage/plan/list", data)
            .then(res => {
                setPlanList([...res.list])
            })
            .catch((err) => {
                common.alert(err.message)
            })
    }

    //卡类列表
    let init = () => {
        common.ajax("get", "/member/cardCategory/list", { status: 0 })
            .then(res => {
                setCardCategory(res)
            })
            .catch((err) => {
                common.toast(err.message)
            })
    }

    //新增
    let onFinish = (values) => {
        if (values.discountType === 2 && values.discount === undefined) {
            common.alert("请输入消费折扣比例")
            return
        }
        if (values.discountType === 3 && values.planId === undefined) {
            common.alert("请输入关联折扣方案Id")
            return
        }
        if (values.validType === 2 && values.durationDay === undefined) {
            common.alert("请输入自领取后多少天内有效")
            return
        }
        if (values.validType === 2 && values.durationDay > 8000) {
            common.alert("领取后有效期天数最多不超过8000")
            return
        }

        const data = {
            name: values.name,
            discountType: values.discountType,
            discount: values.discountType === 2 ? values.discount : 100,
            planId: values.discountType === 3 ? values.planId : 0,
            validType: values.validType,
            intervalDay: values.intervalDay,
            durationDay: values.validType === 2 ? values.durationDay : 8000,
            pointPercentage: values.pointPercentage,
            remark: values.remark === undefined ? "" : values.remark,
            sort: values.sort === undefined ? 0 : values.sort
        }

        common.ajax("post", "/member/cardCategory/create", data)
            .then(res => {
                alert("卡类新增成功！")
                createCardCategoryForm.resetFields()
                setIsCreateVisible(false)
                init()
            })
            .catch(err => {
                common.alert(err)
            })
    };

    //详情
    let getDetail = (id) => {
        common.ajax('post', '/member/cardCategory/detail', { id: id })
            .then(res => {
                CardCategoryDetailForm.setFieldsValue({
                    name: res.cardCategory.name,
                    discountType: getDiscountType(res.cardCategory.discountType),
                    discount: res.cardCategory.discountType === 2 ? res.cardCategory.discount : '当前卡类不生效',
                    planName: res.cardCategory.discountType === 3 ? res.planName : '当前卡类不生效',
                    validType: res.cardCategory.validType === 2 ? '固定时长' : '长期有效',
                    intervalDay: res.cardCategory.intervalDay,
                    durationDay: res.cardCategory.validType === 2 ? res.cardCategory.durationDay : '长期有效',
                    pointPercentage: res.cardCategory.pointPercentage,
                    remark: res.cardCategory.remark === '' ? '无' : res.cardCategory.remark,
                    sort: res.cardCategory.sort

                })
            })
            .catch(err => {
                common.alert(err)
            })
    }

    //启用、禁用
    let handleStatusChange = (status, id) => {

        const data = {
            "id": id,
        }

        if (status === 1) {
            common.ajax("post", "/member/cardCategory/disable", data)
                .then(res => {
                    init()
                })
                .catch(err => {
                    common.toast(err.message)
                })
        }
        if (status === 2) {
            common.ajax("post", "/member/cardCategory/enable", data)
                .then(res => {
                    init()
                })
                .catch(err => {
                    common.toast(err.message)
                })
        }
    };

    //删除
    let deleteCardCategory = (id) => {
        common.ajax("post", "/member/cardCategory/delete", { id: id })
            .then(res => {
                alert("删除成功")
                init()
            })
            .catch(err => {
                common.toast(err.message)
            })
    }

    const paginationProps = {
        showSizeChanger: true,//设置每页显示数据条数
        pageSizeOptions: [5, 15, 30],
        showQuickJumper: true,
        showTotal: (total) => `共${total}条`,
    }

    let getDiscountType = (discountType) => {
        switch (discountType) {
            case 1:
                return '消费不打折';
            case 2:
                return '整单打折';
            case 3:
                return '关联折扣方案打折';
        }
    }

    const columns = [
        {
            title: '卡类名称',
            dataIndex: 'name',
            key: 'name',
            align: 'center'
        },
        {
            title: '折扣类型',
            dataIndex: 'discountType',
            key: 'discountType',
            align: 'center',
            render: (discountType) => getDiscountType(discountType)
        },
        {
            title: '有效期类型',
            dataIndex: 'validType',
            key: 'validType',
            align: 'center',
            render: (validType) => validType === 1 ? "长期有效" : "固定时长"
        },
        {
            title: '状态',
            key: 'status',
            dataIndex: 'status',
            align: 'center',
            render: (text, record, index) =>
                <Switch checked={record.status === 1}
                    checkedChildren="启用"
                    unCheckedChildren="禁用"
                    onChange={() => {
                        handleStatusChange(record.status, record.id)
                    }} />
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            render: (text, record) => (
                <Space size="middle">
                    <a onClick={() => {
                        getDetail(record.id)
                        setIsDetailVisible(true)
                    }}>详情</a>
                    <Popconfirm
                        title="确认删除该卡类吗?"
                        onConfirm={() => {
                            deleteCardCategory(record.id)
                        }}
                        onCancel={() => {

                        }}
                        okText="Yes"
                        cancelText="No"
                    >
                        <a href="">删除</a>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleCancel = () => {
        setIsCreateVisible(false);
        createCardCategoryForm.resetFields()
        setDiscountType(0)
        setValidType(0)
    };

    const cancelDetail = () => {
        setIsDetailVisible(false);
        CardCategoryDetailForm.resetFields()
    };

    return (
        <div>
            <Menu num={15} />
            <div className={'Plan'} style={{ marginLeft: 60 }}>
                {/* 页头 */}
                <div className="site-page-header-ghost-wrapper">
                    <PageHeader
                        ghost={false}
                        title="卡类"
                        extra={[
                            <Button key={"plan"} type="primary"
                                onClick={() => {
                                    setIsCreateVisible(true)
                                }}>
                                新增
                            </Button>,
                        ]}
                    >
                    </PageHeader>
                </div>

                {/* 表格 */}
                <Table rowKey={"id"} dataSource={cardCategory} columns={columns} pagination={false} />

                {/* 新增 */}
                <Modal title="新增卡类"
                    visible={isCreateVisible}
                    footer={null}
                    onCancel={handleCancel}
                    width={800}
                    maskClosable={false}
                >

                    <Form
                        name="createCardCategory"
                        form={createCardCategoryForm}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 16 }}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            label="卡类名称"
                            name="name"
                            rules={[{ required: true, message: '请输入卡类名称!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="折扣类型"
                            name="discountType"
                            rules={[{ required: true, message: '请选择折扣类型!' }]}
                        >
                            <Select
                                style={{ width: 200 }}
                                onChange={(value) => {
                                    setDiscountType(value)
                                }}
                            >
                                {discountTypeData.map((item) => (
                                    <Option key={item.id} value={item.id}>{item.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {discountType === 2 ?
                            <Form.Item
                                label="消费折扣比例"
                                name="discount"
                            >
                                <Input placeholder="请输入整单打折的折扣比例 有效值为1~100之间 90表示打9折" />
                            </Form.Item>
                            :
                            null
                        }

                        {discountType === 3 ?
                            <Form.Item
                                label="折扣方案"
                                name="planId"
                            >
                                <Select
                                    showSearch
                                    onSearch={(value) => {
                                        setPlanName(value)
                                    }}
                                    style={{ width: 200 }}
                                    filterOption={false}
                                >
                                    {planList.map((item) => {
                                        return (<Option key={item.id} value={item.id}>{item.name}</Option>)
                                    }

                                    )}
                                </Select>
                            </Form.Item>
                            :
                            null
                        }

                        <Form.Item
                            label="有效期类型"
                            name="validType"
                            rules={[{ required: true, message: '请选择有效期类型!' }]}
                        >
                            <Select
                                style={{ width: 200 }}
                                onChange={(value) => {
                                    setValidType(value)
                                }}
                            >
                                {validTypeData.map(item => (
                                    <Option key={item.id} value={item.id}>{item.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="领取后多少天开始生效"
                            name="intervalDay"
                            rules={[{ required: true, message: '请输入领取后多少天开始生效!' }]}
                        >
                            <Input placeholder='请输入领取后多少天开始生效' />
                        </Form.Item>

                        {validType === 2
                            ?
                            <Form.Item
                                label="自领取后多少天内有效"
                                name="durationDay"
                            >
                                <Input placeholder="请输入自领取后多少天内有效" />
                            </Form.Item>
                            :
                            null
                        }

                        <Form.Item
                            label="积分比例"
                            name="pointPercentage"
                            width={100}
                            rules={[{ required: true, message: '请输入积分比例!' }]}
                        >
                            <InputNumber
                                style={{
                                    width: 200,
                                }}
                                min="1"
                                max="100"
                                stringMode
                                step={1}
                                placeholder="表示每消费100元积多少分" />
                        </Form.Item>

                        <Form.Item
                            label="备注"
                            name="remark"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="排序"
                            name="sort"
                            initialValue={100}
                        >
                            <InputNumber
                                min="1"
                                max="100"
                                stringMode
                                step={1} />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 11, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                确认新增
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* 详情 */}
                <Modal title="卡类详情"
                    visible={isDetailVisible}
                    footer={null}
                    onCancel={cancelDetail}
                    width={800}
                    maskClosable={false}
                >

                    <Form
                        name="CardCategoryDetail"
                        form={CardCategoryDetailForm}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 16 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            label="卡类名称"
                            name="name"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="折扣类型"
                            name="discountType"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="消费折扣比例"
                            name="discount"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="折扣方案"
                            name="planName"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="有效期类型"
                            name="validType"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="领取后多少天开始生效"
                            name="intervalDay"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="自领取后多少天内有效"
                            name="durationDay"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="积分比例"
                            name="pointPercentage"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="备注"
                            name="remark"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="排序"
                            name="sort"
                        >
                            <Input />
                        </Form.Item>
                    </Form>
                </Modal>

            </div>
        </div>

    );
}


export default CardCategory;