import React, { PureComponent, Fragment } from "react";
import debounce from "lodash.debounce";
import globalUtil from "../../utils/global";
import { connect } from "dva";
import { routerRedux } from "dva/router";
import config from "../../config/config";
import App from "../../../public/images/app.svg";
import AddGroup from "../../components/AddOrEditGroup";
import ThirForm from "./form.js";
import styles from "./Index.less";

import {
  List,
  Avatar,
  Icon,
  Skeleton,
  Badge,
  Row,
  Col,
  Input,
  Card,
  Typography,
  Pagination,
  Modal,
  Form,
  Select,
  Button,
  Cascader,
  Tooltip
} from "antd";

const { Search } = Input;
const { Text } = Typography;
const { Option } = Select;

@connect()
@Form.create()
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      detection: false,
      lists: [],
      page: 1,
      page_size: 10,
      total: 0,
      loading: true,
      thirdInfo: false,
      search: ""
    };
  }
  componentDidMount() {
    this.handleCodeWarehouseInfo(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.type !== this.props.type) {
      this.handleCodeWarehouseInfo(nextProps);
    }
  }
  onPageChange = page => {
    this.setState({ page, loading: true }, () => {
      this.handleCodeWarehouseInfo(this.props);
    });
  };
  handleSearch = search => {
    const _th = this;
    this.setState(
      {
        page: 1,
        search
      },
      () => {
        _th.handleCodeWarehouseInfo(_th.props);
      }
    );
  };
  //获取代码仓库信息
  handleCodeWarehouseInfo = props => {
    const { page, search } = this.state;
    const { dispatch, type } = props;
    dispatch({
      type: "global/codeWarehouseInfo",
      payload: {
        page,
        search,
        oauth_service_id: type
      },
      callback: res => {
        if (res) {
          this.setState({
            loading: false,
            total: res.data.bean.total,
            lists: res.data.bean.repositories
          });
        }
      }
    });
  };

  //代码检测
  handleTestCode = () => {
    this.props.dispatch({
      type: "global/testCode",
      payload: {
        oauth_service_id: this.props.type
      },
      callback: data => {
        if (data) {
          console.log("data", data);
        }
      }
    });
  };

  showModal = thirdInfo => {
    this.setState({
      visible: true,
      thirdInfo
    });
  };

  handleOk = e => {
    console.log(e);
    this.setState({
      visible: false
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false
    });
  };

  handleDetection = () => {
    this.setState({
      detection: false
    });
  };
  handleOpenDetection = () => {
    this.setState({
      detection: true
    });
  };
  render() {
    const { visible, detection, lists, loading, thirdInfo } = this.state;
    const { handleType } = this.props;
    const data = ["goodarin", "rainbond"];
    let ServiceComponent = handleType && handleType === "Service";
    return (
      <div
        style={{
          background: ServiceComponent ? "#fff " : "#F0F2F5"
        }}
      >
        {this.state.detection && (
          <Modal
            visible={detection}
            onCancel={this.handleDetection}
            title="重新检测"
            footer={
              !this.state.create_status
                ? [
                    <Button key="back" onClick={this.handleDetection}>
                      关闭
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      onClick={this.handleTestCode}
                    >
                      检测
                    </Button>
                  ]
                : this.state.create_status == "success"
                ? [
                    <Button key="back" onClick={this.handleDetection}>
                      关闭
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      onClick={this.handleDetection}
                    >
                      确认
                    </Button>
                  ]
                : [<Button key="back">关闭</Button>]
            }
          >
            <div>
              {this.state.create_status == "checking" ||
              this.state.create_status == "complete" ? (
                <div>
                  <p style={{ textAlign: "center" }}>
                    <Spin />
                  </p>
                  <p style={{ textAlign: "center", fontSize: "14px" }}>
                    检测中，请稍后(请勿关闭弹窗)
                  </p>
                </div>
              ) : (
                ""
              )}
              {this.state.create_status == "failure" ? (
                <div>
                  <p
                    style={{
                      textAlign: "center",
                      color: "#28cb75",
                      fontSize: "36px"
                    }}
                  >
                    <Icon
                      style={{
                        color: "#f5222d",
                        marginRight: 8
                      }}
                      type="close-circle-o"
                    />
                  </p>
                  {this.state.error_infos &&
                    this.state.error_infos.map(item => {
                      return (
                        <div>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: `<span>${item.error_info ||
                                ""} ${item.solve_advice || ""}</span>`
                            }}
                          />
                        </div>
                      );
                      // <p style={{ textAlign: 'center', fontSize: '14px' }}>{item.key}:{item.value} </p>
                    })}
                </div>
              ) : (
                ""
              )}
              {this.state.create_status == "success" ? (
                <div>
                  <p
                    style={{
                      textAlign: "center",
                      color: "#28cb75",
                      fontSize: "36px"
                    }}
                  >
                    <Icon type="check-circle-o" />
                  </p>

                  {this.state.service_info &&
                    this.state.service_info.map(item => {
                      return (
                        <p style={{ textAlign: "center", fontSize: "14px" }}>
                          {item.key}:{item.value}{" "}
                        </p>
                      );
                    })}
                </div>
              ) : (
                ""
              )}
              {this.state.create_status == "failed" ? (
                <div>
                  <p
                    style={{
                      textAlign: "center",
                      color: "999",
                      fontSize: "36px"
                    }}
                  >
                    <Icon type="close-circle-o" />
                  </p>
                  <p style={{ textAlign: "center", fontSize: "14px" }}>
                    检测失败，请重新检测
                  </p>
                </div>
              ) : (
                ""
              )}

              {!this.state.create_status && (
                <div>
                  <p style={{ textAlign: "center", fontSize: "14px" }}>
                    确定要重新检测吗?
                  </p>
                </div>
              )}
            </div>
          </Modal>
        )}

        {!visible ? (
          <List
            loading={loading}
            className={styles.lists}
            header={
              <Input.Search
                ref="searchs"
                placeholder="请输入搜索内容"
                enterButton="搜索"
                size="large"
                onSearch={this.handleSearch}
                style={{
                  width: 522,
                  padding: "0 0 11px 0"
                }}
              />
            }
            footer={
              <div style={{ textAlign: "right" }}>
                <Pagination
                  size="small"
                  current={this.state.page}
                  pageSize={this.state.page_size}
                  total={Number(this.state.total)}
                  onChange={this.onPageChange}
                />
              </div>
            }
            dataSource={lists}
            gutter={1}
            renderItem={item => (
              <List.Item
                className={styles.listItem}
                actions={[
                  <div>
                    <a
                      onClick={() => {
                        this.showModal(item);
                      }}
                    >
                      创建组件
                    </a>
                  </div>
                ]}
              >
                <Skeleton avatar title={false} loading={false} active>
                  <List.Item.Meta
                    style={{
                      alignItems: "center"
                    }}
                    avatar={<Avatar src={App} />}
                    title={
                      <div className={styles.listItemMataTitle}>
                        <Tooltip title={item.project_fullname.split("/")[0]}>
                          <div>{item.project_fullname.split("/")[0]}</div>
                        </Tooltip>

                        <Tooltip title={item.project_name}>
                          <div>{item.project_name}</div>
                        </Tooltip>
                      </div>
                    }
                  />
                  <Row
                    justify="center"
                    style={{
                      width: "70%",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    {!ServiceComponent && (
                      <Col span={8}>
                        <Tooltip title={item.project_description}>
                          <div className={styles.listItemMataDesc}>
                            {item.project_description}
                          </div>
                        </Tooltip>
                      </Col>
                    )}
                    <Col span={ServiceComponent ? 12 : 8}>
                      <Tooltip title={item.project_default_version}>
                        <div className={styles.listItemMataBranch}>
                          <Icon
                            type="apartment"
                            style={{ marginRight: "5px" }}
                          />
                          {item.project_default_version || "未检测语言"}
                        </div>
                      </Tooltip>
                    </Col>
                    <Col
                      span={ServiceComponent ? 12 : 8}
                      style={{ textAlign: "center" }}
                    >
                      <Badge
                        status="processing"
                        text={
                          <a onClick={this.handleOpenDetection}>
                            {item.project_language}
                          </a>
                        }
                      />
                    </Col>
                  </Row>
                </Skeleton>
              </List.Item>
            )}
          />
        ) : (
          <Card bordered={false} style={{ padding: "24px 32px" }}>
            <div
              className={styles.formWrap}
              style={{
                width: ServiceComponent ? "auto" : "500px"
              }}
            >
              <ThirForm
                onSubmit={this.props.handleSubmit}
                {...this.props}
                thirdInfo={thirdInfo}
              />
            </div>
          </Card>
        )}
      </div>
    );
  }
}

export default Index;