import React, { PureComponent } from 'react';
import PortInput from './portInput';
import { connect } from 'dva';
import {
    Row,
    Col,
    Card,
    Table,
    Button,
    Drawer,
    Form,
    Input,
    Select
} from 'antd';
import globalUtil from '../../utils/global';
const FormItem = Form.Item;
const Option = Select.Option;

@connect(
    ({ user, global }) => ({
        currUser: user.currentUser,
        groups: global.groups,
    }),
)
class DrawerForm extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            serviceComponentList: [],
            portList: [],
            domain_port: ''
        }
    }
    resolveOk = (e) => {
        e.preventDefault();
        const { onOk } = this.props
        this.props.form.validateFields((err, values) => {
            if (!err) {
                onOk && onOk(values);
            }
        });
    }
    componentDidMount() {
        this.props.dispatch({
            type: "gateWay/querydomain_port",
            payload: {
                team_name: globalUtil.getCurrTeamName(),
            },
            callback: (data) => {
                this.setState({
                    domain_port: data.list
                })
            }
        })
        const { editInfo } = this.props;
        if (editInfo) {
            this.handleServices({ key: editInfo.g_id })
            this.state.serviceComponentList.length > 0 && this.handlePorts(editInfo.service_id)
        }
    }
    /**获取服务组件 */
    handleServices = (groupObj) => {
        const { dispatch } = this.props;
        const team_name = globalUtil.getCurrTeamName();
        /**获取对应的group_name */
        dispatch({
            type: "groupControl/fetchApps",
            payload: {
                group_id: groupObj.key,
                team_name
            },
            callback: (data) => {
                this.setState({ serviceComponentList: data.list })
            }
        })
    }
    /**获取端口 */
    handlePorts = (service_id) => {
        const { dispatch } = this.props;
        const team_name = globalUtil.getCurrTeamName();
        const service_obj = this.state.serviceComponentList.filter((item) => {
            return item.service_id == service_id
        })
        dispatch({
            type: "appControl/fetchPorts",
            payload: {
                app_alias: service_obj[0].service_alias,
                team_name
            },
            callback: (data) => {
                this.setState({ portList: data.list })
            }
        })
    }
    render() {
        const { onClose, editInfo } = this.props;
        const { getFieldDecorator } = this.props.form;
        const { domain_port } = this.state;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 }
            }
        };

        let rule_round, current_enpoint;

        if (editInfo && editInfo.rule_extensions)
            rule_round = editInfo.rule_extensions.split(':')[1]

        if (editInfo && editInfo.end_point) {
            const end_pointArr = editInfo.end_point.split(":");
            current_enpoint = [
                {
                    ip: end_pointArr[0],
                    port: end_pointArr[1]
                }
            ]
        }
        return (
            <div>
                {domain_port && <Drawer
                    title={editInfo ? "编辑tcp访问策略" : "添加tcp访问策略"}
                    placement="right"
                    width={500}
                    closable={false}
                    onClose={onClose}
                    visible={this.props.visible}
                    maskClosable={true}
                    style={{
                        height: 'calc(100% - 55px)',
                        overflow: 'auto',
                        paddingBottom: 53,
                    }}
                >
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="IP"
                        >
                            {getFieldDecorator('end_point', {
                                rules: [{ required: true, message: '请输入完整的ip和端口' }]
                            })(
                                <PortInput domain_port={editInfo && editInfo.end_point ? current_enpoint : domain_port} />
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="应用(组)"
                        >
                            {getFieldDecorator('group_id', {
                                rules: [{ required: true, message: '请选择应用(组)' }],
                                initialValue: { key: editInfo.g_id || "-1", label: editInfo.group_name || "请选择应用(组)" }
                            })(
                                <Select labelInValue placeholder="请选择要所属应用(组)" onChange={this.handleServices}>
                                    <Option value="-1">请选择应用(组)</Option>
                                    {
                                        (this.props.groups || []).map((group, index) => {
                                            return <Option value={group.group_id.toString()} key={index}>{group.group_name}</Option>
                                        })
                                    }
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="服务组件"
                        >
                            {getFieldDecorator('service_id', {
                                rules: [{ required: true, message: '请选择' }],
                                initialValue: editInfo.service_id

                            })(
                                <Select placeholder="请选择服务组件" onChange={this.handlePorts}>
                                    {
                                        (this.state.serviceComponentList || []).map((service, index) => {
                                            return <Option value={service.service_id.toString()} key={index}>{service.service_cname}</Option>
                                        })
                                    }

                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="端口号"
                        >
                            {getFieldDecorator('container_port', {
                                rules: [{ required: true, message: '请选择端口号' }],
                                initialValue: editInfo.container_port,
                            })(
                                <Select placeholder="请选择端口号">
                                    {
                                        (this.state.portList || []).map((port, index) => {
                                            return <Option value={port.container_port} key={index}>{port.container_port}</Option>
                                        })
                                    }
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="扩展功能"
                        >
                            {getFieldDecorator("rule_extensions", { initialValue: rule_round })(
                                <Select placeholder="请选择负载均衡类型">
                                    <Option value="round-robin">round-robin</Option>
                                    {/* <Option value="random">random</Option>
                                    <Option value="consistence-hash">consistence-hash</Option> */}
                                </Select>
                            )}
                        </FormItem>
                    </Form>
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            width: '100%',
                            borderTop: '1px solid #e8e8e8',
                            padding: '10px 16px',
                            textAlign: 'right',
                            left: 0,
                            background: '#fff',
                            borderRadius: '0 0 4px 4px',
                        }}
                    >
                        <Button
                            style={{
                                marginRight: 8,
                            }}
                            onClick={onClose}
                        >
                            取消
                        </Button>
                        <Button onClick={this.resolveOk} type="primary">确认</Button>
                    </div>
                </Drawer>}
            </div>
        )
    }
}
const drawerForm = Form.create()(DrawerForm);
export default drawerForm;