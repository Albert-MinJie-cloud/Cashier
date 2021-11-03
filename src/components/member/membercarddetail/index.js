import React, { useState, useEffect } from 'react'
import "./index.less"
import { Avatar, Badge, Divider, Card, Input, Modal, Popconfirm, Empty } from 'antd';
import { CreditCardOutlined, RedEnvelopeOutlined, AccountBookOutlined, SyncOutlined, MoneyCollectTwoTone } from "@ant-design/icons"
import common from '../../../common';
import CardRecharge from '../cardrecharge';
import MemberCreateCard from "../../../components/member/membercreatecard"

function MemberCardDetail(props) {
    let [memberDetailData, setMemberDetailData] = useState({})  // 会员信息
    let [cardDetail, setCardDetail] = useState("")  //  选择的卡的详情
    let [selectCardClass, setSelectCardClass] = useState(1) // 选择的卡的功能类型
    let [memberCardList, setMemberCardList] = useState([])  //  获取到的卡的列表
    let [memberRecords, setMemberRecords] = useState([])  //  获取到的会员的消费记录列表
    let [memberRechargeRecords, setMemberRechargeRecords] = useState([])  // 获取到的充值记录

    let [cardRechargeModal, setCardRechargeModal] = useState(false)  //  卡的充值的页面
    let [cardCreateModal, setCardCreateModal] = useState(false)  //  会员办卡页面
    let [getMemberCardListStatus, setGetMemberCardListStatus] = useState(false)  // 会员拥有的卡券的列表刷新(每次取反既可以一直更新这个列表)

    let [memberId, setMemberId] = useState("")  //  会员的id

    /* 用来刚进页面获取用户的信息 */
    useEffect(() => {
        getMemberInfoData(props.memberId)
    }, [])

    /* 获取卡的列表的信息 */
    useEffect(() => {
        getCardListAxios(selectCardClass)
    }, [selectCardClass, getMemberCardListStatus])

    /* 获取用户信息的ajax请求 */
    const getMemberInfoData = (id) => {
        let data = {
            id: id
        }
        common.ajax("get", "/member/detail", data).then((res) => {
            setMemberDetailData(res)
            setMemberId(res.id)
        })
    }

    /*获取右侧的展示数据 */
    const getCardListAxios = (cardtype) => {
        /* 这里cardtype将来用来做卡的分类carftype(1为全部，2为打折卡，3为储蓄卡，4为卡券,103为消费记录查询，105为充值记录) */
        switch (cardtype) {
            case 1:
                let data = { memberId: props.memberId, status: 3 }
                common.ajax("get", "/member/card/list", data)
                    .then((res) => {
                        setMemberCardList(res)
                    })
                break;
            case 101:
                setCardCreateModal(true)
                break;
            case 103:
                let dataRecords = { memberId: props.memberId }
                common.ajax("get", "/member/cardUse/list", dataRecords)
                    .then((res) => {
                        setMemberRecords(res)
                    })
                break;
            case 105:
                let rechargeRecords = { memberId: props.memberId }
                common.ajax("get", "/member/rechargeOrder/list", rechargeRecords)
                    .then((res) => {
                        setMemberRechargeRecords(res)
                    })
                break;
            default:
                setMemberCardList([])
                break;
        }
    }

    /* 侧面会员卡类信息 */
    let cardDetailData = [
        { id: 1, type: '全部卡券', num: 0 },
        { id: 2, type: '打折卡', num: 0 },
        { id: 3, type: '储值卡', num: 0 },
        { id: 4, type: '计次卡', num: 0 },
    ]

    /* 底部功能区域 */
    let bottomSelectData = [
        { id: 101, name: "办卡", icon: <CreditCardOutlined /> },
        { id: 102, name: "发电子券", icon: <RedEnvelopeOutlined /> },
        { id: 103, name: "消费记录", icon: <AccountBookOutlined /> },
        { id: 104, name: "施工中", icon: <SyncOutlined spin /> },
    ]

    /* cardtobar卡类的导航栏 */
    let cardTobarData = [
        { id: 1, type: '全部卡券' },
        { id: 2, type: '计次卡' },
        { id: 3, type: '储值卡' },
        { id: 4, type: '卡券' },
    ]

    /* 消费记录和充值记录的导航栏数据 */
    let recordsTobarData = [
        { id: 103, name: "消费记录" },
        { id: 105, name: "充值记录" }
    ]

    /* 会员卡延期 */
    function delayMemberCard(cardId) {
        let data = { cardId: cardId }
        common.ajax("post", "/member/card/delay", data)
            .then((res) => {
                common.message("会员卡延期成功")
                setGetMemberCardListStatus(!getMemberCardListStatus)
            })
    }

    /* 生成侧边的选择卡类 */
    function createCardClass(arr) {

        return arr.map((item, index) => {
            return (
                <div key={index}>
                    <div
                        className={selectCardClass === item.id ? "member_detail_cardclass_item_active" : "member_detail_cardclass_item"}
                        onClick={() => {
                            setSelectCardClass(item.id)
                        }}>
                        <span>{item.type}</span>
                        {
                            item.num > 0 ? < Badge count={item.num} /> : ""
                        }
                    </div>
                    <Divider type="horizontal" className="divider_horizontal" />
                </div>
            )
        })
    }

    /* 生成左侧边的底部办卡功能区选择 */
    function createBottomSelect(arr) {
        return arr.map((item, index) => {
            return (
                <div className="member_detail_bottom_btn"
                    key={index}
                    onClick={() => {
                        setSelectCardClass(item.id)
                    }}>
                    <div className="member_detail_bottom_btn_item">
                        <div>
                            {item.icon}
                            <div>{item.name}</div>
                        </div>
                    </div>
                </div>
            )
        })
    }

    /* 卡类导航栏 */
    function createTobar(arr) {
        return arr.map((item, index) => {
            return (
                <li key={index}
                    className={selectCardClass === item.id ? "li_active" : ""}
                    onClick={() => {
                        setSelectCardClass(item.id)
                    }}>
                    {item.type}
                </li>
            )
        })
    }

    /* 消费记录和充值记录导航栏 */
    function createRecordTobar(arr) {
        return arr.map((item, index) => {
            return (
                <li key={index}
                    className={selectCardClass === item.id ? "li_active" : ""}
                    onClick={() => {
                        setSelectCardClass(item.id)
                    }}>
                    {item.name}
                </li>
            )
        })
    }

    /* 生成卡 */
    function createCard(arr) {
        if (arr.length === 0) {
            return (
                <div style={{ height: '100%', display: "flex", alignItems: 'center' }}>
                    <Empty />
                </div>
            )
        }
        return arr.map((item, index) => {
            return (
                <Card hoverable={true}
                    key={index}
                    bodyStyle={{ width: 400, height: 240, padding: 0 }}
                    className="member_card_style"
                >
                    <div className="card_create_shopname">
                        <span className="card_type">{item.cardCategoryDto.cardCategoryName}</span>
                        <span className="shop_name">{item.shopname}</span>
                    </div>

                    <div className="card_create_account">
                        <div className="card_id">
                            <span>ID: </span>
                            <span>{item.id}</span>
                        </div>
                        <div className="card_account">
                            <span>￥: </span>
                            <span>{item.balance}</span>
                        </div>
                    </div>

                    <div className="card_create_info">
                        <div className="card_discount">
                            <div>
                                <span>折扣率: </span>
                                <span>{item.cardCategoryDto.discount}%</span>
                            </div>

                            <div>
                                <span>有效期: </span>
                                <span>{item.availableStart.substring(0, 10)} ~ {item.availableEnd.substring(0, 10)}</span>
                            </div>
                        </div>
                        <div className="card_input_note">
                            <Input placeholder="请输入备注信息" bordered={false}></Input>
                        </div>
                    </div>

                    <div className="card_create_operation">
                        <ol>
                            <li onClick={() => {
                                setCardDetail(item)
                                setCardRechargeModal(true)
                            }}>充值</li>
                            <li>禁用</li>
                            <li>补卡换卡</li>
                            <li>退卡销户</li>
                            <Popconfirm
                                onConfirm={() => {
                                    delayMemberCard(item.id)
                                }}
                                title="是否确认将这张会员卡延期365天？"
                            >
                                <li>延期</li>
                            </Popconfirm>
                            <li>转赠</li>
                            <li>多卡合并</li>
                            <li>删除此卡</li>
                        </ol>
                    </div>
                </Card>
            )
        })
    }

    /* 生成消费记录 */
    function createReportsBillList(arr) {
        if (arr.length === 0) {
            return (
                <div style={{ height: '100%', display: "flex", alignItems: 'center' }}>
                    <Empty />
                </div>
            )
        }
        return arr.map((item, index) => {
            return (
                <div className="member_datail_records" key={index}>
                    <div className="member_records_step">
                        <div className="record_divider"></div>
                        <div className="record_title">
                            <div className="record_rirle_left_timme">
                                {item.createdAt}
                            </div>
                            <div className="record_rirle_right_ordernumber">
                                <span>消费卡号：</span><span>{item.cardNumber}</span>
                            </div>
                        </div>
                        <div className="record_receivable_account">
                            <div className="record_receivable_account_left">
                                <div className="should_pay">
                                    <span>应收: </span>
                                    <span>{item.money}</span>
                                </div>
                                <div className="discount_power">
                                    <span>优惠: </span>
                                    <span>--%</span>
                                </div>
                            </div>

                            <div className="record_receivable_account_right">
                                <MoneyCollectTwoTone twoToneColor="#f88510" />
                                <span>{item.money}</span>
                            </div>
                        </div>
                        <div className="record_pay_money">
                            <span>支付金额：</span>
                            <span>{item.money}</span>
                        </div>
                    </div>
                </div>
            )
        })
    }

    /* 生成充值记录 */
    function createRechargeReportsList(arr) {
        if (arr.length === 0) {
            return (
                <div style={{ height: '100%', display: "flex", alignItems: 'center' }}>
                    <Empty />
                </div>
            )
        }
        return arr.map((item, index) => {
            return (
                <div className="member_datail_records" key={index}>
                    <div className="member_records_step">
                        <div className="record_divider"></div>
                        <div className="record_title">
                            <div className="record_rirle_left_timme">
                                {item.createdAt}
                            </div>
                            <div className="record_rirle_right_ordernumber">
                                <span>订单编号：</span><span>{item.number}</span>
                            </div>
                        </div>
                        <div className="record_receivable_account">
                            <span>卡类</span>
                            <span>卡号</span>
                            <span>充值门店</span>
                            <span>充值金额</span>
                        </div>
                        <div className="record_pay_money">
                            <span>{item.cardCategoryName === null ? "---" : item.cardCategoryName}</span>
                            <span>{item.id}</span>
                            <span>{item.tenantId}店</span>
                            <span>{item.money}</span>
                        </div>
                    </div>
                </div>
            )
        })
    }

    /* 创建右侧导航栏 */
    function createRightTobar(id) {
        if (id < 50) {
            return createTobar(cardTobarData)
        }
        if (id === 103 || id === 105) {
            return createRecordTobar(recordsTobarData)
        }
    }

    /* 创建右侧内容 */
    function createRightContent(id) {
        if (id === 2) {
            return (
                <div style={{ height: '100%', display: "flex", alignItems: 'center' }}>
                    <Empty />
                </div>
            )
        }
        if (id === 3) {
            return (
                <div style={{ height: '100%', display: "flex", alignItems: 'center' }}>
                    <Empty />
                </div>
            )
        }
        if (id === 4) {
            return (
                <div style={{ height: '100%', display: "flex", alignItems: 'center' }}>
                    <Empty />
                </div>
            )
        }
        if (id === 102) {
            return (
                <div style={{ height: '100%', display: "flex", alignItems: 'center' }}>
                    <Empty
                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                        description={
                            <span>
                                功能开发中 <SyncOutlined spin />
                            </span>
                        } />
                </div>
            )
        }
        if (id === 104) {
            return (
                <div style={{ height: '100%', display: "flex", alignItems: 'center' }}>
                    <Empty
                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                        description={
                            <span>
                                功能开发中 <SyncOutlined spin />
                            </span>
                        } />
                </div>
            )
        }
        if (id === 1) {
            return createCard(memberCardList)
        }
        if (id === 103) {
            return createReportsBillList(memberRecords)
        }
        if (id === 105) {
            return createRechargeReportsList(memberRechargeRecords)
        }
    }

    return (
        <div className="member_detail">
            <div className="member_detail_left">
                <div className="member_detail_usercard">
                    <div className="member_detail_usercard_title">
                        <div>No: {memberDetailData.tenantId}店</div>
                        <div>
                            <span>改密 </span>
                            <span> 编辑</span>
                        </div>
                    </div>
                    <div className="member_detail_usercard_avatar">
                        <Badge count={"男"} size="default" offset={[-10, 54]} color="#1890ff">
                            <Avatar shape="circle"
                                size={64}
                                src={memberDetailData.avatar} />
                        </Badge>
                        <div className="member_detail_memberusername">
                            {memberDetailData.name}
                        </div>
                    </div>
                    <div className="member_detail_memberuserinfo">
                        <div className="memberuserinfo_tel">
                            <div className="memberuserinfo_tel_title">联系电话</div>
                            <div className="memberuserinfo_tel_content">{memberDetailData.mobile}</div>
                        </div>
                        <div className="memberuserinfo_birthday">
                            <div className="memberuserinfo_birthday_title">生日</div>
                            <div className="memberuserinfo_birthday_content">{memberDetailData.birthday}</div>
                        </div>
                    </div>
                </div>
                <div className="member_detail_userbalabce">
                    <div className="member_detail_useraccount_balance">
                        <div className="money_title">会员余额</div>
                        <div className="money_text">{memberDetailData.memberBalance ? memberDetailData.memberBalance : 0}</div>
                    </div>
                    <Divider type="vertical" className="divider_vertical" />
                    <div className="member_detail_member_points">
                        <div className="member_title">会员积分</div>
                        <div className="member_text">{memberDetailData.point ? memberDetailData.point : 0}</div>
                    </div>
                </div>
                <Divider type="horizontal" className="divider_horizontal" />
                <div className="member_detail_cardclass">
                    {
                        createCardClass(cardDetailData)
                    }
                </div>
                <div className="member_detail_bottom">
                    {
                        createBottomSelect(bottomSelectData)
                    }
                </div>
            </div>
            <div className="member_detail_right">
                <div className="member_detail_card_list_tobar">
                    <ul>
                        {
                            createRightTobar(selectCardClass)
                        }
                    </ul>
                </div>
                <div className="member_detail_card_list">

                    {
                        createRightContent(selectCardClass)
                    }

                </div>
            </div>

            <Modal
                title="充值"
                centered
                visible={cardRechargeModal}
                onCancel={() => setCardRechargeModal(false)}
                width={960}
                footer={null}
                bodyStyle={{ padding: 0 }}
                maskClosable={false}
                destroyOnClose={true}>
                <CardRecharge memberid={memberId} cardinfo={cardDetail} closeModel={setCardRechargeModal} refreshStatus={getMemberCardListStatus} refresh={setGetMemberCardListStatus}></CardRecharge>
            </Modal>

            <Modal
                title="会员办卡"
                className="model_min_width"
                centered
                visible={cardCreateModal}
                onCancel={() => {
                    setCardCreateModal(false)
                    setSelectCardClass(1)
                }}
                width={1080}
                footer={null}
                bodyStyle={{ padding: 0 }}
                maskClosable={false}
                destroyOnClose={true}>
                <MemberCreateCard closeMemberCreateCardModal={setCardCreateModal} memberId={props.memberId} cardList={setSelectCardClass}></MemberCreateCard>
            </Modal>
        </div>
    )
}

export default MemberCardDetail;