import React from 'react';
import { Modal, Form, Input, Button, Checkbox } from 'antd';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  onFinish = (values) => {
    this.props.handleOk(values);
  };

  onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  render() {
    return (
      <div>
        <Modal
          title='Basic Modal'
          visible={this.props.visible}
          footer={null}
          // onOk={this.props.handleOk}
          onCancel={this.props.handleCancel}
        >
          {this.props.visible && (
            <>
              <p>x: {this.props.point.x.toString().substring(0, 5)}</p>
              <Form
                {...layout}
                name='basic'
                initialValues={{ remember: true }}
                onFinish={this.onFinish}
                onFinishFailed={this.onFinishFailed}
              >
                <Form.Item
                  label='Titolo*'
                  name='titolo'
                  rules={[{ required: true, message: 'Campo obbligatorio!' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item label='Descrizione' name='descrizione'>
                  <Input.TextArea />
                </Form.Item>

                <Form.Item {...tailLayout}>
                  <Button type='primary' htmlType='submit'>
                    Aggiungi
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
        </Modal>
      </div>
    );
  }
}

export default App;
