import React, { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "antd";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import userService from "../../services/userService";
import { UserResponse } from "../../types/api";

const SearchBar: React.FC = () => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<UserResponse[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch] = useDebounce(search, 400);
  const navigate = useNavigate();

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
          console.log(err);
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
    <div className="relative w-[320px]">
      <Input
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
        <div className="absolute top-[55px] left-0 w-full bg-white border border-[#eee] rounded-lg shadow-md z-10 max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-[#888]">Đang tìm kiếm...</div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-[#888]">Không tìm thấy người dùng</div>
          ) : (
            <>
              {suggestions.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center px-2 py-2 cursor-pointer hover:bg-gray-100"
                >
                  <img
                    src={user.avatarUrl || "https://i.pravatar.cc/40"}
                    alt={user.firstName + " " + user.lastName}
                    className="w-9 h-9 rounded-full mr-3"
                  />
                  <span className="flex-1">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              ))}
              <div
                className="text-center text-[#1877f2] cursor-pointer border-t border-[#eee] py-2 hover:bg-gray-50"
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
