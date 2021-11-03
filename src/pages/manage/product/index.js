import React, {useEffect, useState} from 'react';
import {Table, Space, Switch} from 'antd';
import {PageHeader, Modal, Button, Form, Input, Select, Radio, InputNumber, Image} from 'antd';
import common from "../../../common";
import AliyunOssUpload from "../../../components/AliyunOSSUpload/AliyunOSSUpload";
import Menu from "../../../components/menu";
import baseUrl from "../../../config-local"

function Product() {

    const [updateForm] = Form.useForm()
    const [createForm] = Form.useForm()
    const [productList, setProductList] = useState([])
    const [isCreateModelShow, setIsCreateModelShow] = useState(false)
    const [isUpdateModelShow, setIsUpdateModelShow] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [total, setTotal] = useState(0)
    const [reLoad, setReLoad] = useState(false)
    let [product, setProduct] = useState({})
    let [categoryList, setCategoryList] = useState([])
    const [coverKey, setCoverKey] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [imgHost, setImgHost] = useState("")
    // 获取商品列表
    useEffect(() => {
        const data = {
            page: page,
            limit: pageSize
        }

        common.ajax("get", "/manage/product/list", data).then(res => {
            setProductList(res.list)
            setTotal(res.pagination.total)
        })

    }, [reLoad, page, pageSize])
    // 获取可用商品分类列表
    useEffect(() => {
        const data = {
            page: 1,
            limit: 100,
            status: 1
        }
        common.ajax("get", "/manage/category/list", data).then(res => {
            setCategoryList(res.list)
        })
    }, [])

    // 新增商品 ajax
    const createProduct = (data) => {
        common.ajax('post', '/manage/product/create', data).then(() => {
            setReLoad(!reLoad)
            createForm.resetFields()
            setCoverKey("")
            setImageUrl("")
        }).finally(_ => {
            setIsCreateModelShow(false)
        })
    }
    // 更新商品信息 ajax
    const updateProduct = (data) => {
        common.ajax('post', '/manage/product/update', data).then(() => {
            setReLoad(!reLoad)
            updateForm.resetFields()
            setCoverKey("")
            setImageUrl("")
        }).finally(_ => {
            setIsUpdateModelShow(false)
        })
    }
    // 商品新增和商品更新表单 提交事件
    const onFinish = (type) => {
        return values => {
            let data;
            switch (type) {
                case "create":
                    data = {
                        id: product.id,
                        name: values.name,
                        categoryId: values.categoryId,
                        price: values.price,
                        allowDiscount: values.allowDiscount,
                        description: values.description,
                        sort: values.sort || 100,
                        coverKey: coverKey,
                    }
                    createProduct(data)
                    break
                case "update":
                    data = {
                        id: product.id,
                        name: values.name,
                        categoryId: values.categoryId,
                        price: values.price,
                        allowDiscount: values.allowDiscount,
                        description: values.description,
                        sort: values.sort || product.sort,
                        coverKey: coverKey,
                    }
                    updateProduct(data)
                    break
                default:
            }

        }
    };
    // 表单提交失败事件
    const onFinishFailed = (errorInfo) => {
        common.alert('Failed:', errorInfo);
    };
    // 上架商品
    const onSaleItem = productId => {
        const data = {productId: productId}
        common.ajax('post', '/manage/product/onSale', data).then(() => {
            setReLoad(!reLoad)
        })
    }
    // 下架商品
    const haltItem = productId => {
        const data = {productId: productId}
        common.ajax('post', '/manage/product/halt', data).then(() => {
            setReLoad(!reLoad)
        })
    }
    // 删除商品
    const deleteItem = productId => {
        const data = {productId: productId}
        common.ajax('post', '/manage/product/delete', data).then(() => {
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
            title: '商品名称',
            dataIndex: 'name',
            key: 'name',
            align: 'center'
        },
        {
            title: '分类',
            dataIndex: 'categoryName',
            key: 'categoryName',
            align: 'center'
        },
        {
            title: '价格',
            dataIndex: 'price',
            key: 'price',
            align: 'center'
        },
        {
            title: '是否允许打折',
            dataIndex: 'allowDiscount',
            key: 'allowDiscount',
            align: 'center',
            render: (allowDiscount, record) => (
                <Switch checked={allowDiscount === 1}
                        checkedChildren="是" unCheckedChildren="否"
                        onChange={() => {
                            let data = allowDiscount === 1
                                ? {...record, allowDiscount: 2}
                                : {...record, allowDiscount: 1}
                            updateProduct(data)
                        }}/>
            ),
        },
        {
            title: '状态',
            key: 'status',
            dataIndex: 'status',
            align: 'center',
            render: (status, record) => (
                <Switch checked={status === 1}
                        checkedChildren="在售" unCheckedChildren="停售"
                        onChange={() => {
                            status === 1 ? haltItem(record.id) : onSaleItem(record.id)
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
                        setProduct(record)
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
            <Menu num={7}/>
            <div className={'Plate'} style={{marginLeft: 60}}>
                <div className="site-page-header-ghost-wrapper">
                    <PageHeader
                        ghost={false}
                        title="商品"
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
                <Table dataSource={productList}
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

                <Modal title="商品新增" visible={isCreateModelShow} footer={null}
                       onCancel={_ => setIsCreateModelShow(false)} maskClosable={false}>

                    <Form
                        form={createForm} name="createProduct" labelCol={{offset: 2, span: 4}}
                        wrapperCol={{span: 16}} initialValues={{remember: true}}
                        onFinish={onFinish("create")} onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >

                        <Form.Item
                            label="图片"
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
                                type={2} setImgHost={setImgHost}
                            />
                        </Form.Item>

                        <Form.Item
                            label="商品分类"
                            name="categoryId"
                            rules={[{required: true, message: '请选择分类!'}]}
                        >
                            <Select>
                                {
                                    categoryList.map(item => {
                                        return (
                                            <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                                        )
                                    })
                                }

                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="商品名称"
                            name="name"
                            rules={[{required: true, message: '请输入商品名称!'}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label="商品价格"
                            name="price"
                            rules={[{required: true, message: '请输入商品价格!'}]}
                        >
                            <InputNumber stringMode step={0.01}/>
                        </Form.Item>

                        <Form.Item
                            label="是否允许打折"
                            name="allowDiscount"
                            labelCol={{
                                offset: 0,
                                span: 6,
                            }}
                            rules={[{required: true, message: '请选择是否允许打折!'}]}
                        >
                            <Radio.Group>
                                <Radio value={1}>允许</Radio>
                                <Radio value={2}>不允许</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            label="排序"
                            name="sort"
                            initialValue={100}
                        >
                            <InputNumber/>
                        </Form.Item>

                        <Form.Item
                            label="商品简介"
                            name="description"
                        >
                            <Input.TextArea/>
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
                <Modal title="商品编辑" visible={isUpdateModelShow} footer={null}
                       onCancel={_ => setIsUpdateModelShow(false)} maskClosable={false}
                       afterClose={() => {
                           setImageUrl("")
                           updateForm.resetFields()
                       }}>

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
                            label="图片"
                        >
                            <Image
                                width={100}
                                src={imageUrl === "" ? product.cover : imageUrl}
                            />
                        </Form.Item>

                        <Form.Item
                            label="图片更新"
                            name="file"
                        >
                            <AliyunOssUpload
                                onChange={uploadCallback}
                                onRemove={onUploadRemove}
                                type={2} setImgHost={setImgHost}
                            />
                        </Form.Item>

                        <Form.Item
                            label="商品分类"
                            name="categoryId"
                            rules={[{required: true, message: '请选择分类!'}]}
                        >
                            <Select>
                                {
                                    categoryList.map(item => {
                                        return (
                                            <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                                        )
                                    })
                                }

                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="商品名称"
                            name="name"
                            rules={[{required: true, message: '请输入商品名称!'}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label="商品价格"
                            name="price"
                            rules={[{required: true, message: '请输入商品价格!'}]}
                        >
                            <InputNumber stringMode step={0.01}/>
                        </Form.Item>

                        <Form.Item
                            label="是否允许打折"
                            name="allowDiscount"
                            labelCol={{
                                offset: 0,
                                span: 6,
                            }}
                            rules={[{required: true, message: '请选择是否允许打折!'}]}
                        >
                            <Radio.Group>
                                <Radio value={1}>允许</Radio>
                                <Radio value={2}>不允许</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            label="排序"
                            name="sort"
                            rules={[{required: true, message: '请输入排序值!'}]}
                        >
                            <InputNumber/>
                        </Form.Item>

                        <Form.Item
                            label="商品简介"
                            name="description"
                        >
                            <Input.TextArea/>
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

export default Product;
