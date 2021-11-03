import React, { useEffect, useState } from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import common from "../../common";

const AliyunOssUpload = (props) => {

    let [OSSData, setOSSData] = useState({})
    useEffect(() => {
        const data = {
            type: props.type,
        }
        common.ajax("get", "/manage/upload/getSignature", data)
            .then(res => {
                setOSSData(res)
                if(props.setImgHost) {
                    props.setImgHost(res.host)
                }
            }).catch(reason => {
                common.toast(reason.message)
            })
    }, [props])

    // 获取OSS文件上传签名
    const getSignature = () => {
        const data = {
            type: props.type,
        }
        return common.ajax("get", "/manage/upload/getSignature", data)
    }
    // 获取上传其他参数
    const getExtraData = file => {

        return {
            key: file.url,
            ossaccessKeyId: OSSData.ossaccessKeyId,
            policy: OSSData.policy,
            signature: OSSData.signature,
            callback: OSSData.callback,
            expire: OSSData.expire,
            success_action_status: 200,
        };
    };
    // 上传文件之前的钩子
    const beforeUpload = async file => {
        try {
            const expire = OSSData.expire * 1000

            if (expire < Date.now()) {
                OSSData = await getSignature()
                setOSSData(OSSData)
            }

            const suffix = file.name.slice(file.name.lastIndexOf('.'))
            file.url = OSSData.key + suffix;

            return file
        } catch (err) {
            common.toast(err.message)
        }

    }

    const onChange = ({ fileList }) => {
        const { onChange } = props;
        if (onChange) {
            onChange([...fileList]);
        }
    };

    const onRemove = file => {
        const { value, onChange, onRemove } = props;
        const files = value.filter(v => v.url !== file.url);

        if (onChange) {
            onChange(files);
        }

        if(onRemove) {
            onRemove();
        }
    };

    const { value } = props;

    return (
        <Upload name='file'
            fileList={value}
            action={OSSData?.host}
            onChange={onChange}
            onRemove={onRemove}
            data={getExtraData}
            beforeUpload={beforeUpload}
            maxCount={1}>
            <Button icon={<UploadOutlined />}>图片上传</Button>
        </Upload>
    );
};

export default AliyunOssUpload;
