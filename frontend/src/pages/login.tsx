import { useState } from "react";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useNavigate } from "react-router-dom";
import { authAPI, type LoginRequest } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

// Simple eye icons
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeSlashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

interface LoginForm {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginForm>({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const loginData: LoginRequest = {
        username: formData.username,
        password: formData.password
      };
      
      console.log('Attempting login with:', { username: loginData.username });
      
      const response = await authAPI.login(loginData);
      
      console.log('Login successful:', response);
      
      // Store token and user data using auth context
      login(response.token, response.user);
      
      // Show success toast
      addToast({
        title: "Login successful!",
        description: "Welcome back.",
        color: "success",
      });
      
      // Redirect based on user role
      const isStaffUser = response.user.roles && 
        response.user.roles.length > 0 && 
        !response.user.roles.includes('manager') && 
        !response.user.roles.includes('admin');
      
      if (isStaffUser) {
        navigate('/staff');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show a generic validation error to maintain UX consistency
      if (error.response?.status === 401) {
        setErrors({ username: 'Invalid username or password' });
      } else if (error.response?.status >= 500) {
        setErrors({ username: 'Server error. Please try again later.' });
      } else {
        setErrors({ username: 'Login failed. Please check your credentials.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <DefaultLayout>
      <section className="min-h-full flex items-center justify-center relative py-12">
        
        <div className="relative w-full max-w-md mx-auto p-6">
          <div className="bg-white border border-gray-300 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className={title({ size: "md", class: "mb-4" })}>
                <span className="bg-gradient-to-r from-gray-400 to-white bg-clip-text text-transparent font-bold">
                  Welcome Back
                </span>
              </h1>
              <div className={subtitle({ class: "text-gray-600" })}>
                Sign in to your account
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  label="Username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  isInvalid={!!errors.username}
                  errorMessage={errors.username}
                  classNames={{
                    input: "bg-white text-black",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-500 focus-within:border-blue-500 shadow-sm",
                    label: "text-black"
                  }}
                />
              </div>

              <div>
                <Input
                  type={isPasswordVisible ? "text" : "password"}
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  isInvalid={!!errors.password}
                  errorMessage={errors.password}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      {isPasswordVisible ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                      )}
                    </button>
                  }
                  classNames={{
                    input: "bg-white text-black",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-500 focus-within:border-blue-500 shadow-sm",
                    label: "text-black"
                  }}
                />
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                size="lg"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link 
                  href="/register" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
