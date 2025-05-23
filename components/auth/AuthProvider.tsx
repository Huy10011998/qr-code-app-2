import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Định nghĩa kiểu dữ liệu cho userData
interface UserData {
  id: string | null;
  userId: string | null;
  fullName: string | null;
  department: string | null;
  email: string | null;
  phoneNumber: string | null;
}

// Định nghĩa kiểu cho AuthContext
interface AuthContextType {
  userData: UserData;
  setUserData: (userData: UserData) => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData>({
    id: null,
    userId: null,
    fullName: null,
    department: null,
    email: null,
    phoneNumber: null,
  });

  // Hàm cập nhật userData và lưu vào AsyncStorage
  const setInfoUser = async (newUserData: UserData) => {
    try {
      setUserData(newUserData);
      await AsyncStorage.setItem("userData", JSON.stringify(newUserData));
    } catch (error) {
      console.error("Error saving userData:", error);
    }
  };

  // Hàm cập nhật token: lưu AsyncStorage + cập nhật state
  const updateToken = async (newToken: string | null) => {
    try {
      if (newToken) {
        await AsyncStorage.setItem("token", newToken);
      } else {
        await AsyncStorage.removeItem("token");
      }
      setToken(newToken);
    } catch (error) {
      console.error("Error saving token:", error);
    }
  };

  // Tải token và userData từ AsyncStorage khi app khởi động
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        const savedUserData = await AsyncStorage.getItem("userData");

        if (savedToken) {
          setToken(savedToken);
        }

        if (savedUserData) {
          setUserData(JSON.parse(savedUserData));
        }
      } catch (error) {
        console.error("Failed to load auth from storage:", error);
      }
    };

    loadStoredAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData: setInfoUser,
        token,
        setToken: updateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
