import React, { Component } from "react";
import { connect } from "dva";
import { Link } from "dva/router";
import { Checkbox, Alert, Button, Form, Tabs, Input, Icon } from "antd";
import { routerRedux } from "dva/router";
import styles from "./Login.less";
import Register from "./Register";
import userLogo from "../../../public/user-logo.png";

const FormItem = Form.Item;
const { TabPane } = Tabs;

@Form.create()
@connect(({ loading, global }) => ({
  login: {},
  isRegist: global.isRegist,
  rainbondInfo: global.rainbondInfo,
  submitting: loading.effects["user/login"]
}))
export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type:
        this.props.location.pathname &&
        this.props.location.pathname.indexOf("register") > -1
          ? "register"
          : "login",
      autoLogin: true
    };
  }
  componentDidMount() {}

  onTabChange = type => {
    this.props.dispatch(routerRedux.push(`/user/${type}`));
    this.setState({ type });
  };

  handleReset = () => {
    const { resetFields } = this.props.form;
    resetFields();
  };

  handleSubmit = e => {
    e.preventDefault();
    const form = this.props.form;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.props.dispatch({
        type: "user/login",
        payload: {
          ...fieldsValue
        }
      });
    });
  };

  changeAutoLogin = e => {
    this.setState({ autoLogin: e.target.checked });
  };

  renderMessage = content => (
    <Alert
      style={{
        marginBottom: 24
      }}
      message={content}
      type="error"
      showIcon
    />
  );

  render() {
    const { submitting, form, rainbondInfo } = this.props;
    const { type } = this.state;
    const { getFieldDecorator } = form;

    return (
      <div className={styles.main}>
        <Link to="/">
          <div className={styles.loginBox}>
            <img
              src={ userLogo}
              alt={"智慧社会操作系统"}
            />
            <h3> {"智慧社会操作系统"} </h3>
          </div>
        </Link>

        <Tabs
          defaultActiveKey="login"
          activeKey={type}
          onChange={this.onTabChange}
          style={{ textAlign: "center" }}
        >
          <TabPane tab="登录" key="login">
            {type === "login" && (
              <Form onSubmit={this.handleSubmit} style={{ marginTop: "20px" }}>
                <FormItem>
                  {getFieldDecorator("nick_name", {
                    rules: [
                      {
                        required: true,
                        message: "请输入用户名！"
                      }
                    ]
                  })(
                    <Input
                      prefix={
                        <Icon
                          type="user"
                          style={{ color: "rgba(0,0,0,.25)" }}
                        />
                      }
                      size="large"
                      placeholder="请输入用户名！"
                    />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator("password", {
                    rules: [
                      {
                        required: true,
                        message: "请输入密码"
                      }
                    ]
                  })(
                    <Input
                      size="large"
                      type="password"
                      prefix={
                        <Icon
                          type="lock"
                          style={{ color: "rgba(0,0,0,.25)" }}
                        />
                      }
                      placeholder="请输入密码"
                      min={8}
                    />
                  )}
                </FormItem>
                <div style={{ textAlign: "left" }}>
                  <Checkbox
                    checked={this.state.autoLogin}
                    onChange={this.changeAutoLogin}
                  >
                    自动登录
                  </Checkbox>
                </div>
                <div className={styles.loadbottom}>
                  <Button type="primary" loading={submitting} htmlType="submit">
                    登录
                  </Button>
                  <Button onClick={this.handleReset}>重置</Button>
                </div>
              </Form>
            )}
          </TabPane>
          <TabPane tab="注册" key="register">
            {type === "register" && <Register onChange={this.onTabChange} />}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
