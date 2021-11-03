import React, { useState, useEffect } from "react";
import "./index.less";
import common from "../../../common";
import moment, { duration } from 'moment';
import { UserOutlined } from "@ant-design/icons";
import AliyunOssUpload from "../../../components/AliyunOSSUpload/AliyunOSSUpload";
import { Button, Avatar, Form, Input, Radio, DatePicker, ConfigProvider } from "antd";
import 'moment/locale/zh-cn';
import zhCN from 'antd/lib/locale/zh_CN';

function CreateMember(props) {
    /* 用户表单信息 */
    let [memberName, setMemberName] = useState("")
    let [memberPassword, setMemberPassword] = useState("")
    let [memberBirthday, setMemberBirthday] = useState("")
    let [memberIdentity, setMemberIdentity] = useState("")
    let [memberGender, setMemberGender] = useState(1)
    let [memberPhone, setMemberPhone] = useState("")

    const [coverKey, setCoverKey] = useState("")  //  请求的资源签名
    const [baseOssUrl, setBaseOssUrl] = useState("")  //  oss的地址
    const [uploadImg, setUploadPic] = useState("")  //  上传的图片url

    /* 检测打开组件的时候传进来的值 */
    useEffect(() => {
        setMemberPhone(props.phone)
        let data = { type: 3 }
        common.ajax("get", "/manage/upload/getSignature", data).then((res) => { setBaseOssUrl(res.host) })
    }, [])

    /* 创建会员的ajax请求 */
    const createMember = () => {
        let data = {
            name: memberName,
            mobile: memberPhone,
            birthday: memberBirthday,
            password: memberPassword,
            idCard: memberIdentity,
            sex: memberGender,
            coverKey: coverKey
        }
        common.ajax("post", "/member/create", data)
            .then((res) => {
                // 创建会员成功(将会员的创建成功的会员id保存;关闭创建会员的页面;打开会员详情的页面将会员id传递过去)
                common.toast("创建会员成功", () => {
                    props.selectMember(res.id)
                    props.close(false)
                    props.open(true)
                }, 1.5, "success")
            })
    }

    /* 这里设置超过当天的时间无法选择 */
    function disabledDate(current) {
        return current && current > moment().endOf('day');
    }

    /* 阿里云上传图片文件 */
    const uploadCallback = (res) => {
        if (res[0]?.status === "done") {
            if (res[0].response.data) {
                setCoverKey(res[0].response.data.coverKey)
                let path = `${baseOssUrl}/${res[0].url}`
                setUploadPic(path)
            }
        }
    }

    /* 删除图片 */
    const onUploadRemove = () => {
        setCoverKey("")
        setUploadPic("")
    }

    return (
        <div className="createmember">
            <div className="createmember_content">
                <div className="createmember_left">

                    <div className="create_change_avatar">
                        {
                            uploadImg === "" ?
                                <Avatar size={80} icon={<UserOutlined />} /> :
                                <Avatar size={80} icon={<UserOutlined />} src={uploadImg} alt="用户头像" />
                        }

                        <div>
                            修改头像
                        </div>

                        <Form>
                            <Form.Item
                                name="file">
                                <AliyunOssUpload
                                    type={3}
                                    onChange={uploadCallback}
                                    onRemove={onUploadRemove}
                                />
                            </Form.Item>
                        </Form>
                    </div>

                </div>
                <div className="createmember_right">
                    <Form
                        name="basic"
                        labelCol={{
                            span: 8,
                        }}
                        wrapperCol={{
                            span: 8,
                        }}
                        autoComplete="off"
                        initialValues={{ gender: 1 }}
                    >
                        <Form.Item
                            label="手机号"
                            name="phoneNumber"
                        >
                            <Input
                                placeholder={props.phone}
                                disabled={true}
                            />
                        </Form.Item>
                        <Form.Item
                            label="姓名"
                            name="username"
                            rules={[
                                {
                                    required: memberName.length > 0 ? false : true,
                                    message: '请输入姓名!',
                                },
                            ]}
                        >
                            <Input
                                placeholder={"请输入姓名"}
                                value={memberName}
                                onChange={(e) => {
                                    setMemberName(e.target.value)
                                }} />
                        </Form.Item>

                        <Form.Item
                            label="密码"
                            name="password"
                            rules={[
                                {
                                    required: memberPassword.length > 0 ? false : true,
                                    message: '密码不能为空!',
                                },
                            ]}
                        >
                            <Input.Password
                                value={memberPassword}
                                placeholder={"请输入密码"}
                                maxLength={16}
                                onChange={(e) => {
                                    setMemberPassword(e.target.value)
                                }} />
                        </Form.Item>

                        <Form.Item
                            label="出生日期"
                            name="birthday"
                            placeholder="年-月-日"
                        >
                            <ConfigProvider locale={zhCN}>
                                <DatePicker
                                    disabledDate={disabledDate}
                                    onChange={(data, dataStr) => {
                                        setMemberBirthday(dataStr)
                                    }} />
                            </ConfigProvider>
                        </Form.Item>

                        <Form.Item
                            label="身份证"
                            name="identitycard"
                        >
                            <Input
                                value={memberIdentity}
                                placeholder={"请输入身份证号"}
                                maxLength={18}
                                onChange={(e) => {
                                    setMemberIdentity(e.target.value)
                                }} />
                        </Form.Item>

                        <Form.Item
                            label="性别"
                            name="gender"
                        >
                            <Radio.Group
                                name="gender"
                                value={memberGender}
                                onChange={(e) => {
                                    setMemberGender(e.target.value)
                                }}>
                                <Radio value={1}>男</Radio>
                                <Radio value={2}>女</Radio>
                            </Radio.Group>
                        </Form.Item>

                    </Form>
                </div>
            </div>
            <div className="createmember_footer">
                <Button
                    type="primary"
                    size="middle"
                    style={{ backgroundColor: "#1890ff", borderColor: "#1890ff", marginRight: "12px" }}
                    onClick={() => {
                        createMember()
                    }}>
                    确认(Enter)
                </Button>
                <Button
                    type="primary"
                    size="middle"
                    style={{ backgroundColor: "#ffc069", borderColor: "#ffc069" }}
                    onClick={() => {
                        props.close(false)
                    }}>
                    取消(Esc)
                </Button>
            </div>
        </div >
    );
}

export default CreateMember;
