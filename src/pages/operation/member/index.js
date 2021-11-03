import react, { useState } from "react";
import "./index.less"
import Menu from "../../../components/menu";
import { Button, Modal } from 'antd';
import CreateCard from "../../../components/member/createcard";

function Member() {
    let [createCardVisible, setCreateCardVisible] = useState(false);

    const openCreateCard = () => {
        setCreateCardVisible(true)
    }

    return (
        <div>
            <Menu num={14} />
            <div className="member">
                <div className="member_header">

                    <div className="member_btn">
                        <Button
                            type="primary"
                            block
                            onClick={openCreateCard}>
                            会员开卡
                        </Button>
                    </div>

                </div>

                <div className="member_top"></div>
            </div>

            <Modal
                title="会员开卡"
                className="model_min_width"
                centered
                visible={createCardVisible}
                onCancel={() => setCreateCardVisible(false)}
                width={960}
                footer={null}
                bodyStyle={{ padding: 0 }}
                destroyOnClose={true}
                maskClosable={false}
            >
                <CreateCard></CreateCard>
            </Modal>

        </div>
    )
}

export default Member;