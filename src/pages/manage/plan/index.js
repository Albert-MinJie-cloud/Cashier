import React, {useEffect, useState} from 'react';
import {
    PageHeader,
    Button,
    Switch,
    Space,
    Table,
    Popconfirm
} from 'antd';
import common from "../../../common";
import Menu from "../../../components/menu";

function Plan(props) {

    const [plan, setPlan] = useState([]) //价格计划列表

    useEffect(() => {
        init()
    }, [])

    //价格计划列表
    let init = () => {
        common.ajax("get", "/manage/plan/list")
            .then(res => {
                setPlan(res.list)
            })
            .catch((err) => {
                common.alert(err.message)
            })
    }

    //启用、禁用
    let handleStatusChange = (status, id) => {

        const data = {
            "id": id,
        }

        if (status === 1) {
            common.ajax("post", "/manage/plan/disable", data)
                .then(res => {
                    init()
                })
                .catch(err => {
                    common.alert(err.message)
                })
        }
        if (status === 2) {
            common.ajax("post", "/manage/plan/enable", data)
                .then(res => {
                    init()
                })
                .catch(err => {
                    common.alert(err.message)
                })
        }
    };

    //删除
    let deletePlan = (id) => {
        common.ajax("post", "/manage/plan/delete", {id: id}).then(res => {
            common.alert("删除成功")
            init()
        })
    }

    const paginationProps = {
        showSizeChanger: true,//设置每页显示数据条数
        pageSizeOptions: [5, 15, 30],
        showQuickJumper: true,
        showTotal: (total) => `共${total}条`,
    }

    const columns = [
        {
            title: '方案名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '方案有效起始时间',
            dataIndex: 'beginTimestamp',
            key: 'beginTimestamp',
            align: 'center'
        },
        {
            title: '方案有效结束时间',
            dataIndex: 'endTimestamp',
            key: 'endTimestamp',
            align: 'center'
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
                        }}/>
        },
        {
            title: '操作',
            key: 'action',
            align: 'center',
            render: (text, record) => (
                <Space size="middle">
                    <a onClick={() => {
                        props.history.push("/manage/plan/edit/" + record.id)
                    }}>编辑</a>
                    <a onClick={() => {
                        props.history.push("/manage/plan/detail/" + record.id)
                    }}>详情</a>
                    <Popconfirm
                        title="确认删除该价格方案吗?"
                        onConfirm={() => {
                            deletePlan(record.id)
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


    return (
        <div>
            <Menu num={6}/>
            <div className={'Plan'} style={{marginLeft: 60}}>
                {/* 页头 */}
                <div className="site-page-header-ghost-wrapper">
                    <PageHeader
                        ghost={false}
                        title="价格方案"
                        extra={[
                            <Button key={"plan"} type="primary" onClick={() => {
                                props.history.push("/manage/plan/create")
                            }}>
                                新增
                            </Button>,
                        ]}
                    >
                    </PageHeader>
                </div>

                {/* 表格 */}
                <Table rowKey={"id"} dataSource={plan} columns={columns} pagination={paginationProps}/>

            </div>
        </div>

    );
}


export default Plan;