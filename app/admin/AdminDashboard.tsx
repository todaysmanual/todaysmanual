"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { defaultSiteConfig } from "@/lib/cms/defaults";
import { matchesSearch } from "@/lib/cms/search";
import type { ArticleRecord, CategoryRecord, ContactMessageRecord, SiteConfig, SubscriberRecord } from "@/lib/cms/types";

type View = "overview" | "articles" | "categories" | "homepage" | "site" | "messages" | "subscribers" | "media";
type Notice = { kind: "success" | "error"; text: string } | null;
type MediaFile = { name: string; id?: string; created_at?: string; metadata?: { size?: number; mimetype?: string } };

const views: Array<{ id: View; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "articles", label: "Articles" },
  { id: "categories", label: "Manuals" },
  { id: "homepage", label: "Homepage" },
  { id: "site", label: "Site settings" },
  { id: "messages", label: "Messages" },
  { id: "subscribers", label: "Subscribers" },
  { id: "media", label: "Media" },
];

const emptyArticle = (category = "work"): ArticleRecord => ({
  id: crypto.randomUUID(),
  slug: "",
  title: "",
  category_slug: category,
  excerpt: "",
  body: "",
  image_url: "",
  image_alt: "",
  read_time: "5 min read",
  author: "Today’s Manual",
  status: "draft",
  featured: false,
  sort_order: 0,
  published_at: null,
});

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatBytes(bytes = 0) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="admin-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function AdminSearch({ label, value, onChange, count }: { label: string; value: string; onChange: (value: string) => void; count: number }) {
  return <label className="admin-search"><span className="sr-only">{label}</span><span aria-hidden="true">⌕</span><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={label} />{value && <button type="button" onClick={() => onChange("")} aria-label={`Clear ${label.toLowerCase()}`}>×</button>}<small>{count}</small></label>;
}

function StringListField({ label, value, onChange, hint }: { label: string; value: string[]; onChange: (value: string[]) => void; hint?: string }) {
  const [draft, setDraft] = useState(value.join("\n"));
  return <Field label={label} hint={hint}><textarea rows={Math.max(3, value.length)} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => onChange(draft.split("\n").map((item) => item.trim()).filter(Boolean))} /></Field>;
}

function JsonField<T>({ label, value, onChange, hint }: { label: string; value: T; onChange: (value: T) => void; hint?: string }) {
  const [draft, setDraft] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState("");
  function commit() {
    try {
      onChange(JSON.parse(draft) as T);
      setError("");
    } catch {
      setError("This section contains invalid JSON. Fix it before saving.");
    }
  }
  return <Field label={label} hint={hint}><textarea className="admin-json" rows={10} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} />{error && <em className="admin-inline-error">{error}</em>}</Field>;
}

function ImageField({ label, value, alt, onChange, onUpload }: { label: string; value: string; alt: string; onChange: (value: string) => void; onUpload: (file: File) => Promise<string | null> }) {
  const [uploading, setUploading] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    const url = await onUpload(file);
    if (url) onChange(url);
    setUploading(false);
  }
  return <div className="admin-image-field">
    <span>{label}</span>
    <div className="admin-image-field__row">
      <div className="admin-image-field__preview">{value ? <img src={value} alt={alt || "Current image"} /> : <span>No image</span>}</div>
      <div>
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Image URL" />
        <label className="admin-upload-button">{uploading ? "Uploading…" : "Replace image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={uploading} onChange={(event) => void upload(event.target.files?.[0])} /></label>
      </div>
    </div>
  </div>;
}

function Login({ client, onSuccess }: { client: SupabaseClient | null; onSuccess: (user: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!client) return;
    setLoading(true);
    setError("");
    const { data, error: signInError } = await client.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError || !data.user) return setError(signInError?.message ?? "Sign in failed.");
    onSuccess(data.user);
  }

  return <main className="admin-login">
    <section>
      <Link href="/" className="admin-login__brand">Today’s Manual</Link>
      <p className="admin-kicker">Owner studio</p>
      <h1>Run the whole publication from one place.</h1>
      {!client ? <div className="admin-setup-message"><strong>Connect Supabase first</strong><p>Add the two Supabase values from <code>.env.example</code>, run the included migration, then return here.</p></div> : <form onSubmit={submit}>
        <Field label="Email"><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
        <Field label="Password"><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></Field>
        {error && <p className="admin-form-error" role="alert">{error}</p>}
        <button className="admin-primary" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
      </form>}
      <Link href="/" className="admin-back">← Back to the website</Link>
    </section>
  </main>;
}

export function AdminDashboard() {
  const client = useMemo(() => createBrowserSupabaseClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [view, setView] = useState<View>("overview");
  const [loading, setLoading] = useState(Boolean(client));
  const [notice, setNotice] = useState<Notice>(null);
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [articleDraft, setArticleDraft] = useState<ArticleRecord | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryRecord | null>(null);
  const [articleSearch, setArticleSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [mediaSearch, setMediaSearch] = useState("");

  const filteredArticles = useMemo(() => articles.filter((article) => matchesSearch(articleSearch, [article.title, article.slug, article.category_slug, article.excerpt, article.body, article.author, article.status])), [articleSearch, articles]);
  const filteredMessages = useMemo(() => messages.filter((message) => matchesSearch(messageSearch, [message.name, message.email, message.subject, message.message, message.status])), [messageSearch, messages]);
  const filteredSubscribers = useMemo(() => subscribers.filter((subscriber) => matchesSearch(subscriberSearch, [subscriber.email, subscriber.source, subscriber.status, subscriber.created_at])), [subscriberSearch, subscribers]);
  const filteredMedia = useMemo(() => media.filter((file) => matchesSearch(mediaSearch, [file.name, file.metadata?.mimetype, file.created_at])), [media, mediaSearch]);

  const showNotice = useCallback((kind: "success" | "error", text: string) => {
    setNotice({ kind, text });
    window.setTimeout(() => setNotice(null), 4500);
  }, []);

  const loadMedia = useCallback(async () => {
    if (!client) return;
    const { data, error } = await client.storage.from("site-media").list("uploads", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (!error) setMedia((data ?? []) as MediaFile[]);
  }, [client]);

  const loadData = useCallback(async (currentUser: User) => {
    if (!client) return;
    setLoading(true);
    const profileResult = await client.from("profiles").select("role, display_name").eq("id", currentUser.id).maybeSingle();
    if (profileResult.error || !profileResult.data) {
      setAuthorized(false);
      setLoading(false);
      return;
    }
    setAuthorized(true);
    const [articleResult, categoryResult, settingsResult, messageResult, subscriberResult] = await Promise.all([
      client.from("articles").select("*").order("sort_order", { ascending: true }),
      client.from("categories").select("*").order("sort_order", { ascending: true }),
      client.from("site_settings").select("value").eq("key", "site_config").maybeSingle(),
      client.from("contact_messages").select("*").order("created_at", { ascending: false }),
      client.from("subscribers").select("*").order("created_at", { ascending: false }),
    ]);
    if (articleResult.data) setArticles(articleResult.data as ArticleRecord[]);
    if (categoryResult.data) setCategories(categoryResult.data as CategoryRecord[]);
    if (settingsResult.data?.value) setConfig({ ...defaultSiteConfig, ...(settingsResult.data.value as Partial<SiteConfig>) });
    if (messageResult.data) setMessages(messageResult.data as ContactMessageRecord[]);
    if (subscriberResult.data) setSubscribers(subscriberResult.data as SubscriberRecord[]);
    await loadMedia();
    const firstError = articleResult.error ?? categoryResult.error ?? settingsResult.error ?? messageResult.error ?? subscriberResult.error;
    if (firstError) showNotice("error", firstError.message);
    setLoading(false);
  }, [client, loadMedia, showNotice]);

  useEffect(() => {
    if (!client) return;
    void client.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) void loadData(data.user);
      else setLoading(false);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, [client, loadData]);

  async function uploadMedia(file: File) {
    if (!client) return null;
    if (file.size > 10 * 1024 * 1024) { showNotice("error", "Images must be 10 MB or smaller."); return null; }
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const path = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
    const { error } = await client.storage.from("site-media").upload(path, file, { cacheControl: "31536000", upsert: false });
    if (error) { showNotice("error", error.message); return null; }
    const { data } = client.storage.from("site-media").getPublicUrl(path);
    await loadMedia();
    showNotice("success", "Image uploaded.");
    return data.publicUrl;
  }

  async function saveArticle() {
    if (!client || !articleDraft) return;
    const draft = { ...articleDraft, slug: slugify(articleDraft.slug || articleDraft.title), published_at: articleDraft.status === "published" ? articleDraft.published_at ?? new Date().toISOString() : null };
    if (!draft.title || !draft.slug || !draft.category_slug) return showNotice("error", "Title, slug and manual are required.");
    const { data, error } = await client.from("articles").upsert(draft).select().single();
    if (error) return showNotice("error", error.message);
    setArticles((items) => [...items.filter((item) => item.id !== data.id), data as ArticleRecord].sort((a, b) => a.sort_order - b.sort_order));
    setArticleDraft(data as ArticleRecord);
    showNotice("success", "Article saved.");
  }

  async function deleteArticle(article: ArticleRecord) {
    if (!client || !window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    const { error } = await client.from("articles").delete().eq("id", article.id);
    if (error) return showNotice("error", error.message);
    setArticles((items) => items.filter((item) => item.id !== article.id));
    setArticleDraft(null);
    showNotice("success", "Article deleted.");
  }

  async function saveCategory() {
    if (!client || !categoryDraft) return;
    const draft = { ...categoryDraft, slug: slugify(categoryDraft.slug || categoryDraft.title) };
    if (!draft.title || !draft.slug) return showNotice("error", "Manual name and slug are required.");
    const { data, error } = await client.from("categories").upsert(draft).select().single();
    if (error) return showNotice("error", error.message);
    setCategories((items) => [...items.filter((item) => item.slug !== data.slug), data as CategoryRecord].sort((a, b) => a.sort_order - b.sort_order));
    setCategoryDraft(data as CategoryRecord);
    showNotice("success", "Manual saved.");
  }

  async function saveConfig() {
    if (!client || !user) return;
    const { error } = await client.from("site_settings").upsert({ key: "site_config", value: config, updated_by: user.id });
    if (error) return showNotice("error", error.message);
    showNotice("success", "Website settings published.");
  }

  async function updateSubscriber(item: SubscriberRecord, status: SubscriberRecord["status"]) {
    if (!client) return;
    const { error } = await client.from("subscribers").update({ status }).eq("id", item.id);
    if (error) return showNotice("error", error.message);
    setSubscribers((items) => items.map((record) => record.id === item.id ? { ...record, status } : record));
  }

  async function updateMessage(item: ContactMessageRecord, status: ContactMessageRecord["status"]) {
    if (!client) return;
    const { error } = await client.from("contact_messages").update({ status }).eq("id", item.id);
    if (error) return showNotice("error", error.message);
    setMessages((items) => items.map((record) => record.id === item.id ? { ...record, status } : record));
    showNotice("success", status === "archived" ? "Message archived." : "Message updated.");
  }

  async function deleteMessage(item: ContactMessageRecord) {
    if (!client || !window.confirm(`Permanently delete the message from ${item.name}?`)) return;
    const { error } = await client.from("contact_messages").delete().eq("id", item.id);
    if (error) return showNotice("error", error.message);
    setMessages((items) => items.filter((record) => record.id !== item.id));
    showNotice("success", "Message deleted.");
  }

  async function deleteMedia(file: MediaFile) {
    if (!client || !window.confirm(`Delete ${file.name} from the media library?`)) return;
    const { error } = await client.storage.from("site-media").remove([`uploads/${file.name}`]);
    if (error) return showNotice("error", error.message);
    await loadMedia();
    showNotice("success", "Media deleted. Existing pages using its URL must be updated separately.");
  }

  function exportSubscribers() {
    const csv = ["email,status,source,joined", ...subscribers.map((item) => [item.email, item.status, item.source, item.created_at].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `todays-manual-subscribers-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!user) return <Login client={client} onSuccess={(nextUser) => { setUser(nextUser); void loadData(nextUser); }} />;
  if (authorized === false) return <main className="admin-login"><section><p className="admin-kicker">Access not enabled</p><h1>This account is signed in, but it is not an editor yet.</h1><div className="admin-setup-message"><p>Add this user to the <code>profiles</code> table with the <code>admin</code> role using the one-time command in <code>BACKEND_SETUP.md</code>.</p></div><button className="admin-secondary" onClick={() => void client?.auth.signOut().then(() => setUser(null))}>Sign out</button></section></main>;

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link href="/" className="admin-wordmark">Today’s Manual</Link>
      <p>Owner studio</p>
      <nav>{views.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>{item.label}</button>)}</nav>
      <div className="admin-sidebar__bottom"><span>{user.email}</span><Link href="/" target="_blank">View website ↗</Link><button onClick={() => void client?.auth.signOut().then(() => setUser(null))}>Sign out</button></div>
    </aside>
    <main className="admin-main">
      {notice && <div className={`admin-notice admin-notice--${notice.kind}`} role="status">{notice.text}</div>}
      {loading ? <div className="admin-loading">Loading your publication…</div> : <>
        {view === "overview" && <section className="admin-view"><header><div><p className="admin-kicker">Publication control</p><h1>Everything at a glance.</h1></div></header><div className="admin-stats"><article><strong>{articles.length}</strong><span>Total articles</span></article><article><strong>{articles.filter((item) => item.status === "published").length}</strong><span>Published</span></article><article><strong>{messages.filter((item) => item.status === "new").length}</strong><span>New messages</span></article><article><strong>{subscribers.filter((item) => item.status === "active").length}</strong><span>Active subscribers</span></article></div><div className="admin-panel"><h2>Quick actions</h2><div className="admin-actions"><button onClick={() => { setArticleDraft(emptyArticle(categories[0]?.slug)); setView("articles"); }}>Write a new article</button><button onClick={() => setView("homepage")}>Edit homepage</button><button onClick={() => setView("messages")}>Read messages</button><button onClick={() => setView("media")}>Upload an image</button></div></div></section>}

        {view === "articles" && <section className="admin-view"><header><div><p className="admin-kicker">Editorial</p><h1>Articles</h1></div><div className="admin-header-actions"><AdminSearch label="Search articles" value={articleSearch} onChange={setArticleSearch} count={filteredArticles.length} /><button className="admin-primary" onClick={() => setArticleDraft(emptyArticle(categories[0]?.slug))}>New article</button></div></header><div className="admin-split"><div className="admin-list">{filteredArticles.map((article) => <button key={article.id} className={articleDraft?.id === article.id ? "active" : ""} onClick={() => setArticleDraft({ ...article })}><span><i className={`status-dot status-dot--${article.status}`} />{article.status}</span><strong>{article.title}</strong><small>{article.category_slug} · {article.read_time}</small></button>)}{filteredArticles.length === 0 && <div className="admin-empty admin-empty--compact"><strong>No matching articles</strong><p>Try a title, slug, manual, author or phrase from the body.</p></div>}</div><div className="admin-editor">{articleDraft ? <><div className="admin-editor__head"><h2>{articles.some((item) => item.id === articleDraft.id) ? "Edit article" : "New article"}</h2><div><button className="admin-secondary" onClick={() => setArticleDraft(null)}>Close</button><button className="admin-primary" onClick={() => void saveArticle()}>Save article</button></div></div><div className="admin-form-grid"><Field label="Title"><input value={articleDraft.title} onChange={(event) => setArticleDraft({ ...articleDraft, title: event.target.value, slug: articleDraft.slug || slugify(event.target.value) })} /></Field><Field label="URL slug"><input value={articleDraft.slug} onChange={(event) => setArticleDraft({ ...articleDraft, slug: slugify(event.target.value) })} /></Field><Field label="Manual"><select value={articleDraft.category_slug} onChange={(event) => setArticleDraft({ ...articleDraft, category_slug: event.target.value })}>{categories.map((category) => <option value={category.slug} key={category.slug}>{category.title}</option>)}</select></Field><Field label="Status"><select value={articleDraft.status} onChange={(event) => setArticleDraft({ ...articleDraft, status: event.target.value as ArticleRecord["status"] })}><option value="draft">Draft</option><option value="published">Published</option></select></Field><Field label="Author"><input value={articleDraft.author} onChange={(event) => setArticleDraft({ ...articleDraft, author: event.target.value })} /></Field><Field label="Read time"><input value={articleDraft.read_time} onChange={(event) => setArticleDraft({ ...articleDraft, read_time: event.target.value })} /></Field><Field label="Display order"><input type="number" value={articleDraft.sort_order} onChange={(event) => setArticleDraft({ ...articleDraft, sort_order: Number(event.target.value) })} /></Field><Field label="Homepage featured"><select value={articleDraft.featured ? "yes" : "no"} onChange={(event) => setArticleDraft({ ...articleDraft, featured: event.target.value === "yes" })}><option value="no">No</option><option value="yes">Yes</option></select></Field></div><Field label="Summary"><textarea rows={3} value={articleDraft.excerpt} onChange={(event) => setArticleDraft({ ...articleDraft, excerpt: event.target.value })} /></Field><ImageField label="Article image" value={articleDraft.image_url} alt={articleDraft.image_alt} onChange={(image_url) => setArticleDraft({ ...articleDraft, image_url })} onUpload={uploadMedia} /><Field label="Image description" hint="Describe the image for people using screen readers."><input value={articleDraft.image_alt} onChange={(event) => setArticleDraft({ ...articleDraft, image_alt: event.target.value })} /></Field><Field label="Article body" hint="Use ## for section headings, ### for subheadings, and - for bullet lists."><textarea className="admin-body-editor" rows={18} value={articleDraft.body} onChange={(event) => setArticleDraft({ ...articleDraft, body: event.target.value })} /></Field><div className="admin-danger-zone"><button onClick={() => void deleteArticle(articleDraft)}>Delete article</button></div></> : <div className="admin-empty"><strong>Select an article</strong><p>Choose one from the list, or create a new story.</p></div>}</div></div></section>}

        {view === "categories" && <section className="admin-view"><header><div><p className="admin-kicker">Navigation and sections</p><h1>Manuals</h1></div></header><div className="admin-card-grid">{categories.map((category) => <button className="admin-category-card" style={{ borderTopColor: category.color }} key={category.slug} onClick={() => setCategoryDraft({ ...category })}><img src={category.image_url} alt="" /><strong>{category.title}</strong><span>{category.description}</span></button>)}</div>{categoryDraft && <div className="admin-panel admin-category-editor"><div className="admin-editor__head"><h2>Edit {categoryDraft.title}</h2><button className="admin-primary" onClick={() => void saveCategory()}>Save manual</button></div><div className="admin-form-grid"><Field label="Name"><input value={categoryDraft.title} onChange={(event) => setCategoryDraft({ ...categoryDraft, title: event.target.value })} /></Field><Field label="URL slug"><input value={categoryDraft.slug} disabled /></Field><Field label="Brand colour"><input type="color" value={categoryDraft.color} onChange={(event) => setCategoryDraft({ ...categoryDraft, color: event.target.value })} /></Field><Field label="Display order"><input type="number" value={categoryDraft.sort_order} onChange={(event) => setCategoryDraft({ ...categoryDraft, sort_order: Number(event.target.value) })} /></Field></div><Field label="Description"><textarea rows={3} value={categoryDraft.description} onChange={(event) => setCategoryDraft({ ...categoryDraft, description: event.target.value })} /></Field><ImageField label="Manual image" value={categoryDraft.image_url} alt={categoryDraft.image_alt} onChange={(image_url) => setCategoryDraft({ ...categoryDraft, image_url })} onUpload={uploadMedia} /><Field label="Image description"><input value={categoryDraft.image_alt} onChange={(event) => setCategoryDraft({ ...categoryDraft, image_alt: event.target.value })} /></Field><label className="admin-check"><input type="checkbox" checked={categoryDraft.published} onChange={(event) => setCategoryDraft({ ...categoryDraft, published: event.target.checked })} /> Show this manual on the website</label></div>}</section>}

        {view === "homepage" && <section className="admin-view"><header><div><p className="admin-kicker">Front page</p><h1>Homepage</h1></div><button className="admin-primary" onClick={() => void saveConfig()}>Publish changes</button></header><div className="admin-panel"><h2>Story placement</h2><div className="admin-form-grid"><Field label="Lead story"><select value={config.heroArticleSlug} onChange={(event) => setConfig({ ...config, heroArticleSlug: event.target.value })}>{articles.map((article) => <option key={article.slug} value={article.slug}>{article.title}</option>)}</select></Field><span /></div><StringListField label="Secondary story slugs" value={config.secondaryArticleSlugs} onChange={(secondaryArticleSlugs) => setConfig({ ...config, secondaryArticleSlugs })} hint="One article slug per line." /><StringListField label="Quick read slugs" value={config.quickReadSlugs} onChange={(quickReadSlugs) => setConfig({ ...config, quickReadSlugs })} hint="One article slug per line, in display order." /></div><div className="admin-panel"><h2>Section introductions</h2><div className="admin-form-grid"><Field label="Start here label"><input value={config.startHereEyebrow} onChange={(event) => setConfig({ ...config, startHereEyebrow: event.target.value })} /></Field><Field label="Start here heading"><input value={config.startHereTitle} onChange={(event) => setConfig({ ...config, startHereTitle: event.target.value })} /></Field><Field label="Manuals label"><input value={config.manualsEyebrow} onChange={(event) => setConfig({ ...config, manualsEyebrow: event.target.value })} /></Field><Field label="Manuals heading"><input value={config.manualsTitle} onChange={(event) => setConfig({ ...config, manualsTitle: event.target.value })} /></Field><Field label="Manuals description"><textarea rows={3} value={config.manualsDescription} onChange={(event) => setConfig({ ...config, manualsDescription: event.target.value })} /></Field><Field label="Quick reads heading"><input value={config.quickReadsTitle} onChange={(event) => setConfig({ ...config, quickReadsTitle: event.target.value })} /></Field><Field label="Quick reads description"><textarea rows={3} value={config.quickReadsDescription} onChange={(event) => setConfig({ ...config, quickReadsDescription: event.target.value })} /></Field><Field label="Daily brief heading"><input value={config.dailyBriefsTitle} onChange={(event) => setConfig({ ...config, dailyBriefsTitle: event.target.value })} /></Field></div></div><div className="admin-panel"><h2>Start here cards and daily brief</h2><div className="admin-form-grid"><JsonField label="Start here cards" value={config.startHereItems} onChange={(startHereItems) => setConfig({ ...config, startHereItems })} hint="Edit the text, link, icon and colour for each card." /><JsonField label="Daily brief items" value={config.dailyBriefs} onChange={(dailyBriefs) => setConfig({ ...config, dailyBriefs })} /></div></div><div className="admin-panel"><h2>Voice feature</h2><div className="admin-form-grid"><Field label="Label"><input value={config.voice.eyebrow} onChange={(event) => setConfig({ ...config, voice: { ...config.voice, eyebrow: event.target.value } })} /></Field><Field label="Description"><input value={config.voice.description} onChange={(event) => setConfig({ ...config, voice: { ...config.voice, description: event.target.value } })} /></Field><Field label="Quote"><textarea rows={3} value={config.voice.quote} onChange={(event) => setConfig({ ...config, voice: { ...config.voice, quote: event.target.value } })} /></Field><Field label="Attribution"><input value={config.voice.attribution} onChange={(event) => setConfig({ ...config, voice: { ...config.voice, attribution: event.target.value } })} /></Field><Field label="Link"><input value={config.voice.href} onChange={(event) => setConfig({ ...config, voice: { ...config.voice, href: event.target.value } })} /></Field><Field label="Image description"><input value={config.voice.imageAlt} onChange={(event) => setConfig({ ...config, voice: { ...config.voice, imageAlt: event.target.value } })} /></Field></div><ImageField label="Voice image" value={config.voice.imageUrl} alt={config.voice.imageAlt} onChange={(imageUrl) => setConfig({ ...config, voice: { ...config.voice, imageUrl } })} onUpload={uploadMedia} /></div><div className="admin-panel"><h2>Featured manual</h2><div className="admin-form-grid"><Field label="Label"><input value={config.featuredManual.eyebrow} onChange={(event) => setConfig({ ...config, featuredManual: { ...config.featuredManual, eyebrow: event.target.value } })} /></Field><Field label="Title"><input value={config.featuredManual.title} onChange={(event) => setConfig({ ...config, featuredManual: { ...config.featuredManual, title: event.target.value } })} /></Field><Field label="Section description"><input value={config.featuredManual.description} onChange={(event) => setConfig({ ...config, featuredManual: { ...config.featuredManual, description: event.target.value } })} /></Field><Field label="Card summary"><textarea rows={3} value={config.featuredManual.summary} onChange={(event) => setConfig({ ...config, featuredManual: { ...config.featuredManual, summary: event.target.value } })} /></Field><Field label="Read time"><input value={config.featuredManual.readTime} onChange={(event) => setConfig({ ...config, featuredManual: { ...config.featuredManual, readTime: event.target.value } })} /></Field><Field label="Link"><input value={config.featuredManual.href} onChange={(event) => setConfig({ ...config, featuredManual: { ...config.featuredManual, href: event.target.value } })} /></Field><Field label="Image description"><input value={config.featuredManual.imageAlt} onChange={(event) => setConfig({ ...config, featuredManual: { ...config.featuredManual, imageAlt: event.target.value } })} /></Field></div><ImageField label="Featured manual image" value={config.featuredManual.imageUrl} alt={config.featuredManual.imageAlt} onChange={(imageUrl) => setConfig({ ...config, featuredManual: { ...config.featuredManual, imageUrl } })} onUpload={uploadMedia} /></div></section>}

        {view === "site" && <section className="admin-view"><header><div><p className="admin-kicker">Brand, header and footer</p><h1>Site settings</h1></div><button className="admin-primary" onClick={() => void saveConfig()}>Publish changes</button></header><div className="admin-panel"><h2>Brand and contact</h2><div className="admin-form-grid"><Field label="Site name"><input value={config.siteTitle} onChange={(event) => setConfig({ ...config, siteTitle: event.target.value })} /></Field><Field label="Contact email"><input type="email" value={config.contactEmail} onChange={(event) => setConfig({ ...config, contactEmail: event.target.value })} /></Field><Field label="Issue label"><input value={config.issueLabel} onChange={(event) => setConfig({ ...config, issueLabel: event.target.value })} /></Field><Field label="Header topic label"><input value={config.headerLabel} onChange={(event) => setConfig({ ...config, headerLabel: event.target.value })} /></Field></div><Field label="Search and social description"><textarea rows={3} value={config.siteDescription} onChange={(event) => setConfig({ ...config, siteDescription: event.target.value })} /></Field><ImageField label="Website logo" value={config.logoUrl} alt={config.siteTitle} onChange={(logoUrl) => setConfig({ ...config, logoUrl })} onUpload={uploadMedia} /><ImageField label="Social sharing image" value={config.ogImageUrl} alt={config.siteTitle} onChange={(ogImageUrl) => setConfig({ ...config, ogImageUrl })} onUpload={uploadMedia} /><div className="admin-form-grid"><StringListField label="Header topics" value={config.headerTopics} onChange={(headerTopics) => setConfig({ ...config, headerTopics })} /><StringListField label="Popular search topics" value={config.popularTopics} onChange={(popularTopics) => setConfig({ ...config, popularTopics })} /></div><JsonField label="Social links" value={config.socialLinks} onChange={(socialLinks) => setConfig({ ...config, socialLinks })} hint="Available icons: facebook, instagram, tiktok, linkedin and play." /></div><div className="admin-panel"><h2>Newsletter</h2><div className="admin-form-grid"><Field label="Title"><input value={config.newsletter.title} onChange={(event) => setConfig({ ...config, newsletter: { ...config.newsletter, title: event.target.value } })} /></Field><Field label="Button label"><input value={config.newsletter.buttonLabel} onChange={(event) => setConfig({ ...config, newsletter: { ...config.newsletter, buttonLabel: event.target.value } })} /></Field><Field label="Description"><textarea rows={3} value={config.newsletter.description} onChange={(event) => setConfig({ ...config, newsletter: { ...config.newsletter, description: event.target.value } })} /></Field><Field label="Success heading"><input value={config.newsletter.successTitle} onChange={(event) => setConfig({ ...config, newsletter: { ...config.newsletter, successTitle: event.target.value } })} /></Field><Field label="Success message"><input value={config.newsletter.successDescription} onChange={(event) => setConfig({ ...config, newsletter: { ...config.newsletter, successDescription: event.target.value } })} /></Field></div></div><div className="admin-panel"><h2>Footer</h2><Field label="Publication description"><textarea rows={4} value={config.footerDescription} onChange={(event) => setConfig({ ...config, footerDescription: event.target.value })} /></Field><Field label="Signoff"><input value={config.footerSignoff} onChange={(event) => setConfig({ ...config, footerSignoff: event.target.value })} /></Field><JsonField label="Footer columns and links" value={config.footerColumns} onChange={(footerColumns) => setConfig({ ...config, footerColumns })} /></div><div className="admin-panel"><h2>Image credits</h2><JsonField label="Credits and source links" value={config.imageCredits} onChange={(imageCredits) => setConfig({ ...config, imageCredits })} hint="Use imageUrl for newly uploaded files; leave it blank to use the original local file." /></div></section>}

        {view === "messages" && <section className="admin-view"><header><div><p className="admin-kicker">Inbox</p><h1>Contact messages</h1></div><AdminSearch label="Search messages" value={messageSearch} onChange={setMessageSearch} count={filteredMessages.length} /></header><div className="admin-message-list">{filteredMessages.map((item) => <article key={item.id} className={`admin-message admin-message--${item.status}`}><header><div><span className={`admin-pill admin-pill--${item.status}`}>{item.status}</span><strong>{item.subject}</strong></div><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time></header><div className="admin-message__sender"><strong>{item.name}</strong><a href={`mailto:${item.email}`}>{item.email}</a></div><p>{item.message}</p><footer><a className="admin-primary" href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`}>Reply by email</a>{item.status !== "read" && <button className="admin-secondary" onClick={() => void updateMessage(item, "read")}>Mark read</button>}{item.status !== "archived" && <button className="admin-secondary" onClick={() => void updateMessage(item, "archived")}>Archive</button>}<button className="admin-message__delete" onClick={() => void deleteMessage(item)}>Delete</button></footer></article>)}</div>{filteredMessages.length === 0 && <div className="admin-empty"><strong>{messages.length === 0 ? "No contact messages yet" : "No matching messages"}</strong><p>{messages.length === 0 ? "New submissions from the Contact page will appear here." : "Search by sender, email, subject, message or status."}</p></div>}</section>}

        {view === "subscribers" && <section className="admin-view"><header><div><p className="admin-kicker">Audience</p><h1>Subscribers</h1></div><div className="admin-header-actions"><AdminSearch label="Search subscribers" value={subscriberSearch} onChange={setSubscriberSearch} count={filteredSubscribers.length} /><button className="admin-secondary" onClick={exportSubscribers}>Export CSV</button></div></header><div className="admin-table-wrap"><table><thead><tr><th>Email</th><th>Status</th><th>Source</th><th>Joined</th><th /></tr></thead><tbody>{filteredSubscribers.map((item) => <tr key={item.id}><td>{item.email}</td><td><span className={`admin-pill admin-pill--${item.status}`}>{item.status}</span></td><td>{item.source}</td><td>{new Date(item.created_at).toLocaleDateString()}</td><td><button onClick={() => void updateSubscriber(item, item.status === "active" ? "unsubscribed" : "active")}>{item.status === "active" ? "Unsubscribe" : "Reactivate"}</button></td></tr>)}</tbody></table>{filteredSubscribers.length === 0 && <div className="admin-empty"><strong>{subscribers.length === 0 ? "No subscribers yet" : "No matching subscribers"}</strong><p>{subscribers.length === 0 ? "New website signups will appear here." : "Search by email, source, status or joined date."}</p></div>}</div></section>}

        {view === "media" && <section className="admin-view"><header><div><p className="admin-kicker">Supabase Storage</p><h1>Media library</h1></div><div className="admin-header-actions"><AdminSearch label="Search media" value={mediaSearch} onChange={setMediaSearch} count={filteredMedia.length} /><label className="admin-primary admin-file-action">Upload images<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(event) => void Promise.all(Array.from(event.target.files ?? []).map(uploadMedia))} /></label></div></header><div className="admin-media-grid">{filteredMedia.map((file) => { const url = client?.storage.from("site-media").getPublicUrl(`uploads/${file.name}`).data.publicUrl ?? ""; return <article key={file.id ?? file.name}><img src={url} alt="" /><div><strong title={file.name}>{file.name}</strong><span>{formatBytes(file.metadata?.size)}</span><button onClick={() => void navigator.clipboard.writeText(url).then(() => showNotice("success", "Image URL copied."))}>Copy URL</button><button className="danger" onClick={() => void deleteMedia(file)}>Delete</button></div></article>; })}</div>{filteredMedia.length === 0 && <div className="admin-empty"><strong>{media.length === 0 ? "No uploaded media yet" : "No matching media"}</strong><p>{media.length === 0 ? "Upload an image here or replace one while editing an article." : "Search by filename or file type."}</p></div>}</section>}
      </>}
    </main>
  </div>;
}
