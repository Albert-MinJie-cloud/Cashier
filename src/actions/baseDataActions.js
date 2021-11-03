import common from "../common";

// 获取桌台号
export const getPlateList = (status = 1) => (dispatch) => {
    common.ajax('get', '/manage/plate/list', {status: status}).then(res => {
        dispatch({type: 'CHANGE_DESK', deskList: res.list})
    })
}

// 账单完结时
export const getConsume = (status = 1) => (dispatch) => {
    let list = []
    common.ajax('get', '/operation/bill/list', {status: status}).then(r => {
        dispatch({type: 'CHANGE_BILLLIST', billList: r.list})
        for (let i = 0; i < r.list.length; i++) {
            list.push(r.list[i].id)
        }
    }).finally(() => {
        common.ajax(
            'get',
            '/operation/consume/list',
            {
                limit: 200,
                status: 1,
                paymentStatus: [1, 2],
                billIdList: list,
            },
            {contentType: 'application/json'})
        .then(r => {
            dispatch({type: 'CHANGE_CONSUMER', consumerList: r.list})
        })
    })
}
