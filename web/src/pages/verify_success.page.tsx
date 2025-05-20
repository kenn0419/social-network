import { Result, Button } from "antd";
import { Link } from "react-router-dom";

const VerifySuccess = () => (
  <Result
    status="success"
    title="Xác minh tài khoản thành công!"
    subTitle="Tài khoản của bạn đã được xác minh. Bạn có thể đăng nhập ngay bây giờ."
    extra={[
      <Link to="/login" key="login">
        <Button type="primary">Đăng nhập</Button>
      </Link>,
    ]}
  />
);

export default VerifySuccess;
