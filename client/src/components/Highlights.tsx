import { Play, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Link } from "wouter";

interface YoutubePost {
  id: number;
  title: string;
  description: string | null;
  youtube_id: string;
  youtube_url: string;
  created_at: string;
}

export default function Highlights() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['/api/youtube-posts-highlights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('youtube_posts')
        .select('id, title, description, youtube_id, youtube_url, created_at')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) {
        // Fallback to ordering by id if created_at fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('youtube_posts')
          .select('id, title, description, youtube_id, youtube_url, created_at')
          .order('id', { ascending: false })
          .limit(4);
        
        if (fallbackError) throw fallbackError;
        return fallbackData as YoutubePost[];
      }
      
      return data as YoutubePost[];
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  const renderVideoCard = (post: YoutubePost) => (
    <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <a
        href={post.youtube_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block aspect-video bg-gray-900 relative group cursor-pointer"
      >
        <img 
          src={`https://img.youtube.com/vi/${post.youtube_id}/hqdefault.jpg`}
          alt={post.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-colors">
          <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <ExternalLink className="w-5 h-5 text-white opacity-80" />
        </div>
      </a>
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2">{post.title}</h3>
        <p className="text-gray-600 text-sm">
          {post.description || "New video coming soon."}
        </p>
        <div className="mt-2 flex items-center text-red-600 text-sm font-medium">
          <Play className="w-4 h-4 mr-1" fill="currentColor" />
          YouTube에서 보기
        </div>
      </div>
    </div>
  );

  const renderEmptyCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
      <div className="aspect-video bg-gray-200 flex items-center justify-center">
        <Play className="w-16 h-16 text-gray-400" fill="currentColor" />
      </div>
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2">No videos yet</h3>
        <p className="text-gray-600 text-sm">New videos coming soon.</p>
      </div>
    </div>
  );

  const renderSkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
      <div className="aspect-video bg-gray-200"></div>
      <div className="p-6">
        <div className="h-5 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );

  return (
    <section className="py-32 bg-gray-50 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-black mb-6">Last Week on the Court</h2>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
            내 플레이를 직접 확인할 수 있습니다.<br />매주 쌓이는 나만의 농구 기록
          </p>
        </div>

        {error && (
          <div className="text-center mb-8">
            <p className="text-red-600 text-sm">Failed to load videos.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            // Loading state - show 4 skeleton cards
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`}>
                {renderSkeletonCard()}
              </div>
            ))
          ) : posts && posts.length > 0 ? (
            // Show actual data
            posts.map(renderVideoCard)
          ) : (
            // Empty state - show 4 placeholder cards
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`empty-${index}`}>
                {renderEmptyCard()}
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/board" 
            className="text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            See more →
          </Link>
        </div>
      </div>
    </section>
  );
}
