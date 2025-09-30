import { useState } from "react";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useNavigate } from "react-router-dom";
import { authAPI, type RegisterRequest } from "@/services/api";
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

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  repeat_password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  repeat_password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    repeat_password: "",
    firstName: "",
    lastName: "",
    phone: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      newErrors.username = "Username must be between 3 and 30 characters";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      newErrors.username = "Username must contain only letters and numbers";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.length > 255) {
      newErrors.email = "Email must be less than 255 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8 || formData.password.length > 30) {
      newErrors.password = "Password must be between 8 and 30 characters";
    }

    // Confirm password validation
    if (!formData.repeat_password) {
      newErrors.repeat_password = "Please confirm your password";
    } else if (formData.password !== formData.repeat_password) {
      newErrors.repeat_password = "Passwords do not match";
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length > 100) {
      newErrors.firstName = "First name must be less than 100 characters";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length > 100) {
      newErrors.lastName = "Last name must be less than 100 characters";
    }

    // Phone validation (optional)
    if (formData.phone && formData.phone.length > 50) {
      newErrors.phone = "Phone number must be less than 50 characters";
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
      const registerData: RegisterRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        repeat_password: formData.repeat_password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      };
      
      const response = await authAPI.register(registerData);
      
      // Store token and user data using auth context
      login(response.token, response.user);
      
      // Show success toast
      addToast({
        title: "Registration successful!",
        description: "Welcome to our platform.",
        color: "success",
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show a generic validation error to maintain UX consistency
      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        if (errorData?.error?.includes('email')) {
          setErrors({ email: 'Email is already registered' });
        } else if (errorData?.error?.includes('username')) {
          setErrors({ username: 'Username is already taken' });
        } else {
          setErrors({ username: 'Registration failed. Please check your information.' });
        }
      } else if (error.response?.status >= 500) {
        setErrors({ username: 'Server error. Please try again later.' });
      } else {
        setErrors({ username: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <DefaultLayout>
      <section className="min-h-full flex items-center justify-center relative py-12">
        
        <div className="relative w-full max-w-2xl mx-auto p-6">
          <div className="bg-white border border-gray-300 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className={title({ size: "md", class: "mb-4" })}>
                <span className="bg-gradient-to-r from-gray-400 to-white bg-clip-text text-transparent font-bold">
                  Join the Experience
                </span>
              </h1>
              <div className={subtitle({ class: "text-gray-600" })}>
                Create your account and start your dim sum journey
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username and Email Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Username"
                  placeholder="Enter username"
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
                <Input
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  isInvalid={!!errors.email}
                  errorMessage={errors.email}
                  classNames={{
                    input: "bg-white text-black",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-500 focus-within:border-blue-500 shadow-sm",
                    label: "text-black"
                  }}
                />
              </div>

              {/* First Name and Last Name Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="First Name"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  isInvalid={!!errors.firstName}
                  errorMessage={errors.firstName}
                  classNames={{
                    input: "bg-white text-black",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-500 focus-within:border-blue-500 shadow-sm",
                    label: "text-black"
                  }}
                />
                <Input
                  type="text"
                  label="Last Name"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  isInvalid={!!errors.lastName}
                  errorMessage={errors.lastName}
                  classNames={{
                    input: "bg-white text-black",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-500 focus-within:border-blue-500 shadow-sm",
                    label: "text-black"
                  }}
                />
              </div>

              {/* Phone (Optional) */}
              <Input
                type="tel"
                label="Phone (Optional)"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                isInvalid={!!errors.phone}
                errorMessage={errors.phone}
                classNames={{
                  input: "bg-white text-black",
                  inputWrapper: "bg-white border-gray-300 hover:border-blue-500 focus-within:border-blue-500 shadow-sm",
                  label: "text-black"
                }}
              />

              {/* Password Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  type={isPasswordVisible ? "text" : "password"}
                  label="Password"
                  placeholder="Enter password"
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
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-purple-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-purple-400" />
                      )}
                    </button>
                  }
                  classNames={{
                    input: "bg-white text-black",
                    inputWrapper: "bg-white border-gray-300 hover:border-blue-500 focus-within:border-blue-500 shadow-sm",
                    label: "text-black"
                  }}
                />
                <Input
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  label="Confirm Password"
                  placeholder="Confirm password"
                  value={formData.repeat_password}
                  onChange={(e) => handleInputChange("repeat_password", e.target.value)}
                  isInvalid={!!errors.repeat_password}
                  errorMessage={errors.repeat_password}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    >
                      {isConfirmPasswordVisible ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-purple-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-purple-400" />
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
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
