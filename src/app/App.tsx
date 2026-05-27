import { useState } from "react";
import {
  Settings, Github, Search, Star, GitFork, Clock, Zap,
  Brain, Code2, Shield, FileText, Key, Bot, X, Eye, EyeOff,
  LogOut, ChevronRight, Plus, RefreshCw, GitBranch, Play,
  Pause, Database, Package, Globe, BookOpen, Lock, Filter,
  Check, Menu, BarChart2, AlertCircle, CheckCircle,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type AuthUser = { name: string; email: string; avatar: string; provider: "microsoft" | "google" };
type Repository = {
  id: string; name: string; fullName: string; description: string;
  language: string; languageColor: string; stars: number; forks: number;
  lastCommit: string; provider: "github" | "azuredevops" | "gitlab" | "bitbucket";
  isPrivate: boolean; selected: boolean; branch: string; openIssues: number;
};
type Agent = { id: string; name: string; model: string; provider: string; description: string; enabled: boolean; color: string };
type Prompt = { id: string; name: string; category: string; content: string; enabled: boolean; tags: string[] };
type ApiKey = { id: string; provider: string; color: string; key: string; orgId: string; connected: boolean };
type Connection = { id: string; name: string; type: string; color: string; connected: boolean };

// ─── Seed data ───────────────────────────────────────────────────────────────

const SEED_REPOS: Repository[] = [
  {
    id: "1", name: "frontend-dashboard", fullName: "acme-corp/frontend-dashboard",
    description: "React analytics dashboard with real-time data visualization and customizable widgets",
    language: "TypeScript", languageColor: "#3178c6", stars: 847, forks: 124,
    lastCommit: "2 hours ago", provider: "github", isPrivate: false, selected: false, branch: "main", openIssues: 12,
  },
  {
    id: "2", name: "ml-pipeline", fullName: "acme-corp/ml-pipeline",
    description: "Distributed ML training pipeline with PyTorch and TensorFlow support, Kubernetes orchestration",
    language: "Python", languageColor: "#3572A5", stars: 2341, forks: 389,
    lastCommit: "5 hours ago", provider: "github", isPrivate: false, selected: false, branch: "main", openIssues: 28,
  },
  {
    id: "3", name: "api-gateway", fullName: "acme-corp/api-gateway",
    description: "High-performance API gateway with rate limiting, auth middleware and OpenAPI spec generation",
    language: "Go", languageColor: "#00ADD8", stars: 412, forks: 67,
    lastCommit: "1 day ago", provider: "github", isPrivate: true, selected: false, branch: "develop", openIssues: 5,
  },
  {
    id: "4", name: "AzureFunctions.Core", fullName: "acme-corp/AzureFunctions.Core",
    description: "Azure Functions serverless library with dependency injection, typed configuration and telemetry",
    language: "C#", languageColor: "#239120", stars: 0, forks: 0,
    lastCommit: "3 days ago", provider: "azuredevops", isPrivate: true, selected: false, branch: "main", openIssues: 7,
  },
  {
    id: "5", name: "data-processor", fullName: "acme-corp/data-processor",
    description: "ETL pipeline for processing and transforming large datasets with Apache Spark integration",
    language: "Python", languageColor: "#3572A5", stars: 0, forks: 0,
    lastCommit: "1 week ago", provider: "azuredevops", isPrivate: true, selected: false, branch: "release/2.4", openIssues: 3,
  },
  {
    id: "6", name: "mobile-app", fullName: "acme-corp/mobile-app",
    description: "Cross-platform React Native app with offline-first architecture and push notifications",
    language: "TypeScript", languageColor: "#3178c6", stars: 156, forks: 23,
    lastCommit: "6 hours ago", provider: "github", isPrivate: true, selected: false, branch: "main", openIssues: 19,
  },
  {
    id: "7", name: "infra-terraform", fullName: "acme-corp/infra-terraform",
    description: "Infrastructure as code for multi-region AWS deployments with DR failover and auto-scaling",
    language: "HCL", languageColor: "#7b42bc", stars: 0, forks: 0,
    lastCommit: "4 hours ago", provider: "gitlab", isPrivate: true, selected: false, branch: "main", openIssues: 2,
  },
  {
    id: "8", name: "auth-service", fullName: "acme-corp/auth-service",
    description: "OAuth 2.0 / OIDC identity provider with PKCE support, MFA, and session management",
    language: "Rust", languageColor: "#dea584", stars: 231, forks: 41,
    lastCommit: "12 hours ago", provider: "github", isPrivate: true, selected: false, branch: "main", openIssues: 8,
  },
];

const SEED_AGENTS: Agent[] = [
  { id: "1", name: "Code Reviewer", model: "gpt-4o", provider: "openai", description: "Reviews code for quality, patterns, and best practices", enabled: true, color: "#10b981" },
  { id: "2", name: "Security Scanner", model: "claude-sonnet-4-6", provider: "anthropic", description: "Identifies security vulnerabilities and OWASP Top 10 issues", enabled: true, color: "#ef4444" },
  { id: "3", name: "Docs Generator", model: "gemini-1.5-pro", provider: "google", description: "Generates comprehensive documentation from source code", enabled: false, color: "#f59e0b" },
  { id: "4", name: "Dependency Auditor", model: "gpt-4o-mini", provider: "openai", description: "Scans dependencies for outdated packages and known CVEs", enabled: true, color: "#8b5cf6" },
  { id: "5", name: "Performance Profiler", model: "claude-haiku-4-5", provider: "anthropic", description: "Identifies bottlenecks and optimization opportunities", enabled: false, color: "#3b82f6" },
];

const SEED_PROMPTS: Prompt[] = [
  { id: "1", name: "Security Vulnerability Review", category: "Security", content: "Analyze this code for SQL injection, XSS, CSRF, authentication flaws, and OWASP Top 10 issues. Provide specific line references and remediation steps.", enabled: true, tags: ["security", "owasp", "vulnerability"] },
  { id: "2", name: "Code Quality Analysis", category: "Quality", content: "Review for code smells, duplications, overly complex functions, poor naming, and SOLID principle violations. Suggest concrete refactoring steps.", enabled: true, tags: ["quality", "solid", "clean-code"] },
  { id: "3", name: "API Documentation", category: "Documentation", content: "Generate comprehensive API documentation including endpoint descriptions, request/response schemas, auth requirements, and usage examples.", enabled: false, tags: ["docs", "api", "openapi"] },
  { id: "4", name: "Dependency Analysis", category: "Dependencies", content: "Audit all project dependencies for outdated versions, known CVEs, license compatibility issues, and suggest modern alternatives.", enabled: true, tags: ["dependencies", "cve", "license"] },
  { id: "5", name: "TypeScript Type Coverage", category: "Quality", content: "Analyze TypeScript type coverage, identify any usage, implicit any patterns, and missing return types. Suggest strict-mode compatible improvements.", enabled: false, tags: ["typescript", "types", "coverage"] },
];

const SEED_API_KEYS: ApiKey[] = [
  { id: "openai", provider: "OpenAI", color: "#10a37f", key: "", orgId: "", connected: false },
  { id: "anthropic", provider: "Anthropic (Claude)", color: "#d97706", key: "", orgId: "", connected: false },
  { id: "google", provider: "Google (Gemini)", color: "#4285f4", key: "", orgId: "", connected: false },
  { id: "cohere", provider: "Cohere", color: "#8b5cf6", key: "", orgId: "", connected: false },
  { id: "mistral", provider: "Mistral AI", color: "#f97316", key: "", orgId: "", connected: false },
];

const SEED_CONNECTIONS: Connection[] = [
  { id: "github", name: "GitHub", type: "github", color: "#e6edf3", connected: false },
  { id: "azuredevops", name: "Azure DevOps", type: "azuredevops", color: "#0078d4", connected: false },
  { id: "gitlab", name: "GitLab", type: "gitlab", color: "#fc6d26", connected: false },
  { id: "bitbucket", name: "Bitbucket", type: "bitbucket", color: "#0052cc", connected: false },
];

const HISTORY_ITEMS = [
  { id: "h1", repo: "frontend-dashboard", status: "completed", agents: 3, issues: 14, duration: "4m 12s", date: "Today, 09:41 AM" },
  { id: "h2", repo: "ml-pipeline", status: "completed", agents: 2, issues: 7, duration: "11m 38s", date: "Today, 08:15 AM" },
  { id: "h3", repo: "api-gateway", status: "failed", agents: 2, issues: 0, duration: "0m 53s", date: "Yesterday, 6:02 PM" },
  { id: "h4", repo: "auth-service", status: "completed", agents: 4, issues: 22, duration: "9m 07s", date: "Yesterday, 11:30 AM" },
  { id: "h5", repo: "data-processor", status: "completed", agents: 2, issues: 3, duration: "6m 21s", date: "May 24, 2:45 PM" },
];

// ─── Icons ───────────────────────────────────────────────────────────────────

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function ProviderIcon({ type, size = 16 }: { type: string; size?: number }) {
  if (type === "github") return <Github size={size} />;
  if (type === "azuredevops") return <Database size={size} style={{ color: "#0078d4" }} />;
  if (type === "gitlab") return <Code2 size={size} style={{ color: "#fc6d26" }} />;
  if (type === "bitbucket") return <Package size={size} style={{ color: "#0052cc" }} />;
  return <Globe size={size} />;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 ${checked ? "bg-primary" : "bg-white/10"}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

// ─── Login Page ──────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: (u: AuthUser) => void }) {
  const handleLogin = (provider: "microsoft" | "google") => {
    onLogin({
      name: "Alex Chen",
      email: provider === "microsoft" ? "alex.chen@acme.corp" : "alex.chen@gmail.com",
      avatar: "AC",
      provider,
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a1f4e 0%, #07091a 55%)" }}
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl" style={{ background: "#6366f1" }} />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5 border border-primary/30" style={{ background: "rgba(99,102,241,0.15)" }}>
            <Brain size={24} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Code<span className="text-primary">Forge</span>
          </h1>
          <p className="text-sm text-muted-foreground">AI-powered code intelligence platform</p>
        </div>

        <div
          className="rounded-2xl border border-white/8 p-7"
          style={{ background: "rgba(13, 18, 36, 0.85)", backdropFilter: "blur(24px)" }}
        >
          <p className="text-sm font-medium text-foreground text-center mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Sign in to your workspace
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleLogin("microsoft")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8 hover:border-white/14 hover:bg-white/4 transition-all duration-150 text-foreground text-sm font-medium group"
            >
              <MicrosoftIcon />
              <span className="flex-1 text-left">Continue with Microsoft</span>
              <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => handleLogin("google")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8 hover:border-white/14 hover:bg-white/4 transition-all duration-150 text-foreground text-sm font-medium group"
            >
              <GoogleIcon />
              <span className="flex-1 text-left">Continue with Google</span>
              <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By signing in you agree to our{" "}
            <span className="text-primary/80 cursor-pointer hover:text-primary">Terms</span>
            {" & "}
            <span className="text-primary/80 cursor-pointer hover:text-primary">Privacy Policy</span>
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: Shield, label: "Security scan" },
            { icon: Code2, label: "Code review" },
            { icon: FileText, label: "Auto docs" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="text-center">
              <div className="w-8 h-8 rounded-lg border border-primary/15 flex items-center justify-center mx-auto mb-1.5" style={{ background: "rgba(99,102,241,0.08)" }}>
                <Icon size={13} className="text-primary/60" />
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({
  expanded, setExpanded, activeSection, setActiveSection, onSettings, user, onLogout,
}: {
  expanded: boolean; setExpanded: (v: boolean) => void;
  activeSection: string; setActiveSection: (s: string) => void;
  onSettings: () => void; user: AuthUser; onLogout: () => void;
}) {
  const nav = [
    { id: "repositories", icon: GitBranch, label: "Repositories" },
    { id: "analysis", icon: Zap, label: "Analysis Queue" },
    { id: "history", icon: Clock, label: "History" },
    { id: "agents", icon: Bot, label: "AI Agents" },
  ];

  return (
    <aside
      className={`flex-shrink-0 flex flex-col border-r border-border/50 transition-all duration-300 ${expanded ? "w-56" : "w-16"}`}
      style={{ background: "#09101f" }}
    >
      <div className="h-14 flex items-center gap-3 px-4 border-b border-border/50 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg border border-primary/30 flex items-center justify-center flex-shrink-0" style={{ background: "rgba(99,102,241,0.15)" }}>
          <Brain size={14} className="text-primary" />
        </div>
        {expanded && (
          <span className="text-sm font-bold text-foreground flex-1 whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Code<span className="text-primary">Forge</span>
          </span>
        )}
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors ml-auto">
          <Menu size={15} />
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {nav.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
              activeSection === id
                ? "bg-primary/15 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/4"
            }`}
          >
            <Icon size={15} className="flex-shrink-0" />
            {expanded && <span className="font-medium truncate text-left">{label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-2 border-t border-border/50 space-y-0.5">
        <button
          onClick={onSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/4 transition-all"
        >
          <Settings size={15} className="flex-shrink-0" />
          {expanded && <span>Settings</span>}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/8 transition-all"
        >
          <LogOut size={15} className="flex-shrink-0" />
          {expanded && <span>Sign out</span>}
        </button>
        {expanded && (
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="w-7 h-7 rounded-full border border-primary/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary" style={{ background: "rgba(99,102,241,0.15)" }}>
              {user.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Repository Card ─────────────────────────────────────────────────────────

function RepoCard({ repo, onToggle }: { repo: Repository; onToggle: (id: string) => void }) {
  return (
    <div
      onClick={() => onToggle(repo.id)}
      className={`rounded-xl border p-5 transition-all duration-200 cursor-pointer group ${
        repo.selected
          ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5"
          : "border-border/60 bg-card hover:border-white/12 hover:bg-card/80"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 text-muted-foreground">
            <ProviderIcon type={repo.provider} size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {repo.name}
              </span>
              {repo.isPrivate && <Lock size={10} className="text-muted-foreground flex-shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground truncate">{repo.fullName}</p>
          </div>
        </div>
        <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ml-2 transition-all ${
          repo.selected ? "bg-primary border-primary" : "border-white/15 group-hover:border-primary/40"
        }`}>
          {repo.selected && <Check size={11} className="text-white" />}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{repo.description}</p>

      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: repo.languageColor }} />
          {repo.language}
        </span>
        {repo.stars > 0 && (
          <span className="flex items-center gap-1">
            <Star size={10} />
            {repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}
          </span>
        )}
        {repo.forks > 0 && (
          <span className="flex items-center gap-1">
            <GitFork size={10} />
            {repo.forks}
          </span>
        )}
        <span className="flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <GitBranch size={10} />
          {repo.branch}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Clock size={10} />
          {repo.lastCommit}
        </span>
      </div>
    </div>
  );
}

// ─── Repositories View ────────────────────────────────────────────────────────

function RepositoriesView({
  repos, setRepos, searchQuery, onAnalyze,
}: {
  repos: Repository[]; setRepos: (r: Repository[]) => void;
  searchQuery: string; onAnalyze: () => void;
}) {
  const [filterProvider, setFilterProvider] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");

  const toggle = (id: string) => setRepos(repos.map(r => r.id === id ? { ...r, selected: !r.selected } : r));

  const filtered = repos.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    const matchP = filterProvider === "all" || r.provider === filterProvider;
    const matchL = filterLanguage === "all" || r.language === filterLanguage;
    return matchQ && matchP && matchL;
  });

  const selected = repos.filter(r => r.selected).length;
  const languages = [...new Set(repos.map(r => r.language))];

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Repositories
          </h2>
          <p className="text-xs text-muted-foreground">
            {repos.length} repositories · {selected} selected for analysis
          </p>
        </div>
        {selected > 0 && (
          <button
            onClick={onAnalyze}
            className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg text-xs font-semibold text-white hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            <Zap size={13} />
            Analyze {selected} repo{selected !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
          <Filter size={11} /> Source:
        </span>
        {["all", "github", "azuredevops", "gitlab", "bitbucket"].map(p => (
          <button
            key={p}
            onClick={() => setFilterProvider(p)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filterProvider === p
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground bg-white/4 border border-transparent hover:border-white/8"
            }`}
          >
            {p === "all" ? "All" : p === "azuredevops" ? "Azure DevOps" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1.5 flex-wrap">
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => setFilterLanguage(filterLanguage === lang ? "all" : lang)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                filterLanguage === lang
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang}
            </button>
          ))}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(r => <RepoCard key={r.id} repo={r} onToggle={toggle} />)}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <GitBranch size={28} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm">No repositories match your filters</p>
        </div>
      )}
    </div>
  );
}

// ─── Analysis Queue View ──────────────────────────────────────────────────────

function AnalysisView({ selected }: { selected: Repository[] }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  if (selected.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-center">
        <Zap size={36} className="text-muted-foreground/20 mb-4" />
        <h3 className="text-sm font-semibold text-foreground mb-1">No repositories selected</h3>
        <p className="text-xs text-muted-foreground">Go to Repositories and select repos to analyze</p>
      </div>
    );
  }

  const handleToggle = () => {
    if (!running) {
      setRunning(true);
      setProgress(0);
      const iv = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(iv); setRunning(false); return 100; }
          return p + 2;
        });
      }, 80);
    } else {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-foreground mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Analysis Queue
          </h2>
          <p className="text-xs text-muted-foreground">{selected.length} repositor{selected.length !== 1 ? "ies" : "y"} queued</p>
        </div>
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
            running
              ? "bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {running ? <><Pause size={13} /> Stop</> : <><Play size={13} /> Start Analysis</>}
        </button>
      </div>

      {running && (
        <div className="mb-4 rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Analyzing {selected[0].name}…</span>
            <span className="text-xs font-mono text-primary">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {selected.map((repo, i) => (
          <div key={repo.id} className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              running && i === 0 ? "text-primary border border-primary/40 bg-primary/15" : "bg-white/5 text-muted-foreground"
            }`}>
              {running && i === 0 ? <RefreshCw size={13} className="animate-spin" /> : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{repo.name}</p>
              <p className="text-xs text-muted-foreground">{repo.language} · {repo.branch}</p>
            </div>
            <span className={`text-xs ${running && i === 0 ? "text-primary" : "text-muted-foreground"}`}>
              {running && i === 0 ? "Analyzing…" : running ? "Queued" : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── History View ─────────────────────────────────────────────────────────────

function HistoryView() {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>History</h2>
      <p className="text-xs text-muted-foreground mb-6">Past analysis runs</p>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50" style={{ background: "rgba(255,255,255,0.02)" }}>
              {["Repository", "Status", "Agents", "Issues", "Duration", "Date"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HISTORY_ITEMS.map((item, i) => (
              <tr key={item.id} className={`border-b border-border/30 hover:bg-white/2 transition-colors ${i === HISTORY_ITEMS.length - 1 ? "border-0" : ""}`}>
                <td className="px-4 py-3 text-xs font-medium text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {item.repo}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                    item.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}>
                    {item.status === "completed" ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{item.agents}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{item.issues}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{item.duration}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Agents Overview ──────────────────────────────────────────────────────────

function AgentsOverview({ agents }: { agents: Agent[] }) {
  const active = agents.filter(a => a.enabled).length;
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Agents</h2>
      <p className="text-xs text-muted-foreground mb-6">{active} of {agents.length} agents active · Configure in Settings</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map(a => (
          <div key={a.id} className={`rounded-xl border p-4 ${a.enabled ? "border-border/60 bg-card" : "border-border/30 bg-card/40 opacity-60"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/8" style={{ background: `${a.color}18` }}>
                <Bot size={16} style={{ color: a.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{a.name}</p>
                <span className="text-xs text-muted-foreground capitalize">{a.provider}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{a.description}</p>
            <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {a.model}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Drawer ──────────────────────────────────────────────────────────

function SettingsDrawer({
  onClose, agents, setAgents, prompts, setPrompts,
  apiKeys, setApiKeys, connections, setConnections,
}: {
  onClose: () => void;
  agents: Agent[]; setAgents: (a: Agent[]) => void;
  prompts: Prompt[]; setPrompts: (p: Prompt[]) => void;
  apiKeys: ApiKey[]; setApiKeys: (k: ApiKey[]) => void;
  connections: Connection[]; setConnections: (c: Connection[]) => void;
}) {
  const [tab, setTab] = useState("connections");
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [patValues, setPatValues] = useState<Record<string, string>>({});

  const tabs = [
    { id: "connections", label: "Connections", icon: Globe },
    { id: "agents", label: "AI Agents", icon: Bot },
    { id: "prompts", label: "Prompts", icon: BookOpen },
    { id: "apikeys", label: "API Keys", icon: Key },
  ];

  const toggleConnection = (id: string) =>
    setConnections(connections.map(c => c.id === id ? { ...c, connected: !c.connected } : c));

  const toggleAgent = (id: string) =>
    setAgents(agents.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));

  const togglePrompt = (id: string) =>
    setPrompts(prompts.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));

  const updateKey = (id: string, field: "key" | "orgId", val: string) =>
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, [field]: val } : k));

  const connectKey = (id: string) =>
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, connected: true } : k));

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative ml-auto w-full max-w-xl flex flex-col h-full border-l border-border/50 overflow-hidden"
        style={{ background: "#090d1e" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Settings size={15} className="text-primary" />
            <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Settings
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/50 px-2 flex-shrink-0 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ── Connections ── */}
          {tab === "connections" && (
            <>
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Repository Connections
                </h3>
                <p className="text-xs text-muted-foreground">Connect code hosting platforms to browse and analyze repositories</p>
              </div>
              {connections.map(conn => (
                <div key={conn.id} className="rounded-xl border border-border/50 bg-card/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl border border-border/50 flex items-center justify-center bg-white/4">
                        <ProviderIcon type={conn.type} size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{conn.name}</p>
                        {conn.connected && <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5"><CheckCircle size={10} /> Connected</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleConnection(conn.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        conn.connected
                          ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                          : "bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25"
                      }`}
                    >
                      {conn.connected ? "Disconnect" : "Connect"}
                    </button>
                  </div>

                  {!conn.connected && (
                    <div className="pt-3 border-t border-border/30 space-y-2">
                      {conn.type === "github" ? (
                        <>
                          <p className="text-xs text-muted-foreground mb-2">Authenticate via OAuth or Personal Access Token</p>
                          <div className="flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border border-white/10 bg-white/5 hover:bg-white/8 text-foreground transition-colors">
                              <Github size={13} /> OAuth with GitHub
                            </button>
                            <button className="px-3 py-2 rounded-lg text-xs text-muted-foreground border border-border/50 hover:text-foreground bg-white/3 transition-colors">
                              Use PAT
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {conn.type === "azuredevops" && (
                            <input
                              type="text"
                              placeholder="Organization URL (e.g. https://dev.azure.com/yourorg)"
                              className="w-full text-xs rounded-lg px-3 py-2 border border-border/50 bg-white/4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            />
                          )}
                          <div className="relative">
                            <input
                              type={showKey[conn.id] ? "text" : "password"}
                              placeholder="Personal Access Token (PAT)"
                              value={patValues[conn.id] || ""}
                              onChange={e => setPatValues(p => ({ ...p, [conn.id]: e.target.value }))}
                              className="w-full text-xs rounded-lg px-3 py-2 pr-9 border border-border/50 bg-white/4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            />
                            <button
                              onClick={() => setShowKey(s => ({ ...s, [conn.id]: !s[conn.id] }))}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showKey[conn.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ── AI Agents ── */}
          {tab === "agents" && (
            <>
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Agents</h3>
                <p className="text-xs text-muted-foreground">Configure which agents run during analysis</p>
              </div>
              {agents.map(agent => (
                <div key={agent.id} className="rounded-xl border border-border/50 bg-card/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/6" style={{ background: `${agent.color}18` }}>
                      <Bot size={15} style={{ color: agent.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{agent.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{agent.description}</p>
                        </div>
                        <Toggle checked={agent.enabled} onChange={() => toggleAgent(agent.id)} />
                      </div>
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {agent.model}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">{agent.provider}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── Prompts & Skills ── */}
          {tab === "prompts" && (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Prompts & Skills</h3>
                  <p className="text-xs text-muted-foreground">Manage analysis prompts and skills</p>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors">
                  <Plus size={11} /> New Prompt
                </button>
              </div>
              {prompts.map(prompt => (
                <div key={prompt.id} className="rounded-xl border border-border/50 bg-card/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="text-sm font-semibold text-foreground">{prompt.name}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">{prompt.category}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{prompt.content}</p>
                        </div>
                        <Toggle checked={prompt.enabled} onChange={() => togglePrompt(prompt.id)} />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {prompt.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary/70" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── API Keys ── */}
          {tab === "apikeys" && (
            <>
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>API Keys & Secrets</h3>
                <p className="text-xs text-muted-foreground">Credentials for AI providers. Keys are encrypted at rest and never logged.</p>
              </div>
              {apiKeys.map(apiKey => (
                <div key={apiKey.id} className="rounded-xl border border-border/50 bg-card/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/8 text-xs font-bold" style={{ background: `${apiKey.color}20`, color: apiKey.color }}>
                        {apiKey.provider.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{apiKey.provider}</span>
                    </div>
                    {apiKey.connected && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle size={11} /> Connected
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showKey[`${apiKey.id}_key`] ? "text" : "password"}
                        value={apiKey.key}
                        onChange={e => updateKey(apiKey.id, "key", e.target.value)}
                        placeholder={`${apiKey.provider} API Key`}
                        className="w-full text-xs rounded-lg px-3 py-2 pr-9 border border-border/50 bg-white/4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      />
                      <button
                        onClick={() => setShowKey(s => ({ ...s, [`${apiKey.id}_key`]: !s[`${apiKey.id}_key`] }))}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showKey[`${apiKey.id}_key`] ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={apiKey.orgId}
                      onChange={e => updateKey(apiKey.id, "orgId", e.target.value)}
                      placeholder="Organization / Project ID (optional)"
                      className="w-full text-xs rounded-lg px-3 py-2 border border-border/50 bg-white/4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                    {apiKey.key && !apiKey.connected && (
                      <button
                        onClick={() => connectKey(apiKey.id)}
                        className="w-full py-2 rounded-lg text-xs font-semibold bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors"
                      >
                        Save & Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeSection, setActiveSection] = useState("repositories");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [repos, setRepos] = useState<Repository[]>(SEED_REPOS);
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>(SEED_AGENTS);
  const [prompts, setPrompts] = useState<Prompt[]>(SEED_PROMPTS);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(SEED_API_KEYS);
  const [connections, setConnections] = useState<Connection[]>(SEED_CONNECTIONS);

  if (!user) return <LoginPage onLogin={setUser} />;

  const selectedRepos = repos.filter(r => r.selected);
  const connectedCount = connections.filter(c => c.connected).length;
  const activeAgents = agents.filter(a => a.enabled).length;

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar
        expanded={sidebarExpanded}
        setExpanded={setSidebarExpanded}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onSettings={() => setSettingsOpen(true)}
        user={user}
        onLogout={() => setUser(null)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 flex items-center gap-4 px-6 border-b border-border/50 flex-shrink-0"
          style={{ background: "#0a0e20" }}
        >
          <div className="flex-1 relative max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search repositories…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg pl-8 pr-3 py-2 border border-border/50 bg-white/4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <span>{connectedCount} source{connectedCount !== 1 ? "s" : ""}</span>
              <span className="w-px h-3 bg-border/60" />
              <span>{activeAgents} agent{activeAgents !== 1 ? "s" : ""} active</span>
              {selectedRepos.length > 0 && (
                <>
                  <span className="w-px h-3 bg-border/60" />
                  <span className="text-primary font-medium">{selectedRepos.length} selected</span>
                </>
              )}
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <Settings size={15} />
            </button>
            <div
              className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center text-xs font-bold text-primary cursor-pointer"
              style={{ background: "rgba(99,102,241,0.15)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              title={`${user.name} · ${user.email}`}
            >
              {user.avatar}
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activeSection === "repositories" && (
            <RepositoriesView
              repos={repos}
              setRepos={setRepos}
              searchQuery={searchQuery}
              onAnalyze={() => setActiveSection("analysis")}
            />
          )}
          {activeSection === "analysis" && <AnalysisView selected={selectedRepos} />}
          {activeSection === "history" && <HistoryView />}
          {activeSection === "agents" && <AgentsOverview agents={agents} />}
        </main>
      </div>

      {settingsOpen && (
        <SettingsDrawer
          onClose={() => setSettingsOpen(false)}
          agents={agents}
          setAgents={setAgents}
          prompts={prompts}
          setPrompts={setPrompts}
          apiKeys={apiKeys}
          setApiKeys={setApiKeys}
          connections={connections}
          setConnections={setConnections}
        />
      )}
    </div>
  );
}
