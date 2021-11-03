import React, {useEffect, useState} from 'react';
import {Table, Space, Switch} from 'antd';
import {PageHeader, Modal, Button, Form, Input, InputNumber, Image} from 'antd';
import common from "../../../common";
import AliyunOssUpload from "../../../components/AliyunOSSUpload/AliyunOSSUpload";
import Menu from "../../../components/menu";
import baseUrl from "../../../config-local"

function Category() {

    const [createForm] = Form.useForm()
    const [updateForm] = Form.useForm()
    const [categoryList, setCategoryList] = useState([])
    const [isCreateModelShow, setIsCreateModelShow] = useState(false)
    const [isUpdateModelShow, setIsUpdateModelShow] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [total, setTotal] = useState(0)
    const [reLoad, setReLoad] = useState(false)
    let [category, setCategory] = useState({})
    const [coverKey, setCoverKey] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [imgHost, setImgHost] = useState("")

    // 获取分类列表
    useEffect(() => {

        const data = {
            page: page,
            limit: pageSize
        }

        common.ajax("get", "/manage/category/list", data).then(res => {
            setCategoryList(res.list)
            setTotal(res.pagination.total)
        })

    }, [reLoad, page, pageSize])
    // 表单提交事件
    const onFinish = (type) => {
        return values => {
            let data;
            switch (type) {
                case "create":
                    data = {
                        id: category.id,
                        name: values.name,
                        sort: values.sort || 100,
                        coverKey: coverKey,
                    }
                    common.ajax('post', '/manage/category/create', data).then(() => {
                        setReLoad(!reLoad)
                        createForm.resetFields()
                        setCoverKey("")
                        setImageUrl("")
                    }).finally(_ => {
                        setIsCreateModelShow(false)
                    })
                    break
                case "update":
                    data = {
                        id: category.id,
                        name: values.name,
                        sort: values.sort || category.sort,
                        coverKey: coverKey
                    }
                    common.ajax('post', '/manage/category/update', data).then(() => {
                        setReLoad(!reLoad)
                        updateForm.resetFields()
                        setCoverKey("")
                        setImageUrl("")
                    }).finally(_ => {
                        setIsUpdateModelShow(false)
                    })
                    break
                default:
            }

        }
    };
    // 表单提交失败事件
    const onFinishFailed = (errorInfo) => {
        common.alert('Failed:', errorInfo);
    };
    // 启用分类事件
    const enableItem = categoryId => {
        const data = {categoryId: categoryId}
        common.ajax('post', '/manage/category/enable', data).then(() => {
            setReLoad(!reLoad)
        })
    }
    // 停用分类事件
    const disableItem = categoryId => {
        const data = {categoryId: categoryId}
        common.ajax('post', '/manage/category/disable', data).then(() => {
            setReLoad(!reLoad)
        })
    }
    // 删除分类事件
    const deleteItem = categoryId => {
        const data = {categoryId: categoryId}
        common.ajax('post', '/manage/category/delete', data).then(() => {
            setReLoad(!reLoad)
        })
    }
    // 上传回调
    const uploadCallback = (res) => {

        if (res[0]?.status === "done") {
            if (res[0].response.data) {
                setCoverKey(res[0].response.data.coverKey)
                setImageUrl(imgHost + "/" + res[0].url)
            }
        }
    }
    const onUploadRemove = () => {
        setCoverKey("")
        setImageUrl("")
    }

    const columns = [
        {
            title: '分类名称',
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
                        setCategory(record)
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
            <Menu num={8}/>
            <div className={'Plate'} style={{marginLeft: 60}}>
                <div className="site-page-header-ghost-wrapper">
                    <PageHeader
                        ghost={false}
                        title="分类"
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
                <Table dataSource={categoryList}
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

                <Modal title="分类新增" visible={isCreateModelShow} footer={null}
                       onCancel={_ => setIsCreateModelShow(false)} maskClosable={false}>

                    <Form
                        form={createForm}
                        name="createCategory"
                        labelCol={{offset: 2, span: 4}}
                        wrapperCol={{span: 16}}
                        initialValues={{remember: true}}
                        onFinish={onFinish("create")}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >

                        <Form.Item
                            label="默认图片"
                        >
                            <Image
                                width={100}
                                src={imageUrl === "" ? baseUrl + "/default.jpg" : imageUrl}
                            />
                        </Form.Item>

                        <Form.Item
                            label="图片上传"
                            name="file"
                        >
                            <AliyunOssUpload
                                onChange={uploadCallback}
                                onRemove={onUploadRemove}
                                type={1} setImgHost={setImgHost}
                            />
                        </Form.Item>

                        <Form.Item
                            label="分类名称"
                            name="name"
                            rules={[{required: true, message: '请输入分类名称!'}]}
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
                <Modal title="分类编辑" visible={isUpdateModelShow} footer={null}
                       onCancel={_ => setIsUpdateModelShow(false)} maskClosable={false}
                       afterClose={() => {
                           setImageUrl("")
                           updateForm.resetFields()
                       }}>>

                    <Form
                        form={updateForm} name="updateCategory" labelCol={{offset: 2, span: 4}}
                        wrapperCol={{span: 16}} initialValues={{remember: true}}
                        onFinish={onFinish("update")}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="图片"
                        >
                            <Image
                                width={100}
                                src={imageUrl === "" ? category.cover : imageUrl}
                            />
                        </Form.Item>

                        <Form.Item
                            label="图片更新"
                            name="file"
                        >
                            <AliyunOssUpload
                                onChange={uploadCallback}
                                onRemove={onUploadRemove}
                                type={1} setImgHost={setImgHost}
                            />
                        </Form.Item>

                        <Form.Item
                            label="分类名称"
                            name="name"
                            rules={[{required: true, message: '请输入分类名称!'}]}
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

export default Category;
