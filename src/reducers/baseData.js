let tenantId = window.localStorage.getItem('tenantId')


let initialState = {
    areaList: [],     // 区域
    categoryList: [], // 分类
    productList: [],  // 品项
    plateList: [],    // 牌号
    tagsList: [],     //加工方式
    orderedDishes: [],       //已经点过的菜
    isModalVisible1: false,  //管理结账页面
    billId: null,        //获取账单id
    deskList: [],       //台桌列表
    tenant: {           //租户信息
        id: tenantId ? tenantId : 0,
        name: ""
    },
    consumerList: [],  //消费列表
    billList: [],        //账单列表
}

export default function (state = initialState, action) {
    switch (action.type) {
        case 'CHANGE_AREA':
            return { ...state, areaList: action.areaList }
        case 'CHANGE_CATEGORY':
            return { ...state, categoryList: action.categoryList }
        case 'CHANGE_PRODUCT':
            return { ...state, productList: action.productList }
        case 'CHANGE_PLATE':
            return { ...state, plateList: action.plateList }
        case 'CHANGE_TAG':
            return { ...state, tagsList: action.tagsList }
        case 'CHANGE_ORDERED':
            return { ...state, orderedDishes: action.orderedDishes }
        case 'CHANGE_CHECKOUT':
            return { ...state, isModalVisible1: action.isModalVisible1 }
        case 'CHANGE_BILL':
            return { ...state, billId: action.billId }
        case 'CHANGE_DESK':
            return { ...state, deskList: action.deskList }
        case 'CHANGE_TENANT':
            return { ...state, tenant: action.tenant }
        case 'CHANGE_CONSUMER':
            return { ...state, consumerList: action.consumerList }
        case 'CHANGE_BILLLIST':
            return { ...state, billList: action.billList }
        default:
            return state
    }
}
