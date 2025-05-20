import React, { useState, useRef, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "antd";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import userService, { User } from "../../services/userService";

const SearchBar: React.FC = () => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch] = useDebounce(search, 400);
  const navigate = useNavigate();
  const inputRef = useRef<any>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (debouncedSearch.trim()) {
        setLoading(true);
        try {
          const response = await userService.searchUser({
            pageNo: "1",
            pageSize: "5",
            search: debouncedSearch.trim(),
          });
          setSuggestions(response.data);
        } catch (err) {
          setSuggestions([]);
        } finally {
          setLoading(false);
          setShowDropdown(true);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    };
    fetchUsers();
  }, [debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/search?query=${encodeURIComponent(search)}`);
      setShowDropdown(false);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleFocus = () => {
    if (search) setShowDropdown(true);
  };

  return (
    <div style={{ position: "relative", width: 320 }}>
      <Input
        ref={inputRef}
        placeholder="Tìm kiếm trên Facebook"
        prefix={<FaSearch className="text-gray-500" />}
        className="!p-2 !rounded-full bg-[#f0f2f5] border-none text-black placeholder-gray-500 !text-[18px]"
        value={search}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: 55,
            left: 0,
            width: "100%",
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            zIndex: 10,
            maxHeight: 300,
            overflowY: "auto",
          }}
        >
          {loading ? (
            <div style={{ padding: 16, color: "#888" }}>Đang tìm kiếm...</div>
          ) : suggestions.length === 0 ? (
            <div style={{ padding: 16, color: "#888" }}>
              Không tìm thấy người dùng
            </div>
          ) : (
            <>
              {suggestions?.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0px 10px",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={user.avatarUrl || "https://i.pravatar.cc/40"}
                    alt={user.firstName + " " + user.lastName}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      marginRight: 12,
                    }}
                  />
                  <span style={{ flex: 1 }}>
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              ))}
              <div
                style={{
                  padding: "2px !important",
                  textAlign: "center",
                  color: "#1877f2",
                  cursor: "pointer",
                  borderTop: "1px solid #eee",
                }}
                onMouseDown={() => {
                  navigate(`/search?query=${encodeURIComponent(search)}`);
                  setShowDropdown(false);
                }}
              >
                Xem tất cả kết quả cho "{search}"
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
