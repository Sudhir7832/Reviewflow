import { blogPosts } from "@/lib/blog-data";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import ReactMarkdown from 'react-markdown'; // We might need to install this, or just use basic HTML if we don't have it. Since we don't want to run npm install, we will parse basic markdown manually or just render it carefully.

// For MVP, we will render the markdown text safely or just use simple formatting since it's hardcoded.
// Since we wrote the markdown with # and ##, we can do a simple custom renderer to avoid dependencies.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = blogPosts.find((p) => p.slug === resolvedParams.slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage }],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = blogPosts.find((p) => p.slug === resolvedParams.slug);

  if (!post) {
    notFound();
  }

  // Very basic markdown to HTML for MVP
  const formattedContent = post.content
    .split('\\n\\n')
    .map(paragraph => {
      if (paragraph.trim().startsWith('# ')) {
        return \`<h1 class="text-3xl font-black mt-8 mb-4 text-slate-900">\${paragraph.replace('# ', '')}</h1>\`;
      }
      if (paragraph.trim().startsWith('## ')) {
        return \`<h2 class="text-2xl font-bold mt-8 mb-4 text-slate-900">\${paragraph.replace('## ', '')}</h2>\`;
      }
      if (paragraph.trim().startsWith('*') && paragraph.trim().endsWith('*')) {
         return \`<p class="text-lg italic text-slate-700 my-4 border-l-4 border-emerald-500 pl-4 bg-emerald-50/50 py-2">\${paragraph.replace(/\\*/g, '')}</p>\`;
      }
      return \`<p class="text-lg text-slate-700 leading-relaxed my-4">\${paragraph.trim().replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>').replace(/\\*(.*?)\\*/g, '<em>$1</em>')}</p>\`;
    })
    .join('');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
          </Link>

          <header className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <Calendar className="w-4 h-4 text-emerald-500" />
                {new Date(post.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <User className="w-4 h-4 text-indigo-500" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <Clock className="w-4 h-4 text-amber-500" />
                {post.readTime}
              </span>
            </div>
          </header>

          <div className="aspect-[2/1] w-full relative rounded-3xl overflow-hidden mb-12 shadow-xl bg-slate-200">
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />

          <div className="mt-16 pt-8 border-t border-slate-200 text-center">
            <h3 className="text-2xl font-bold mb-4">Want to protect your reputation?</h3>
            <p className="text-slate-600 mb-6">Start getting more 5-star reviews and intercepting the bad ones today.</p>
            <Link href="/signup">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                Start Free Trial
              </button>
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
