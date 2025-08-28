import React, { useState } from 'react';
import { Card, Typography, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { loginUser, registerUser } from '../services/auth';
import styled from '@emotion/styled';

const { Title, Text } = Typography;

const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 150px);
  text-align: center;
  padding: 20px;
`;

const HomeTitle = styled(Title)`
  margin-bottom: 40px;
  color: #1a5d1a;
`;

const HomeCard = styled(Card)`
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;

  .ant-card-head {
    border-bottom: none;
  }

  .ant-form-item-control-input-content {
    input {
      background: rgba(255, 255, 255, 0.9);
    }
  }

  .ant-btn-primary {
    background: #4CAF50;
    border-color: #45a049;

    &:hover {
      background: #45a049;
      border-color: #3d8b40;
    }
  }

  .register-link {
    text-align: center;
    margin-top: 16px;
    color: #1a5d1a;
    cursor: pointer;

    &:hover {
      color: #2e7d32;
    }
  }
`;

const Home = () => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    if (isRegister) {
      try {
        const data = await registerUser(values);
        if (data.code === 0) {
          message.success('注册成功！');
          login({
            username: values.username,
            nickname: values.nickname,
            id: data.userId,
            token: data.token
          });
        } else if (data.code === 2) {
          message.error('用户名已存在，请重新输入！');
        }
      } catch (error) {
        message.error('注册失败，请检查网络连接！');
        console.error('注册错误：', error);
      }
    } else {
      try {
        const data = await loginUser(values.username, values.password);
        message.success('登录成功！');
        login({
          username: values.username,
          token: data.token
        });
      } catch (error) {
        message.error('登录失败，请检查网络连接！');
        console.error('登录错误：', error);
      }
    }
  };

  return (
    <HomeWrapper>
      <HomeTitle level={1}>个人云存储系统</HomeTitle>
      <HomeCard title={isRegister ? "用户注册" : "用户登录"}>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          {isRegister && (
            <>
              <Form.Item
                name="nickname"
                rules={[{ required: true, message: '请输入昵称！' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="昵称"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱！' },
                  { type: 'email', message: '请输入有效的邮箱地址！' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="邮箱"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号码！' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码！' }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="手机号码"
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          {isRegister && (
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码！' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致！'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认密码"
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {isRegister ? '注册' : '登录'}
            </Button>
          </Form.Item>
        </Form>
        <div
          className="register-link"
          onClick={() => {
            setIsRegister(!isRegister);
            form.resetFields();
          }}
        >
          {isRegister ? '已有账号？点击登录' : '没有账号？点击注册'}
        </div>
      </HomeCard>
    </HomeWrapper>
  );
};

export default Home;