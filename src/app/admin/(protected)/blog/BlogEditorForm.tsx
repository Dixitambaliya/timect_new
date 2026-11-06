"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  AlignLeft,
  Heading,
  Italic,
  List,
  FileText,
  Upload,
} from "lucide-react";
import {
  type ArticleSection,
  sectionsToHtml,
  htmlToSections,
} from "@/admin/lib/article-builder";
import MediaPicker from "@/admin/components/media/MediaPicker";

interface Category {
  id: number;
  name: string;
}

export default function BlogEditorForm({ postId }: { postId?: number }) {
  const router = useRouter();
  const isEditing = Boolean(postId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<"content" | "faqs" | "images">("content");

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [sections, setSections] = useState<ArticleSection[]>([
    { id: "1", type: "italic_lead", content: "" },
    { id: "2", type: "paragraph", content: "" },
    { id: "3", type: "heading", content: "" },
    { id: "4", type: "bullet_points", content: "" },
  ]);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [status, setStatus] = useState<"draft" | "published" | "scheduled" | "archived">("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [readingTime, setReadingTime] = useState(5);
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [featuredImageId, setFeaturedImageId] = useState<number | null>(null);

  // Media Picker Dialog State
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // AEO Direct Answer & FAQs (with delete button)
  const [directAnswer, setDirectAnswer] = useState("");
  const [faqs, setFaqs] = useState<{ id: string; question: string; answer: string }[]>([
    { id: "faq-1", question: "", answer: "" },
  ]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/blog/categories")
      .then((r) => r.json())
      .then((d) => d.categories && setCategories(d.categories))
      .catch(console.error);

    if (postId) {
      fetch(`/api/blog/posts/${postId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.post) {
            const p = d.post;
            setTitle(p.title || "");
            setSlug(p.slug || "");
            setSubtitle(p.subtitle || "");
            setExcerpt(p.excerpt || "");
            setSections(htmlToSections(p.content_html || ""));
            setCategoryId(p.category_id || null);
            setStatus(p.status || "draft");
            setIsFeatured(Boolean(p.is_featured));
            setIsTrending(Boolean(p.is_trending));
            setReadingTime(p.reading_time_minutes || 5);
            setFeaturedImageUrl(p.featured_image_url || "");
            setFeaturedImageId(p.featured_image_id || null);

            if (p.seo?.direct_answer) {
              setDirectAnswer(p.seo.direct_answer);
            }

            if (Array.isArray(p.faqs) && p.faqs.length) {
              setFaqs(
                p.faqs.map((f: any, idx: number) => ({
                  id: `faq-${idx}-${Date.now()}`,
                  question: f.question || "",
                  answer: f.answer || "",
                }))
              );
            }
          }
        })
        .catch(console.error);
    }
  }, [postId]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && (!slug || slug === slugify(title))) {
      setSlug(slugify(val));
    }
  };

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  // Section modifiers
  const addSection = (type: ArticleSection["type"]) => {
    const newSection: ArticleSection = {
      id: String(Date.now()),
      type,
      content: "",
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, content: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, content } : s)));
  };

  const changeSectionType = (id: string, type: ArticleSection["type"]) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, type } : s)));
  };

  const removeSection = (id: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((s) => s.id !== id));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const copy = [...sections];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    setSections(copy);
  };

  // FAQ modifiers with delete buttons
  const addFaq = () => {
    setFaqs([...faqs, { id: String(Date.now()), question: "", answer: "" }]);
  };

  const updateFaq = (id: string, field: "question" | "answer", val: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: val } : f)));
  };

  const removeFaq = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  const handleSave = async (newStatus?: "draft" | "published") => {
    const contentHtml = sectionsToHtml(sections);

    if (!title || !slug || !excerpt || !contentHtml.trim()) {
      alert("Please fill in Title, Slug, Excerpt, and at least one content section.");
      return;
    }

    setSaving(true);
    const postStatus = newStatus || status;

    // Automatic SEO based on article title & excerpt
    const autoMetaTitle = `${title.trim()} | TIMECT Journal`;
    const autoMetaDescription = excerpt.trim();

    const payload = {
      title,
      slug,
      subtitle,
      excerpt,
      contentHtml,
      categoryId,
      status: postStatus,
      isFeatured,
      isTrending,
      readingTimeMinutes: readingTime,
      featuredImageId,
      featuredImageUrl,
      seo: {
        metaTitle: autoMetaTitle,
        metaDescription: autoMetaDescription,
        focusKeyword: title.split(" ").slice(0, 3).join(" "),
        directAnswer: directAnswer.trim() || null,
        targetEntities: ["Watch", "Timepiece", "TIMECT"],
        seoScore: 95,
        geoScore: 92,
        aeoScore: 94,
      },
      faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
    };

    try {
      const url = isEditing ? `/api/blog/posts/${postId}` : `/api/blog/posts`;
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/blog");
      } else {
        alert(data.error || "Save failed");
      }
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="admin-btn admin-btn-secondary p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-heading)]">
              {isEditing ? "Edit Article" : "Create Article"}
            </h1>
            <p className="text-xs text-[var(--admin-muted)]">
              Edit all article content, featured imagery, and FAQs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="admin-btn admin-btn-secondary disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={saving}
            className="admin-btn admin-btn-primary disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Publish Article
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--admin-line)] text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition ${
            activeTab === "content"
              ? "border-[var(--admin-accent)] text-[var(--admin-heading)] font-semibold"
              : "border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-heading)]"
          }`}
        >
          <FileText className="h-4 w-4" /> Editorial Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("faqs")}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition ${
            activeTab === "faqs"
              ? "border-[var(--admin-accent)] text-[var(--admin-heading)] font-semibold"
              : "border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-heading)]"
          }`}
        >
          <HelpCircle className="h-4 w-4" /> FAQs & Summary ({faqs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("images")}
          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition ${
            activeTab === "images"
              ? "border-[var(--admin-accent)] text-[var(--admin-heading)] font-semibold"
              : "border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-heading)]"
          }`}
        >
          <ImageIcon className="h-4 w-4" /> Featured Image
        </button>
      </div>

      {/* Content Tab with Section-based Text Fields */}
      {activeTab === "content" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {/* Primary Details Card */}
            <div className="admin-card p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)] mb-1">
                  Article Title (Also used for Meta Title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. How to Choose Your First Automatic Watch"
                  className="admin-input text-base font-bold text-[var(--admin-heading)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)] mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="how-to-choose-first-automatic-watch"
                    className="admin-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)] mb-1">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Key considerations for mechanical horology..."
                    className="admin-input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)] mb-1">
                  Excerpt (Also used for Meta Description)
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Concise 2-sentence summary of the article..."
                  className="admin-input text-sm"
                />
              </div>
            </div>

            {/* Field-Based Article Body Section Builder */}
            <div className="admin-card p-5 space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--admin-line)] pb-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-heading)]">
                    Article Sections
                  </h3>
                  <p className="text-xs text-[var(--admin-muted)]">
                    Easily add, re-order, and remove paragraphs, headings, bullet points, and italic leads.
                  </p>
                </div>

                {/* Quick Add Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => addSection("paragraph")}
                    className="admin-btn admin-btn-secondary text-xs px-2.5 py-1"
                  >
                    <AlignLeft className="h-3.5 w-3.5 text-sky-500" />
                    + Paragraph
                  </button>
                  <button
                    type="button"
                    onClick={() => addSection("heading")}
                    className="admin-btn admin-btn-secondary text-xs px-2.5 py-1"
                  >
                    <Heading className="h-3.5 w-3.5 text-indigo-500" />
                    + Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => addSection("bullet_points")}
                    className="admin-btn admin-btn-secondary text-xs px-2.5 py-1"
                  >
                    <List className="h-3.5 w-3.5 text-amber-500" />
                    + Bullet Points
                  </button>
                  <button
                    type="button"
                    onClick={() => addSection("italic_lead")}
                    className="admin-btn admin-btn-secondary text-xs px-2.5 py-1"
                  >
                    <Italic className="h-3.5 w-3.5 text-emerald-500" />
                    + Italic Lead
                  </button>
                </div>
              </div>

              {/* Stacked Content Fields */}
              <div className="space-y-4">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="rounded-fuse border border-[var(--admin-line)] bg-[var(--admin-surface-2)] p-4 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-[var(--admin-muted)]">#{idx + 1}</span>
                        <select
                          value={sec.type}
                          onChange={(e) => changeSectionType(sec.id, e.target.value as any)}
                          className="admin-input !py-1 !px-2 text-xs font-semibold w-auto"
                        >
                          <option value="paragraph">Standard Paragraph</option>
                          <option value="heading">Section Heading (H2)</option>
                          <option value="bullet_points">Bullet Points (One per line)</option>
                          <option value="italic_lead">Italic Lead / Highlight</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveSection(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded text-[var(--admin-muted)] hover:text-[var(--admin-heading)] disabled:opacity-30"
                          title="Move Up"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(idx, 1)}
                          disabled={idx === sections.length - 1}
                          className="p-1 rounded text-[var(--admin-muted)] hover:text-[var(--admin-heading)] disabled:opacity-30"
                          title="Move Down"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSection(sec.id)}
                          disabled={sections.length <= 1}
                          className="p-1 rounded text-[var(--admin-muted)] hover:text-[var(--admin-danger)] disabled:opacity-30"
                          title="Delete Section"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Text Input based on Field Type */}
                    {sec.type === "heading" ? (
                      <input
                        type="text"
                        value={sec.content}
                        onChange={(e) => updateSection(sec.id, e.target.value)}
                        placeholder="Enter section headline..."
                        className="admin-input font-bold text-base text-[var(--admin-heading)]"
                      />
                    ) : sec.type === "bullet_points" ? (
                      <div>
                        <textarea
                          rows={4}
                          value={sec.content}
                          onChange={(e) => updateSection(sec.id, e.target.value)}
                          placeholder="Point 1&#10;Point 2&#10;Point 3"
                          className="admin-input text-sm leading-relaxed"
                        />
                        <p className="mt-1 text-[11px] text-[var(--admin-muted)]">
                          Type each bullet on a new line.
                        </p>
                      </div>
                    ) : sec.type === "italic_lead" ? (
                      <textarea
                        rows={3}
                        value={sec.content}
                        onChange={(e) => updateSection(sec.id, e.target.value)}
                        placeholder="Enter introductory italic statement or highlighted takeaway..."
                        className="admin-input text-sm italic font-serif leading-relaxed border-l-4 border-l-amber-600/70"
                      />
                    ) : (
                      <textarea
                        rows={4}
                        value={sec.content}
                        onChange={(e) => updateSection(sec.id, e.target.value)}
                        placeholder="Type paragraph content here..."
                        className="admin-input text-sm leading-relaxed"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Quick-Add Bar */}
              <div className="flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={() => addSection("paragraph")}
                  className="admin-btn admin-btn-secondary text-xs"
                >
                  <Plus className="h-4 w-4" /> Add Another Paragraph
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar Meta */}
          <div className="space-y-4">
            <div className="admin-card p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-muted)]">Settings</h3>

              <div>
                <label className="block text-xs font-medium text-[var(--admin-ink)] mb-1">Category</label>
                <select
                  value={categoryId || ""}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                  className="admin-input w-full"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--admin-ink)] mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="admin-input w-full"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--admin-ink)] mb-1">Reading Time (Min)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={readingTime}
                  onChange={(e) => setReadingTime(Number(e.target.value))}
                  className="admin-input"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--admin-line)] text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-[var(--admin-ink)]">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-[var(--admin-line)]"
                  />
                  <span>Featured Story</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[var(--admin-ink)]">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="rounded border-[var(--admin-line)]"
                  />
                  <span>Trending Guide</span>
                </label>
              </div>
            </div>

            {/* Featured Image Preview Card with Edit & Media Picker Button */}
            <div className="admin-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-muted)]">Featured Image</h3>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="text-xs text-[var(--admin-accent)] hover:underline font-semibold"
                >
                  Browse / Upload
                </button>
              </div>

              {featuredImageUrl ? (
                <div className="overflow-hidden rounded border border-[var(--admin-line)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featuredImageUrl} alt="Featured preview" className="w-full h-36 object-cover" />
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded border border-dashed border-[var(--admin-line)] text-xs text-[var(--admin-muted)]">
                  No image assigned
                </div>
              )}

              <input
                type="text"
                placeholder="Image URL or Cloudinary path..."
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                className="admin-input text-xs"
              />

              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="w-full admin-btn admin-btn-secondary text-xs"
              >
                <Upload className="h-3.5 w-3.5" /> Choose from Media Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQs & Summary Tab with Delete Buttons */}
      {activeTab === "faqs" && (
        <div className="admin-card p-5 space-y-5 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-[var(--admin-heading)]">Direct Answer Summary & FAQs</h2>
            <p className="text-xs text-[var(--admin-muted)]">
              Manage the quick answer summary and frequently asked questions for this article.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)] mb-1">
              Direct Answer Summary (Lead Box)
            </label>
            <textarea
              rows={3}
              value={directAnswer}
              onChange={(e) => setDirectAnswer(e.target.value)}
              placeholder="A concise, factual 40-word summary answering the main search question..."
              className="admin-input text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[var(--admin-line)] pb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-heading)]">
                Frequently Asked Questions ({faqs.length})
              </label>
              <button
                type="button"
                onClick={addFaq}
                className="admin-btn admin-btn-secondary text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add FAQ
              </button>
            </div>

            <div className="space-y-4">
              {faqs.length === 0 ? (
                <p className="text-xs text-[var(--admin-muted)] py-4 text-center">
                  No FAQs added yet. Click &quot;Add FAQ&quot; above to add one.
                </p>
              ) : (
                faqs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className="rounded-fuse border border-[var(--admin-line)] bg-[var(--admin-surface-2)] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--admin-muted)]">
                        Question #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFaq(faq.id)}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-[var(--admin-danger)] hover:bg-[var(--admin-danger-soft)] transition"
                        title="Delete FAQ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaq(faq.id, "question", e.target.value)}
                      placeholder="e.g. Can I wear this automatic watch while swimming?"
                      className="admin-input text-sm font-semibold"
                    />
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                      placeholder="Concise direct answer..."
                      className="admin-input text-sm"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Featured Media Tab with Upload / Change Ability */}
      {activeTab === "images" && (
        <div className="admin-card p-5 space-y-5 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-[var(--admin-heading)]">Featured Media</h2>
            <p className="text-xs text-[var(--admin-muted)]">
              Assign, replace, or upload a new image for this article.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
              Image URL / Cloudinary CDN Path
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/... or /api/blog/images/..."
                className="admin-input text-sm flex-1"
              />
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="admin-btn admin-btn-secondary shrink-0 text-xs"
              >
                <Upload className="h-4 w-4" /> Browse Media
              </button>
            </div>
          </div>

          {featuredImageUrl && (
            <div className="space-y-3 pt-3 border-t border-[var(--admin-line)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">Active Preview</p>
                <button
                  type="button"
                  onClick={() => setFeaturedImageUrl("")}
                  className="text-xs text-[var(--admin-danger)] hover:underline"
                >
                  Remove Image
                </button>
              </div>
              <div className="overflow-hidden rounded-fuse border border-[var(--admin-line)] max-w-lg bg-[var(--admin-surface-2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featuredImageUrl} alt="Featured preview" className="w-full h-auto object-cover max-h-[380px]" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPicker
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => {
          setFeaturedImageUrl(url);
          setShowMediaPicker(false);
        }}
      />
    </div>
  );
}
