import Link from "next/link";
import { blogPosts } from "@/lib/blog-data";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";

export const metadata = {
  title: "Blog & Resources",
  description: "Learn the best strategies for managing your online reputation and getting more Google reviews.",
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Resources & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700">Insights</span>
            </h1>
            <p className="text-lg text-slate-600">
              Expert advice on local SEO, reputation management, and turning happy customers into your best marketing channel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group h-full">
                <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="aspect-video relative overflow-hidden bg-slate-100">
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h2>
                    
                    <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center text-emerald-600 font-bold text-sm mt-auto">
                      Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} ReviewFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
