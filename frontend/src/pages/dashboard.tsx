import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function DashboardPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <div className={subtitle({ class: "mt-4" })}>
            Welcome to your dashboard! This is a skeleton page that will be developed further.
          </div>
        </div>
        
        <div className="flex flex-col gap-4 mt-8 w-full max-w-2xl">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Quick Stats</h2>
            <p className="text-gray-400">Your dashboard content will appear here.</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Recent Activity</h2>
            <p className="text-gray-400">Recent activities will be displayed here.</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-2">Actions</h2>
            <p className="text-gray-400">Available actions and shortcuts will appear here.</p>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}