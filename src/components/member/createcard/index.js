import React, { useState, useEffect } from 'react';
import "./index.less"
import common from '../../../common';
import { UserOutlined } from "@ant-design/icons"
import { Button, Input, Badge, Row, Col, Avatar, Modal } from 'antd';
import CreateMember from "../../../components/member/createmember";
import MemberCardDetail from "../../../components/member/membercarddetail";

function CreateCard() {
    let [memberPhone, setMemberPhone] = useState("")  //  会员手机号
    let [memberPhoneError, setMemberPhoneError] = useState("") // 手机号的错误信息
    let [phoneStatus, setPhoneStatus] = useState(false)  // 手机号正则匹配结果
    let [memberInfoData, setMemberInfoData] = useState([])  // 查询到的对应的手机号的会员信息
    let [selectMmberId, setSelectMemberId] = useState()  // 选择的会员的id

    let [createMmeberModel, setCreateMmeberModel] = useState(false)  // 创建会员的模态框
    let [memberDetailModel, setMemberDetailModel] = useState(false)  // 会员详情的模态框

    /* 获取用户会员信息 */
    const checkMember = (phone) => {
        if (phoneStatus) {
            let data = {
                mobile: phone
            }
            let config = { 'displayError': false }
            common.ajax("post", "/member/list", data, config)
                .then((res) => {
                    setMemberInfoData(res)
                })
                .catch((err) => {
                    if (err.message === "该手机号没有开通会员") {
                        setMemberInfoData([])
                        let confirmContent = `${err.message}(点击确定前往创建会员)`

                        Modal.confirm({
                            title: "提示",
                            okText: "确认",
                            cancelText: '取消',
                            content: `${confirmContent}`,
                            onOk: () => { setCreateMmeberModel(true) }
                        })

                    } else {
                        common.message(err.message)
                    }
                })
            return
        }
    }

    /* 手机号的正则验证 */
    function phoneRxg(phone) {
        setMemberPhone(phone)
        let phRxg = /^1[0-9]{10}$/
        if (!phRxg.test(phone)) {
            setMemberPhoneError("手机号格式不正确")
            setPhoneStatus(false)
        } else {
            setMemberPhoneError("")
            setPhoneStatus(true)
        }
    }

    /* 生成用户列表 */
    function createUserInfo(arr) {
        return arr.map((item, index) => {
            return (
                <div className="member_avatar"
                    key={index}
                    onClick={() => {
                        setSelectMemberId(item.id)
                        setMemberDetailModel(true)
                    }}>
                    <Avatar size={64} icon={<UserOutlined />} src={item.avatar} />
                    <div>{item.name}</div>
                </div>
            )
        })
    }

    return (
        <div className="createcard">
            <div className="createcard_content">
                <div className="content_center">
                    <div className="content_right">
                        <div className="right_badge">
                            <Badge.Ribbon text="请输入会员的手机号" placement="start" />
                        </div>
                        <div className="right_input">
                            <Row gutter={16}>
                                <Col span={4}></Col>
                                <Col span={8}>
                                    <Input
                                        placeholder="请输入手机号"
                                        value={memberPhone}
                                        maxLength={11}
                                        onChange={(e) => {
                                            setMemberInfoData([])
                                            phoneRxg(e.target.value)
                                        }} />
                                </Col>
                                <Col span={4}>
                                    <Button
                                        block
                                        type="primary"
                                        onClick={() => {
                                            checkMember(memberPhone)
                                        }}>
                                        查询(Enter)
                                    </Button>
                                </Col>
                                <Col span={4}>
                                    <Button
                                        block
                                        type="primary"
                                        size="middle"
                                        style={{ backgroundColor: "#ffc069", borderColor: "#ffc069" }}
                                        onClick={() => {
                                            setMemberPhone("")
                                            setPhoneStatus(false)
                                            setMemberInfoData([])
                                        }}
                                    >
                                        重置(Esc)
                                    </Button>
                                </Col>
                                <Col span={4}></Col>
                            </Row>

                            {
                                phoneStatus ? "" :
                                    <Row>
                                        <Col span={4}></Col>
                                        <Col span={8}>
                                            <div className="phone_error">
                                                <div>{memberPhoneError}</div>
                                            </div>
                                        </Col>
                                        <Col span={4}></Col>
                                        <Col span={4}></Col>
                                        <Col span={4}></Col>
                                    </Row>
                            }

                        </div>
                        <div className="right_check_message">
                            <div className="right_check_message_middle">
                                {
                                    createUserInfo(memberInfoData)
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="createcard_footer">
                <div>
                    <h3>会员办卡须知：</h3>
                    <p>
                        1、输入手机号 &gt; 确定 &gt; 系统会自动查询是否为老会员;<br />
                        2、老会员办卡可直接选择"我要办卡"即可,无需录入会员基本信息;<br />
                        3、新会员开户输入手机号后需完善会员资料;<br />
                    </p>
                </div>
            </div>

            <Modal
                title="创建会员"
                className="model_min_width"
                centered
                visible={createMmeberModel}
                onCancel={() => setCreateMmeberModel(false)}
                width={960}
                footer={null}
                bodyStyle={{ padding: 0 }}
                destroyOnClose={true}
                maskClosable={false}
            >
                <CreateMember phone={memberPhone} close={setCreateMmeberModel} selectMember={setSelectMemberId} open={setMemberDetailModel}></CreateMember>
            </Modal>

            <Modal
                title="会员信息"
                className="model_min_width"
                centered
                visible={memberDetailModel}
                onCancel={() => setMemberDetailModel(false)}
                width={960}
                footer={null}
                bodyStyle={{ padding: 0 }}
                destroyOnClose={true}
                maskClosable={false}
            >
                <MemberCardDetail memberId={selectMmberId} />
            </Modal>

        </div>
    );
}

export default CreateCard;