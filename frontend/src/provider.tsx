import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { ToastProvider } from "@heroui/toast";
import { AuthProvider } from "@/contexts/AuthContext";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ToastProvider 
        placement="top-right"
        toastProps={{
          variant: "flat",
          radius: "md",
          classNames: {
            base: "bg-gray-800/90 border border-gray-700 text-white",
            title: "text-white",
            description: "text-gray-300",
          },
        }}
      />
      <AuthProvider>
        {children}
      </AuthProvider>
    </HeroUIProvider>
  );
}
