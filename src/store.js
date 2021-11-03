import {createStore, combineReducers, applyMiddleware} from 'redux'
import baseData from './reducers/baseData'
import reduxThunk from "redux-thunk"

const reducers = combineReducers({
    baseData,
})

const store = createStore(reducers, {}, applyMiddleware(reduxThunk));

export default store
