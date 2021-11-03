import './App.less';
import {HashRouter, Switch, Route} from "react-router-dom";
import Home from "./pages/operation/home";
import Login from "./pages/operation/login";
import Order from "./pages/operation/order";
import Product from "./pages/operation/product";
import Other from "./pages/operation/other";
import Plan from "./pages/manage/plan";
import PlanCreate from "./pages/manage/plan/create";
import PlanDetail from "./pages/manage/plan/detail";
import PlanEdit from "./pages/manage/plan/edit";
import Plate from "./pages/manage/plate"
import Category from "./pages/manage/category";
import Craft from "./pages/manage/craft";
import ManageProduct from "./pages/manage/product";
import Substitute from "./pages/operation/substitute"
import Vip from "./pages/operation/vip";
import Area from "./pages/manage/area";
import Member from "./pages/operation/member";
import CardCategory from "./pages/manage/cardCategory";
import PaymentChannel from "./pages/manage/paymentChannel";
import MyMqtt from './mqtt';
import {connect} from "react-redux";

function App(props) {

    return (
        <div className="App">
            <MyMqtt/>
            <HashRouter>
                <Switch>
                    <Route exact path={'/'} component={Home}/>
                    <Route path={'/orderList'} component={Order}/>
                    <Route path={'/product'} component={Product}/>
                    <Route path={'/other'} component={Other}/>
                    <Route path={'/login'} component={Login}/>
                    <Route path={'/substitute'} component={Substitute}/>
                    <Route path={'/manage/plan/create'} component={PlanCreate}/>
                    <Route path={'/manage/plan/detail/:id'} component={PlanDetail}/>
                    <Route path={'/manage/plan/edit/:id'} component={PlanEdit}/>
                    <Route path={'/manage/plan'} component={Plan}/>
                    <Route path={'/manage/product'} component={ManageProduct}/>
                    <Route path={'/manage/category'} component={Category}/>
                    <Route path={'/manage/plate'} component={Plate}/>
                    <Route path={'/manage/craft'} component={Craft}/>
                    <Route path={'/manage/paymentChannel'} component={PaymentChannel}/>
                    <Route path={'/vip'} component={Vip}/>
                    <Route path={'/manage/area'} component={Area}/>
                    <Route path={'/member'} component={Member}/>
                    <Route path={'/manage/cardCategory'} component={CardCategory}/>
                </Switch>
            </HashRouter>
        </div>
    );
}

// export default App;

//传值
const mapDispatchToProps = (dispatch) => {
    return {
        setDeskList: (deskList) => {
            dispatch({type: 'CHANGE_DESK', deskList: deskList})
        }
    }
}

export default connect(null, mapDispatchToProps)(App)
//如果只需要取值或者传值的时候可以删除另一个方法
//connect(null, mapDispatchToProps)或者connect(mapStateToProps, null)