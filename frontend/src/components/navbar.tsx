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
import { getPrimaryRole } from '@/components/roleUtils';

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
    <HeroUINavbar maxWidth="xl" position="sticky" className="bg-black backdrop-blur-sm border-b border-gray-700">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-2 hover:opacity-80 transition-opacity"
            href="/"
          >
            <Logo />
            <p className="font-bold text-lg bg-gradient-to-r from-gray-400 to-white bg-clip-text text-transparent">
              NIGHT BAO
            </p>
          </Link>
        </NavbarBrand>
      </NavbarContent>



      <NavbarContent justify="end">
        {isAuthenticated ? (
          <>
            <NavbarItem className="hidden sm:flex">
              <span className="text-white">Welcome, {user?.firstName || user?.username}</span>
            </NavbarItem>
            <NavbarItem>
              <Link
                href={(function(){
                  const primary = getPrimaryRole(user?.roles);
                  if (primary === 'staff') return '/staff';
                  if (primary === 'manager' || primary === 'admin') return '/manager';
                  return '/dashboard';
                })()}
                className={buttonStyles({
                  variant: "flat",
                  radius: "full",
                  size: "sm",
                  class: "bg-blue-600 hover:bg-blue-700 text-white mr-2"
                })}
              >
                Dashboard
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Button
                onClick={handleLogout}
                className={buttonStyles({
                  variant: "bordered",
                  radius: "full",
                  size: "sm",
                  class: "border-white text-white hover:border-blue-400 hover:text-blue-400"
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
                  class: "text-white hover:text-blue-400"
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
                  class: "bg-blue-600 hover:bg-blue-700 text-white"
                })}
              >
                Sign Up
              </Link>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </HeroUINavbar>
  );
};
