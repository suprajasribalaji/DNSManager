import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase-config";
import { Form, Input, Button, Typography, message } from 'antd';
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Buttons } from '../components/theme/color.tsx';
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (values: { email: string; password: string }) => {
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      navigate("/");
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        message.error("You're already a user. Please Log In.");
        navigate("/");
      } else {
        setError(error.message);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      navigate("/dashboard");
      console.log(result);
    } catch (error) {
      console.error(error);
      message.error("Google Sign-In failed. Please try again.");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const handleBackNavigation = () => {
    navigate("/");
  };

  return (
    <StyledContainer>
      <StyledFormContainer>
        <StyledBackButton type='link' onClick={handleBackNavigation}><ArrowLeftOutlined /></StyledBackButton>
        <StyledTitle level={3}>NEW USER !?</StyledTitle>
        <StyledForm onFinish={handleSignUp} onFinishFailed={onFinishFailed}>
          <StyledFormItem
            label="Email"
            name="email"
            rules={[
              { type: 'email', message: 'Please enter a valid email!' },
              { required: true, message: 'Please enter your email!' },
            ]}
          >
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </StyledFormItem>
          <StyledFormItem
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter your password!' },
            ]}
          >
            <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} />
          </StyledFormItem>
          <StyledFormSubmitButton>
            <StyledButton type="link" htmlType="submit">Sign Up</StyledButton>
            <StyledGoogleButton onClick={handleGoogleSignUp}>Sign Up with Google</StyledGoogleButton>
          </StyledFormSubmitButton>
        </StyledForm>
        {error && <p>{error}</p>}
      </StyledFormContainer>
    </StyledContainer>
  );
};

export default SignUp;

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const StyledFormContainer = styled.div`
  width: 30%;
  padding: 20px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const StyledForm = styled(Form)`
  margin : 5%;
  margin-top: 8%;
`;

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 8%;
`;

const StyledButton = styled(Button)`
  width: 30%;
  margin-top: 5%;
  margin-left: 15%;
  background-color: ${Buttons.backgroundColor};
  color: ${Buttons.text};
  border: none;
  &&&:hover{
      color: ${Buttons.hover};
  }
`;

const StyledGoogleButton = styled(StyledButton)`
  margin-top: 5%;
  width: 42%;
  margin-left: 4%;
`;

const StyledFormSubmitButton = styled.div`
  display: flex;
`;

const StyledTitle = styled(Title)`
  text-align: center
`;

const StyledBackButton = styled(Button)`
  margin: 0;
  color: ${Buttons.backgroundColor};
  &&&:hover{
    color: ${Buttons.hover};
  }
`;