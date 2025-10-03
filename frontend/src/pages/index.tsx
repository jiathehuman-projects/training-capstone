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
              Night Bao 夜包子
            </span>
          </h1>
          <div className={subtitle({ class: "mb-8 text-white" })}>
            Your midnight Dim Sum joint • Authentic dim sum with a modern twist
          </div>
          
          {/* Dim Sum Image */}
          <div className="mb-8">
            <img 
            src="https://cdn.pixabay.com/photo/2021/10/10/16/30/food-6697404_1280.jpg"
              // src="https://images.unsplash.com/photo-1496116218417-1a781b1c416c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
              alt="Authentic dim sum spread with various steamed dumplings and buns"
              className="w-full max-w-4xl h-64 md:h-80 object-cover rounded-xl shadow-2xl border border-gray-700"
            />
          </div>

        </div>
        
        </section>
    </DefaultLayout>
  );
}
