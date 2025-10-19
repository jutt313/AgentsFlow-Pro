import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing-hero">
      <div className="hero-content">
        <h1 className="hero-title">AgentFlow PRO</h1>
        <p className="hero-subtitle">
          Stop building AI tools. Start hiring AI employees.
        </p>
        <div className="hero-cta">
          <Link href="/register" className="cta-primary">
            Get Started Free
          </Link>
          <Link href="/login" className="cta-secondary">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

