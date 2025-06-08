import React, { useEffect } from "react";

const OAuth2SuccessPage: React.FC = () => {
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (token && window.opener) {
      window.opener.postMessage({ token }, window.origin);
      window.close();
    }
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <p>Đang đăng nhập, vui lòng chờ...</p>
    </div>
  );
};

export default OAuth2SuccessPage;
