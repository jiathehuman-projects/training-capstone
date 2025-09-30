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
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Dim Sumthing Wong
            </span>
          </h1>
          <div className={subtitle({ class: "mb-8 text-gray-300" })}>
            Your midnight Dim Sum joint • Authentic dim sum with a modern twist
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              className={buttonStyles({
                color: "primary",
                variant: "shadow",
                radius: "full",
                size: "lg",
                class: "bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-8 py-3"
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
                class: "border-purple-500 text-purple-400 hover:text-purple-300 px-8 py-3"
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
