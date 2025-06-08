import { Form, Input, Button, Card, message } from "antd";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import TextArea from "antd/es/input/TextArea";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      if (values.password !== values.confirmPassword) {
        message.error("Mật khẩu xác nhận không khớp!");
        return;
      }
      await authService.register(values);
      message.success(
        "Đăng ký thành công. Vui lòng truy cập email để xác thực tài khoản!"
      );
      navigate("/login");
    } catch (error: any) {
      message.error(error.response.message || "Đăng ký thất bại!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Đăng ký</h1>
        <Form
          name="register"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="lastName"
            rules={[
              { required: true, message: "Vui lòng nhập họ người dùng!" },
            ]}
          >
            <Input
              prefix={<FaUser />}
              placeholder="Họ người dùng"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="firstName"
            rules={[
              { required: true, message: "Vui lòng nhập tên người dùng!" },
            ]}
          >
            <Input
              prefix={<FaUser />}
              placeholder="Tên người dùng"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<FaEnvelope />} placeholder="Email" size="large" />
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

          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu!" }]}
          >
            <Input.Password
              prefix={<FaLock />}
              placeholder="Xác nhận mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="address"
            rules={[
              { required: true, message: "Vui lòng nhập họ người dùng!" },
            ]}
          >
            <TextArea
              placeholder="Địa chỉ của bạn"
              autoSize={{ minRows: 1, maxRows: 6 }}
              className="flex-1 bg-[#3a3b3c] text-black border-none !text-[18px] !px-2"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              size="large"
            >
              Đăng ký
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
