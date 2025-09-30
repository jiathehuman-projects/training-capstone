import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";

import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center overflow-hidden">
      
        <div className="relative z-10 text-center max-w-4xl mx-auto pt-30">
          <h1 className={title({ size: "lg", class: "mb-6" })}>
            <span className="bg-gradient-to-r from-gray-400 to-white bg-clip-text text-transparent font-bold">
              Dim Sumthing Wong
            </span>
          </h1>
          <div className={subtitle({ class: "mb-8 text-white" })}>
            Your midnight Dim Sum joint • Authentic dim sum with a modern twist
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              className={buttonStyles({
                color: "primary",
                variant: "shadow",
                radius: "full",
                size: "lg",
                class: "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 shadow-lg"
              })}
              href="/order"
            >
              Order Now
            </Link>
            <Link
              className={buttonStyles({
                variant: "bordered",
                radius: "full", 
                size: "lg",
                class: "border-black text-black hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 px-8 py-3 shadow-sm"
              })}
              href="#menu"
            >
              View Menu
            </Link>
          </div>

        </div>
        
        </section>
    </DefaultLayout>
  );
}
