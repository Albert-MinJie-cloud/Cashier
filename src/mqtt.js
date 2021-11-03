import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import mqtt from "mqtt"
import {getConsume, getPlateList} from "./actions/baseDataActions";
import {mqttHost} from "./config-local";

function MyMqtt(props) {

    useEffect(() => {

        if (props.tenant.id === 0) {
            return
        }

        const options = {
            clean: true,
            clientId: 'mqttjs_' + Math.random().toString(36).substr(2),
            username: 'username',
            password: 'password',
            reconnectPeriod: 1500,
            connectTimeout: 4000,
        }

        const client = mqtt.connect(mqttHost, options)

        client.on('connect', function (connack) {
            console.log('MQTT已连接')

            client.subscribe(`cashier/${props.tenant.id}`, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("subscribe:", `cashier/${props.tenant.id}`)
                }
            })
        })

        // 当客户端收到一个发布过来的 Payload 时触发，其中包含三个参数，topic、payload 和 packet，其中 topic 为接收到的消息的 topic，payload 为接收到的消息内容，packet 为 MQTT 报文信息，其中包含 QoS、retain 等信息
        client.on('message', function (topic, message) {
            let obj = {}
            try {
                obj = JSON.parse(message.toString())
            } catch (e) {
                console.log(e)
                return
            }
            console.log("mqtt:", obj)

            switch (obj.action) {

                case 'plate':   // 新增删除台桌
                case 'plateUse':// 台桌状态改变时
                    props.changeDesk()
                    break;
                case 'billComplete':
                    props.changeConsume()
                    break;
                default:
                    console.log("无法识别", obj.action)
            }

            //else if (obj.action === 'billOrderComplete') {/** 订单状态完结时*/ }

            // else if (obj.action === "consumePaid") { }

            //else { }

        })

        // 当断开连接后，经过重连间隔时间重新自动连接到 Broker 时触发
        client.on('reconnect', function () {
            console.log('mqtt Reconnecting...')
        })

        // 在断开连接以后触发
        client.on('close', function () {
            console.log('mqtt Disconnected')
        })

        // 当客户端下线时触发
        client.on('offline', function () {
            console.log('mqtt offline')
            client.end()
        })

        // 当客户端无法成功连接时或发生解析错误时触发，参数 error 为错误信息
        client.on('error', function (error) {
            console.log(error)
        })

    }, [props.tenant.id])

    return <></>
}

//取值
const mapStateToProps = (state) => {
    return {
        tenant: state.baseData.tenant,
    }
}

//传值
const mapDispatchToProps = (dispatch) => {
    return {
        changeDesk: () => {
            // dispatch({ type: 'CHANGE_DESK', deskList: deskList })
            getPlateList(1)(dispatch)
        },
        changeConsume: () => {
            getConsume(1)(dispatch)
        },
        setConsumerList: (consumerList) => {
            dispatch({type: 'CHANGE_CONSUMER', consumerList: consumerList})
        },
        setBillList: (billList) => {
            dispatch({type: 'CHANGE_BILLLIST', billList: billList})
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyMqtt)