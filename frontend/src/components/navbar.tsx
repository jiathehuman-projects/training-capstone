import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { button as buttonStyles } from "@heroui/theme";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/toast";

import { Logo } from "@/components/icons";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    addToast({
      title: "Logged out successfully",
      color: "success",
    });
    navigate("/");
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky" className="bg-black/90 backdrop-blur-sm border-b border-gray-800">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-2 hover:opacity-80 transition-opacity"
            href="/"
          >
            <Logo />
            <p className="font-bold text-white text-lg bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              DIM SUMTHING WONG
            </p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="center" className="hidden sm:flex">
        <NavbarItem>
          <Link
            href="/"
            className="text-gray-300 hover:text-purple-400 transition-colors font-medium"
          >
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/menu"
            className="text-gray-300 hover:text-purple-400 transition-colors font-medium"
          >
            Menu
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="/about"
            className="text-gray-300 hover:text-purple-400 transition-colors font-medium"
          >
            About
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        {isAuthenticated ? (
          <>
            <NavbarItem className="hidden sm:flex">
              <span className="text-gray-300">Welcome, {user?.firstName || user?.username}</span>
            </NavbarItem>
            <NavbarItem>
              <Button
                onClick={handleLogout}
                className={buttonStyles({
                  variant: "bordered",
                  radius: "full",
                  size: "sm",
                  class: "border-gray-600 text-gray-300 hover:border-purple-500 hover:text-purple-400"
                })}
              >
                Log Out
              </Button>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem>
              <Link
                href="/login"
                className={buttonStyles({
                  variant: "light",
                  radius: "full",
                  size: "sm",
                  class: "text-gray-300 hover:text-purple-400"
                })}
              >
                Login
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                href="/register"
                className={buttonStyles({
                  color: "primary",
                  variant: "flat",
                  radius: "full",
                  size: "sm",
                  class: "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                })}
              >
                Sign Up
              </Link>
            </NavbarItem>
          </>
        )}
        <NavbarItem>
          <Link
            href="/order"
            className={buttonStyles({
              color: "primary",
              variant: "shadow",
              radius: "full", 
              size: "sm",
              class: "bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold ml-2"
            })}
          >
            Order Now
          </Link>
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
};
