import React, {useEffect, useState} from 'react';
import {Table, Space, Switch, InputNumber, Select} from 'antd';
import {PageHeader, Modal, Button, Form, Input} from 'antd';
import common from "../../../common";
import Menu from "../../../components/menu";


function Plate() {

    const [createForm] = Form.useForm()
    const [updateForm] = Form.useForm()
    const [plateList, setPlateList] = useState([])
    const [isCreateModelShow, setIsCreateModelShow] = useState(false)
    const [isUpdateModelShow, setIsUpdateModelShow] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [total, setTotal] = useState(0)
    const [reLoad, setReLoad] = useState(false)
    let [areaList, setAreaList] = useState([])
    let [plate, setPlate] = useState({})

    // 获取牌号列表
    useEffect(() => {

        const data = {
            page: page,
            limit: pageSize
        }

        common.ajax("get", "/manage/plate/list", data).then(res => {
            setPlateList(res.list)
            setTotal(res.pagination.total)
        })

    }, [reLoad, page, pageSize])
    // 获取可用区域列表
    useEffect(() => {
        const data = {
            page: 1,
            limit: 100,
            status: 1
        }
        common.ajax("get", "/manage/area/list", data).then(res => {
            setAreaList(res.list)
        })
    }, [])

    // 牌号新增
    const createPlate = (data) => {
        common.ajax('post', '/manage/plate/create', data).then(() => {
            setReLoad(!reLoad)
            createForm.resetFields()
        }).finally(_ => {
            setIsCreateModelShow(false)
        })
    }
    // 牌号更新
    const updatePlate = (data) => {
        common.ajax('post', '/manage/plate/update', data).then(() => {
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
                        areaId: values.areaId,
                        name: values.name,
                        people: values.people || 1,
                        sort: values.sort || 100
                    }
                    createPlate(data)
                    break
                case "update":
                    data = {
                        id: plate.id,
                        areaId: values.areaId,
                        name: values.name,
                        people: values.people || plate.people,
                        sort: values.sort || plate.sort
                    }
                    updatePlate(data)
                    break
                default:
            }

        }
    };
    // 表单提交失败事件
    const onFinishFailed = (errorInfo) => {
        common.alert('Failed:', errorInfo);
    };
    // 启用牌号
    const enableItem = plateId => {
        const data = {plateId: plateId}
        common.ajax('post', '/manage/plate/enable', data).then(() => {
            setReLoad(!reLoad)
        })
    }
    // 禁用牌号
    const disableItem = plateId => {
        const data = {plateId: plateId}
        common.ajax('post', '/manage/plate/disable', data).then(() => {
            setReLoad(!reLoad)
        })
    }
    // 删除牌号
    const deleteItem = plateId => {

        common.confirm("确定删除吗?", function () {
            const data = {plateId: plateId}
            common.ajax('post', '/manage/plate/delete', data).then(() => {
                setReLoad(!reLoad)
            })
        })

    }

    const columns = [
        {
            title: '牌号名称',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
        },
        {
            title: '区域',
            dataIndex: 'areaName',
            key: 'areaName',
            align: 'center'
        },
        {
            title: '容纳人数',
            dataIndex: 'people',
            key: 'people',
            align: 'center'
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
                        setPlate(record)
                        setIsUpdateModelShow(true)
                    }}>编辑</Button>
                    <Button type="link" onClick={_ => {
                        deleteItem(record.id)
                    }}>删除</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Menu num={9}/>

            <div className={'Plate'} style={{marginLeft: 60}}>
                <div className="site-page-header-ghost-wrapper">
                    <PageHeader
                        ghost={false}
                        title="牌号"
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
                <Table dataSource={plateList}
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
                           showTotal: total => `共 ${total} 条`,
                       }}
                />

                <Modal title="牌号新增" visible={isCreateModelShow} footer={null}
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
                            label="区域"
                            name="areaId"
                            rules={[{required: true, message: '请选择区域!'}]}
                        >
                            <Select>
                                {
                                    areaList.map(item => {
                                        return (
                                            <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                                        )
                                    })
                                }

                            </Select>
                        </Form.Item>

                        <Form.Item

                            label="牌号名称"
                            name="name"
                            rules={[{required: true, message: '请输入牌号名称!'}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label="人数"
                            name="people"
                            initialValue={1}
                            rules={[{required: true, message: '请输入人数!'}]}
                        >
                            <InputNumber/>
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
                <Modal title="牌号编辑" visible={isUpdateModelShow} footer={null}
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
                            label="区域"
                            name="areaId"
                            rules={[{required: true, message: '请选择区域!'}]}
                        >
                            <Select>
                                {
                                    areaList.map(item => {
                                        return (
                                            <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                                        )
                                    })
                                }

                            </Select>
                        </Form.Item>

                        <Form.Item

                            label="牌号名称"
                            name="name"
                            rules={[{required: true, message: '请输入牌号名称!'}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label="人数"
                            name="people"
                            rules={[{required: true, message: '请输入人数!'}]}
                        >
                            <InputNumber/>
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

export default Plate;
