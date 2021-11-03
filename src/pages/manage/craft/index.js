import React, {useEffect, useState} from 'react';
import {Table, Space, Switch, InputNumber} from 'antd';
import {PageHeader, Modal, Button, Form, Input} from 'antd';
import common from "../../../common";
import Menu from "../../../components/menu";

function Craft() {

    const [createForm] = Form.useForm()
    const [updateForm] = Form.useForm()
    const [craftList, setCraftList] = useState([])
    const [isCreateModelShow, setIsCreateModelShow] = useState(false)
    const [isUpdateModelShow, setIsUpdateModelShow] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [total, setTotal] = useState(0)
    const [reLoad, setReLoad] = useState(false)
    let [craft, setCraft] = useState({})

    // 获取加工方式列表
    useEffect(() => {

        const data = {
            page: page,
            limit: pageSize
        }

        common.ajax("get", "/manage/craft/list", data).then(res => {
            setCraftList(res.list)
            setTotal(res.pagination.total)
        })

    }, [reLoad, page, pageSize])

    // 创建加工方式
    const createItem = (data) => {
        common.ajax('post', '/manage/craft/create', data).then(() => {
            setReLoad(!reLoad)
            createForm.resetFields()
        }).finally(_ => {
            setIsCreateModelShow(false)
        })
    }
    // 编辑加工方式
    const updateItem = (data) => {
        common.ajax('post', '/manage/craft/update', data).then(() => {
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
                        sort: values.sort || 100
                    }
                    createItem(data)
                    break
                case "update":
                    data = {
                        id: craft.id,
                        name: values.name,
                        sort: values.sort || craft.sort
                    }
                    updateItem(data)
                    break
                default:
            }

        }
    };
    // 表单提交失败事件
    const onFinishFailed = (errorInfo) => {
        common.alert('Failed:', errorInfo);
    };
    // 启用加工方式
    const enableItem = craftId => {
        const data = {craftId: craftId}
        common.ajax('post', '/manage/craft/enable', data).then(() => {
            setReLoad(!reLoad)
        })
    }
    // 停用加工方式
    const disableItem = craftId => {
        const data = {craftId: craftId}
        common.ajax('post', '/manage/craft/disable', data).then(() => {
            setReLoad(!reLoad)
        })
    }
    // 删除加工方式
    const deleteItem = craftId => {
        const data = {craftId: craftId}
        common.ajax('post', '/manage/craft/delete', data).then(() => {
            setReLoad(!reLoad)
        })
    }

    const columns = [
        {
            title: '加工方式名称',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
        },
        {
            title: '状态',
            key: 'status',
            dataIndex: 'status',
            align: 'center',
            render: (status, record) => (
                <Switch checked = {status === 1}
                        checkedChildren = "启用" unCheckedChildren = "停用"
                        onChange = {() => {
                            status === 1 ? disableItem(record.id) : enableItem(record.id)
                        }}/>
            ),
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            render: (text, record) => (
                <Space size = "middle">
                    <Button type = "link" onClick = {_ => {
                        updateForm.setFieldsValue(record)
                        setCraft(record)
                        setIsUpdateModelShow(true)
                    }}>编辑</Button>
                    <Button type = "link" onClick = {_ => {
                        common.confirm("确定要删除？",()=>{deleteItem(record.id)})
                    }}>删除</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Menu num={10}/>
            <div className = {'Craft'} style={{marginLeft:60}}>
                <div className = "site-page-header-ghost-wrapper">
                    <PageHeader
                        ghost = {false}
                        title = "加工方式"
                        extra = {[
                            <Button key = "createButton" type = "primary" onClick = {() => {
                                setIsCreateModelShow(true)
                            }}>
                                新增
                            </Button>,
                        ]}
                    >
                    </PageHeader>
                </div>
                <Table dataSource = {craftList}
                       columns = {columns}
                       rowKey = {"id"}
                       pagination = {{
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
                           showTotal: total => `共 ${total} 条`,
                       }}
                />

                <Modal title = "加工方式新增" visible = {isCreateModelShow} footer = {null}
                       onCancel = {_ => setIsCreateModelShow(false)} maskClosable={false}>


                    <Form
                        form = {createForm}
                        name = "createCraft"
                        labelCol = {{span: 6}}
                        wrapperCol = {{span: 16}}
                        initialValues = {{remember: true}}
                        onFinish = {onFinish("create")}
                        onFinishFailed = {onFinishFailed}
                        autoComplete = "off"
                    >
                        <Form.Item

                            label = "加工方式名称"
                            name = "name"
                            rules = {[{required: true, message: '请输入加工方式名称!'}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label = "排序"
                            name = "sort"
                            initialValue = {100}
                        >
                            <InputNumber/>
                        </Form.Item>

                        <Form.Item
                            wrapperCol = {{
                                offset: 20,
                                span: 4,
                            }}
                        >
                            <Button type = "primary" htmlType = "submit">
                                确定
                            </Button>
                        </Form.Item>
                    </Form>

                </Modal>
                <Modal title = "加工方式编辑" visible = {isUpdateModelShow} footer = {null}
                       onCancel = {() => setIsUpdateModelShow(false)} maskClosable={false}>


                    <Form
                        form = {updateForm}
                        name = "updateCraft"
                        labelCol = {{span: 6}}
                        wrapperCol = {{span: 16}}
                        initialValues = {{remember: true}}
                        onFinish = {onFinish("update")}
                        onFinishFailed = {onFinishFailed}
                        autoComplete = "off"
                    >
                        <Form.Item

                            label = "加工方式名称"
                            name = "name"
                            rules = {[{required: true, message: '请输入加工方式名称!'}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label = "排序"
                            name = "sort"
                            rules = {[{required: true, message: '请输入排序值!'}]}
                        >
                            <InputNumber/>
                        </Form.Item>

                        <Form.Item
                            wrapperCol = {{
                                offset: 20,
                                span: 4,
                            }}
                        >
                            <Button type = "primary" htmlType = "submit">
                                确定
                            </Button>
                        </Form.Item>
                    </Form>

                </Modal>

            </div>
        </div>

    );
}

export default Craft;


