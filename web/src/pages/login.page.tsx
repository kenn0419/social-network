import { Form, Input, Button, Card, message, notification } from "antd";
import { FaUser, FaLock, FaGoogle, FaGithub } from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  loginFailure,
  loginStart,
  loginSuccess,
} from "../store/slices/authSlice";
import authService from "../services/authService";
import { useAppDispatch, useAppSelector } from "../store";
import { useEffect } from "react";

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      dispatch(loginStart());
      const response = await authService.login(values);
      localStorage.setItem("access_token", response.accessToken);
      dispatch(loginSuccess(response));
      message.success("Đăng nhập thành công!");
      navigate("/");
    } catch (error: any) {
      console.log(error);
      dispatch(
        loginFailure(error?.response?.data?.message || "Đăng nhập thất bại!")
      );
      message.error(error?.response?.data?.message || "Đăng nhập thất bại!");
    }
  };
  const showPopupLogin = (type: string) => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const loginURL = `${
      import.meta.env.VITE_BACKEND_URL
    }/oauth2/authorization/${type}`;

    window.open(
      loginURL,
      "_blank",
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };
  const handleGoogleLogin = () => {
    showPopupLogin("google");
  };

  const handleGithubLogin = () => {
    showPopupLogin("github");
  };

  useEffect(() => {
    if (error) {
      notification.error({
        message: "Authentication Error",
        description: error,
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-200">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-0">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">
          Đăng nhập
        </h1>
        <div className="flex flex-col gap-3 mb-4">
          <Button
            icon={<FaGoogle className="mr-2" />}
            className="w-full flex items-center justify-center border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            onClick={handleGoogleLogin}
          >
            Đăng nhập với Google
          </Button>
          <Button
            icon={<FaGithub className="mr-2" />}
            className="w-full flex items-center justify-center border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            onClick={handleGithubLogin}
          >
            Đăng nhập với GitHub
          </Button>
        </div>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Hoặc đăng nhập bằng email
            </span>
          </div>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
            style={{ marginBottom: "10px" }}
          >
            <Input prefix={<FaUser />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<FaLock />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold"
              size="large"
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <div className="flex justify-between text-sm">
            <Link to="/register" className="text-indigo-600 hover:underline">
              Đăng ký tài khoản mới
            </Link>
            <a
              href="/forgot-password"
              className="text-gray-500 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
