import React, {useEffect, useState} from 'react';
import {Table, Space, Switch, InputNumber, Select} from 'antd';
import {PageHeader, Modal, Button, Form, Input} from 'antd';
import common from "../../../common";
import Menu from "../../../components/menu";


function PaymentChannel() {

    const [createForm] = Form.useForm()
    const [updateForm] = Form.useForm()
    const [paymentChannelList, setPaymentChannelList] = useState([])
    const [isCreateModelShow, setIsCreateModelShow] = useState(false)
    const [isUpdateModelShow, setIsUpdateModelShow] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [total] = useState(0)
    const [reLoad, setReLoad] = useState(false)
    let [codeList, setCodeList] = useState([])
    let [paymentChannel, setPaymentChannel] = useState({})

    // 获取支付渠道列表
    useEffect(() => {

        common.ajax("get", "/manage/paymentChannel/list").then(res => {
            setPaymentChannelList(res)
        })

    }, [reLoad])
    // 获取类型列表
    useEffect(() => {
        const data = {
            page: 1,
            limit: 100,
            status: 1
        }
        common.ajax("get", "/manage/paymentChannel/codeList", data).then(res => {
            setCodeList(res)
        })
    }, [])

    // 支付渠道新增
    const createPaymentChannel = (data) => {
        common.ajax('post', '/manage/paymentChannel/create', data).then(() => {
            setReLoad(!reLoad)
            createForm.resetFields()
        }).finally(_ => {
            setIsCreateModelShow(false)
        })
    }
    // 支付渠道更新
    const updatePaymentChannel = (data) => {
        common.ajax('post', '/manage/paymentChannel/update', data).then(() => {
            setReLoad(!reLoad)
        }).finally(_ => {
            setIsUpdateModelShow(false)
        })
    }
    // 表单提交事件
    const onFinish = (type) => {
        return values => {
            let data;
            switch (type) {
                case "create":
                    data = {
                        name: values.name,
                        code: values.code,
                        sort: values.sort || 100
                    }
                    createPaymentChannel(data)
                    break
                case "update":
                    data = {
                        id: paymentChannel.id,
                        name: values.name,
                        code: values.code,
                        sort: values.sort || paymentChannel.sort
                    }
                    updatePaymentChannel(data)
                    break
                default:
            }

        }
    };
    // 表单提交失败事件
    const onFinishFailed = (errorInfo) => {
        common.alert('Failed:', errorInfo);
    };
    // 启用支付渠道
    const enableItem = paymentChannelId => {
        const data = {paymentChannelId: paymentChannelId}
        common.ajax('post', '/manage/paymentChannel/enable', data).then(() => {
            setReLoad(!reLoad)
        })
    }
    // 禁用支付渠道
    const disableItem = paymentChannelId => {
        const data = {paymentChannelId: paymentChannelId}
        common.ajax('post', '/manage/paymentChannel/disable', data).then(() => {
            setReLoad(!reLoad)
        })
    }
    // 删除支付渠道
    const deleteItem = paymentChannelId => {
        const data = {paymentChannelId: paymentChannelId}
        common.ajax('post', '/manage/paymentChannel/delete', data).then(() => {
            setReLoad(!reLoad)
        })
    }

    // 支付类型转换中文
    const translate = (code) => {
        let codeZh;
        switch (code) {
            case "CASH": codeZh = "现金"
                break;
            case "ALIPAY": codeZh = "支付宝"
                break;
            case "WXPAY": codeZh = "微信"
                break;
            case "POS": codeZh = "银行卡"
                break;
            case "CARD": codeZh = "会员卡"
                break;
            default:
                codeZh = "--"
        }
        return codeZh;
    }

    const columns = [
        {
            title: '支付渠道名称',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
        },
        {
            title: '类型',
            dataIndex: 'code',
            key: 'code',
            align: 'center',
            render: (code) => (
                <span>{translate(code)}</span>
            )
        },
        {
            title: '状态',
            key: 'status',
            dataIndex: 'status',
            align: 'center',
            render: (status, record) => (
                <Switch checked={status === 1}
                        checkedChildren="启用" unCheckedChildren="停用"
                        onChange={() => {
                            status === 1 ? disableItem(record.id) : enableItem(record.id)
                        }}/>
            ),
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            render: (text, record) => (
                <Space size="middle">
                    <Button type="link" onClick={_ => {
                        updateForm.setFieldsValue(record)
                        setPaymentChannel(record)
                        setIsUpdateModelShow(true)
                    }}>编辑</Button>
                    <Button type="link" onClick={_ => {
                        common.confirm("确定要删除？", () => {
                            deleteItem(record.id)
                        })
                    }}>删除</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Menu num={24}/>

            <div className={'Plate'} style={{marginLeft: 60}}>
                <div className="site-page-header-ghost-wrapper">
                    <PageHeader
                        ghost={false}
                        title="支付渠道"
                        extra={[
                            <Button key="createButton" type="primary" onClick={() => {
                                setIsCreateModelShow(true)
                            }}>
                                新增
                            </Button>,
                        ]}
                    >
                    </PageHeader>
                </div>
                <Table dataSource={paymentChannelList}
                       columns={columns}
                       rowKey={"id"}
                       pagination={{
                           size: "small",
                           showSizeChanger: true,
                           onChange: (page, pageSize) => {
                               setPage(page)
                               setPageSize(pageSize)
                           },
                           total: total,
                           current: page,
                           pageSize: pageSize,
                           defaultPageSize: pageSize,
                           showTotal: (total) => `共 ${total} 页`
                       }}
                />

                <Modal title="支付渠道新增" visible={isCreateModelShow} footer={null}
                       onCancel={_ => setIsCreateModelShow(false)} maskClosable={false}>


                    <Form
                        form={createForm}
                        name="createPlate"
                        labelCol={{offset: 2, span: 4}}
                        wrapperCol={{span: 16}}
                        initialValues={{remember: true}}
                        onFinish={onFinish("create")}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >

                        <Form.Item
                            label="类型"
                            name="code"
                            rules={[{required: true, message: '请选择类型!'}]}
                        >
                            <Select>
                                {
                                    codeList.map((item, index) => {
                                        return (
                                            <Select.Option key={index} value={item}>{translate(item)}</Select.Option>

                                        )
                                    })
                                }

                            </Select>
                        </Form.Item>

                        <Form.Item

                            label="渠道名称"
                            name="name"
                            rules={[{required: true, message: '请输入支付渠道名称!'}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label="排序"
                            name="sort"
                            initialValue={100}
                        >
                            <InputNumber/>
                        </Form.Item>

                        <Form.Item
                            wrapperCol={{
                                offset: 20,
                                span: 4,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                        </Form.Item>
                    </Form>

                </Modal>
                <Modal title="支付渠道编辑" visible={isUpdateModelShow} footer={null}
                       onCancel={_ => setIsUpdateModelShow(false)} maskClosable={false}>

                    <Form
                        form={updateForm}
                        name="updatePlate"
                        labelCol={{offset: 2, span: 4}}
                        wrapperCol={{span: 16}}
                        initialValues={{remember: true}}
                        onFinish={onFinish("update")}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >

                        <Form.Item
                            label="类型"
                            name="code"
                            rules={[{required: true, message: '请选择类型!'}]}
                        >
                            <Select>
                                {
                                    codeList.map((item, index) => {
                                        return (
                                            <Select.Option key={index} value={item}>{translate(item)}</Select.Option>
                                        )
                                    })
                                }

                            </Select>
                        </Form.Item>

                        <Form.Item

                            label="支付渠道名称"
                            name="name"
                            rules={[{required: true, message: '请输入支付渠道名称!'}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label="排序"
                            name="sort"
                            rules={[{required: true, message: '请输入排序值!'}]}
                        >
                            <InputNumber/>
                        </Form.Item>

                        <Form.Item
                            wrapperCol={{
                                offset: 20,
                                span: 4,
                            }}
                        >
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                        </Form.Item>
                    </Form>

                </Modal>

            </div>
        </div>

    );
}

export default PaymentChannel;
