"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Calendar, User, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  created_at: string;
}

export default function AdminManagePostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, category, author, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeletingId(id);

    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete post. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Manage Posts</h1>
          <p className="text-muted-foreground text-sm">Add, review, and delete posts visible on the live site news feed.</p>
        </div>
        <div className="flex shrink-0">
          <Link
            href="/admin/posts/create"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-none bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={16} />
            Create Post
          </Link>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Loading published articles...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No posts found in the database. Get started by creating your first article!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 pl-6">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Published Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6 font-bold text-foreground">
                      <Link href={`/news/${post.slug}`} target="_blank" className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground font-semibold">{post.category}</td>
                    <td className="p-4 text-muted-foreground">{post.author}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(post.created_at)}</td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <Link
                        href={`/admin/posts/edit/${post.id}`}
                        className="p-2 border border-border text-foreground hover:bg-primary/10 hover:border-primary/40 transition-all inline-flex items-center justify-center align-middle"
                        title="Edit Post"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingId === post.id}
                        className="p-2 border border-border text-destructive hover:bg-destructive/5 hover:border-destructive/30 transition-all cursor-pointer inline-flex items-center justify-center align-middle"
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
