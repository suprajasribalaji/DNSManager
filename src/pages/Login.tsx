import React, { useState } from "react";
import { Form, Input, Button, Typography, message, Space } from "antd";
import styled from "styled-components";
import { auth } from "../firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Buttons } from "../components/theme/color.tsx";

const { Title } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success("Logged in Successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setLoading(false);
      message.error("Please Enter Valid Credentials.");
    }
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <StyledContainer>
      <StyledFormContainer>
        <Title level={2} style={{ textAlign: "center" }}>
          Welcome
        </Title>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              {
                type: "email",
                message: "Please enter a valid email address!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <StyledButton
              type="link"
              htmlType="submit"
              block
              loading={loading}
            >
              LOGIN
            </StyledButton>
          </Form.Item>
        </Form>
        <SignupButton>
          <Space>
          <InfoAboutSignup>Don't have an account?</InfoAboutSignup>  
          <StyledSignupButton type="link" onClick={handleSignUp}>Sign Up</StyledSignupButton>
          </Space>
          </SignupButton>
      </StyledFormContainer>
    </StyledContainer>
  );
};

export default Login;

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const StyledFormContainer = styled.div`
  width: 22%;

`;

const StyledButton = styled(Button)`
  background-color: ${Buttons.backgroundColor};
  color: ${Buttons.text};
  border: none;
  &&&:hover {
    color: ${Buttons.hover};
  }
`;

const SignupButton = styled.div`
  display: flex;
  margin-left: 8.5%;
`;

const InfoAboutSignup = styled.div`
  font-family: sans-serif;
`;

const StyledSignupButton = styled(Button)`
  border: none;
  &&&:hover {
    color: ${Buttons.hover}
  }
  color: ${Buttons.backgroundColor}
`;