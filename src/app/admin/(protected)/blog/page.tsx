"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  CheckCircle,
  Clock,
  Archive,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  Award,
  TrendingUp,
} from "lucide-react";

interface BlogPostItem {
  id: number;
  title: string;
  slug: string;
  category_name?: string;
  status: "draft" | "published" | "scheduled" | "archived";
  is_featured: boolean;
  is_trending: boolean;
  view_count: number;
  reading_time_minutes: number;
  published_at: string | null;
  updated_at: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  const fetchPosts = async (page = 1, currentSearch = search, currentStatus = statusFilter) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        search: currentSearch,
        status: currentStatus,
      });
      const res = await fetch(`/api/blog/posts?${q.toString()}`);
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, search, statusFilter);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(1, search, statusFilter);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this editorial article?")) return;
    try {
      const res = await fetch(`/api/blog/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPosts(pagination.page, search, statusFilter);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-heading)]">
            Journal Articles
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            Manage luxury watch editorial articles, specifications, and SEO metadata.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            target="_blank"
            className="admin-btn admin-btn-secondary"
          >
            <ExternalLink className="h-4 w-4" />
            Live Journal
          </Link>
          <Link
            href="/admin/blog/new"
            className="admin-btn admin-btn-primary"
          >
            <Plus className="h-4 w-4" />
            New Article
          </Link>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="admin-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">Total Articles</p>
          <p className="mt-1 text-2xl font-bold text-[var(--admin-heading)]">{pagination.total}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">AEO Optimized</p>
          <p className="mt-1 text-2xl font-bold text-[var(--admin-success)]">100%</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">Direct Answers</p>
          <p className="mt-1 text-2xl font-bold text-[var(--admin-accent)]">Active</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">Stored Images</p>
          <p className="mt-1 text-2xl font-bold text-[var(--admin-warning)]">30 Live</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="admin-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
          <input
            type="text"
            placeholder="Search by title, keyword, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-9"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input w-auto"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Articles Table with admin theme styles */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--admin-line)] bg-[var(--admin-bg)] text-xs uppercase tracking-wider text-[var(--admin-muted)]">
              <tr>
                <th className="px-5 py-3 font-semibold">Article Title & Details</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Views</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-line)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--admin-muted)]">
                    Loading editorial articles...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--admin-muted)]">
                    No articles found matching criteria.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="transition hover:bg-[var(--admin-surface-2)]">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/blog/${post.id}/edit`}
                              className="font-medium text-[var(--admin-heading)] hover:underline line-clamp-1"
                            >
                              {post.title}
                            </Link>
                            {post.is_featured && (
                              <span className="inline-flex items-center gap-1 rounded bg-[var(--admin-warning-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--admin-warning)]">
                                <Award className="h-3 w-3" /> Featured
                              </span>
                            )}
                            {post.is_trending && (
                              <span className="inline-flex items-center gap-1 rounded bg-[var(--admin-danger-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--admin-danger)]">
                                <TrendingUp className="h-3 w-3" /> Trending
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-[var(--admin-muted)] font-mono">
                            /{post.slug} • {post.reading_time_minutes} min read
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[var(--admin-ink)]">
                      <span className="rounded-fuse-sm bg-[var(--admin-bg)] px-2.5 py-1 text-xs">
                        {post.category_name || "General"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {post.status === "published" ? (
                        <span className="inline-flex items-center gap-1 rounded-fuse-sm bg-[var(--admin-success-soft)] px-2 py-0.5 text-xs font-medium text-[var(--admin-success)]">
                          <CheckCircle className="h-3 w-3" /> Published
                        </span>
                      ) : post.status === "draft" ? (
                        <span className="inline-flex items-center gap-1 rounded-fuse-sm bg-[var(--admin-surface-2)] px-2 py-0.5 text-xs font-medium text-[var(--admin-muted)]">
                          <Clock className="h-3 w-3" /> Draft
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-fuse-sm bg-[var(--admin-warning-soft)] px-2 py-0.5 text-xs font-medium text-[var(--admin-warning)]">
                          <Archive className="h-3 w-3" /> {post.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-[var(--admin-muted)] font-mono">{post.view_count || 0}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === "published" && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="rounded p-1 text-[var(--admin-muted)] transition hover:bg-[var(--admin-bg)] hover:text-[var(--admin-heading)]"
                            title="View Public Post"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="rounded p-1 text-[var(--admin-muted)] transition hover:bg-[var(--admin-bg)] hover:text-[var(--admin-heading)]"
                          title="Edit Post"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          className="rounded p-1 text-[var(--admin-muted)] transition hover:bg-[var(--admin-danger-soft)] hover:text-[var(--admin-danger)]"
                          title="Delete Post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--admin-line)] px-5 py-3 text-xs text-[var(--admin-muted)]">
            <p>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} articles)
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchPosts(pagination.page - 1)}
                className="admin-btn admin-btn-secondary text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchPosts(pagination.page + 1)}
                className="admin-btn admin-btn-secondary text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
