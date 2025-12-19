import { useState, useEffect, useCallback } from "react";
import { Play, ExternalLink, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface YoutubePost {
  id: number;
  title: string;
  description: string | null;
  youtube_id: string;
  youtube_url: string;
  created_at: string;
}

const pageSize = 12;

// Helper to fetch one page with search, ordering, and fallback
async function fetchPage(q: string, cursor?: { created_at?: string; id?: number }): Promise<YoutubePost[]> {
  let query = supabase
    .from('youtube_posts')
    .select('id, title, description, youtube_id, youtube_url, created_at');

  if (q.trim()) {
    query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`);
  }

  // default ordering by created_at desc
  query = query.order('created_at', { ascending: false }).limit(pageSize);

  // cursor pagination (by created_at)
  if (cursor?.created_at) {
    query = query.lt('created_at', cursor.created_at);
  }

  const { data, error } = await query;

  // fallback to id desc if created_at fails
  if (error) {
    let fb = supabase
      .from('youtube_posts')
      .select('id, title, description, youtube_id, youtube_url, created_at');
    if (q.trim()) {
      fb = fb.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`);
    }
    const { data: fbData, error: fbErr } = await fb.order('id', { ascending: false }).limit(pageSize);
    if (fbErr) throw fbErr;
    return (fbData ?? []) as YoutubePost[];
  }

  return (data ?? []) as YoutubePost[];
}

export default function BoardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [allPosts, setAllPosts] = useState<YoutubePost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/youtube-posts-board', debouncedQuery],
    queryFn: () => fetchPage(debouncedQuery),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
  
  // Sync query data to local state
  useEffect(() => {
    if (!data) {
      setAllPosts([]);
      setHasMore(true);
      return;
    }
    setAllPosts(data);
    setHasMore(data.length === pageSize);
  }, [data, debouncedQuery]);
  
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || allPosts.length === 0) return;

    setLoadingMore(true);
    try {
      const last = allPosts[allPosts.length - 1];
      const next = await fetchPage(debouncedQuery, { created_at: last.created_at, id: last.id });

      const existing = new Set(allPosts.map(p => p.id));
      const unique = next.filter(p => !existing.has(p.id));

      setAllPosts(prev => [...prev, ...unique]);
      setHasMore(next.length === pageSize);
    } catch (e) {
      console.error('Error loading more posts:', e);
    } finally {
      setLoadingMore(false);
    }
  }, [allPosts, debouncedQuery, hasMore, loadingMore]);
  
  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setAllPosts([]);
    setHasMore(true);
  };
  
  // Reset to first page when search changes
  useEffect(() => {
    refetch();
  }, [debouncedQuery, refetch]);

  const renderVideoCard = (post: YoutubePost) => (
    <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative">
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
      </div>
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2">{post.title}</h3>
        <p className="text-gray-600 text-sm mb-3">
          {post.description || "New video coming soon."}
        </p>
        {post.created_at && (
          <p className="text-gray-400 text-xs mb-2">
            Posted on {formatDate(post.created_at)}
          </p>
        )}
        <div className="flex items-center text-red-600 text-sm font-medium">
          <Play className="w-4 h-4 mr-1" fill="currentColor" />
          YouTube에서 보기
        </div>
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
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-black mb-6">Video Board</h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
            25년을 개편으로, 개인 동영상에 전체 동영상으로 변경
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
                data-testid="input-search"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  data-testid="button-clear-search"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {debouncedQuery && (
              <p className="text-sm text-gray-600 mt-2">
                Searching for "{debouncedQuery}"
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="text-center mb-8">
            <p className="text-red-600">Failed to load videos.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading ? (
            // Loading state
            Array.from({ length: 12 }).map((_, index) => (
              <div key={`skeleton-${index}`}>
                {renderSkeletonCard()}
              </div>
            ))
          ) : allPosts.length > 0 ? (
            // Show actual data
            allPosts.map(renderVideoCard)
          ) : (
            // Empty state
            <div className="col-span-full text-center py-16">
              <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" />
                <h3 className="font-bold text-lg mb-2">
                  {debouncedQuery ? 'No videos found' : 'No videos yet'}
                </h3>
                <p className="text-gray-600">
                  {debouncedQuery 
                    ? `No results for "${debouncedQuery}"` 
                    : 'New videos coming soon.'
                  }
                </p>
                {debouncedQuery && (
                  <Button
                    variant="outline"
                    onClick={clearSearch}
                    className="mt-4"
                    data-testid="button-clear-search-empty"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Load More Button */}
        {!isLoading && allPosts.length > 0 && hasMore && (
          <div className="text-center mt-12">
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              variant="outline"
              className="px-8 py-3"
              data-testid="button-load-more"
            >
              {loadingMore ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}
        
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`loading-more-${index}`}>
                {renderSkeletonCard()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}