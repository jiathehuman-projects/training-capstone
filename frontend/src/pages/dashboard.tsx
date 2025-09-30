import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function DashboardPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>
            <span className="bg-gradient-to-r from-gray-400 to-white bg-clip-text text-transparent font-bold">
              Dashboard
            </span>
          </h1>
          <div className={subtitle({ class: "mt-4 text-white" })}>
            Welcome to your dashboard! This is a skeleton page that will be developed further.
          </div>
        </div>
        
        <div className="flex flex-col gap-4 mt-8 w-full max-w-2xl">
          <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-black mb-2">Quick Stats</h2>
            <p className="text-gray-600">Your dashboard content will appear here.</p>
          </div>
          
          <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-black mb-2">Recent Activity</h2>
            <p className="text-gray-600">Recent activities will be displayed here.</p>
          </div>
          
          <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-black mb-2">Actions</h2>
            <p className="text-gray-600">Available actions and shortcuts will appear here.</p>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}