import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-white">
            404 Not Found
          </h1>
          
          <p className="text-gray-300 text-lg">
            Check your URL? You might have made a typo
          </p>
          
          <Button
            onClick={handleGoHome}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            size="lg"
          >
            Go Home
          </Button>
        </div>
      </section>
    </DefaultLayout>
  );
}