import { FormEvent, useState } from "react";
import re9Image from "./assets/images/re9-requiem.jpg";
import re2Image from "./assets/images/re2-claire.webp";
import re4Image from "./assets/images/re4.jpg";

type Screen = "home" | "login" | "cadastro";

type AuthFormState = {
  nome: string;
  email: string;
  senha: string;
};

const initialLoginState: AuthFormState = {
  nome: "",
  email: "",
  senha: "",
};

const initialCadastroState: AuthFormState = {
  nome: "",
  email: "",
  senha: "",
};

const featuredCards = [
  {
    id: "re9",
    title: "Resident Evil 9 redefine o terror com ação intensa e narrativa sombria.",
    image: re9Image,
    badge: "DESTAQUE",
    large: true,
  },
  {
    id: "re2",
    title: "Resident Evil 2 é o capítulo mais assustador da franquia clássica.",
    image: re2Image,
    badge: "ANÁLISE",
    large: false,
  },
  {
    id: "re4",
    title: "Resident Evil 4 elevou a franquia com ação intensa e revolucionária.",
    image: re4Image,
    badge: "CLÁSSICO",
    large: false,
  },
];

export function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [notice, setNotice] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginForm, setLoginForm] = useState<AuthFormState>(initialLoginState);
  const [cadastroForm, setCadastroForm] = useState<AuthFormState>(initialCadastroState);
  const destaque = featuredCards[0];
  const laterais = featuredCards.slice(1);
  const navigationItems = [
    { label: "Home", target: "home" as Screen },
    { label: "Cadastro", target: "cadastro" as Screen },
    { label: "Login", target: "login" as Screen },
  ];

  function openScreen(nextScreen: Screen) {
    setNotice(null);
    setScreen(nextScreen);
    setMobileMenuOpen(false);
  }

  function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!loginForm.email.trim() || !loginForm.senha.trim()) {
      setNotice("Preencha email e senha para continuar.");
      return;
    }

    setNotice("Login pronto para a próxima etapa de autenticação.");
  }

  function handleCadastroSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cadastroForm.nome.trim() || !cadastroForm.email.trim() || !cadastroForm.senha.trim()) {
      setNotice("Preencha nome, email e senha para criar sua conta de usuário.");
      return;
    }

    setNotice("Cadastro de usuário preparado. Agora faça login para acessar a comunidade.");
    setCadastroForm(initialCadastroState);
    setScreen("login");
  }

  function renderAuthChrome(title: string, description: string, formId: string) {
    return (
      <section className="auth-shell">
        <div className="auth-copy">
          <span className="tag">{title}</span>
          <h1>{description}</h1>
          <p>O login e o cadastro já ficam prontos para receber a validação real quando a integração entrar.</p>
        </div>

        <form id={formId} onSubmit={formId === "login-form" ? handleLoginSubmit : handleCadastroSubmit} className="auth-form panel">
          {formId === "cadastro-form" && (
            <input
              value={cadastroForm.nome}
              onChange={(event) => setCadastroForm((old) => ({ ...old, nome: event.target.value }))}
              placeholder="Nome"
            />
          )}
          <input
            value={formId === "login-form" ? loginForm.email : cadastroForm.email}
            onChange={(event) =>
              formId === "login-form"
                ? setLoginForm((old) => ({ ...old, email: event.target.value }))
                : setCadastroForm((old) => ({ ...old, email: event.target.value }))
            }
            placeholder="Email"
            type="email"
          />
          <input
            value={formId === "login-form" ? loginForm.senha : cadastroForm.senha}
            onChange={(event) =>
              formId === "login-form"
                ? setLoginForm((old) => ({ ...old, senha: event.target.value }))
                : setCadastroForm((old) => ({ ...old, senha: event.target.value }))
            }
            placeholder="Senha"
            type="password"
          />

          <button type="submit" className="full">
            {formId === "login-form" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </section>
    );
  }

  function handleNavTarget(target: Screen) {
    openScreen(target);
  }

  return (
    <div className="page">
      <header className="topbar">
        <button type="button" className="logo" onClick={() => openScreen("home")}>
          RESIDENT EVIL FORUM
        </button>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={mobileMenuOpen}
          aria-label="Abrir menu"
          onClick={() => setMobileMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className="menu desktop-menu">
          {navigationItems.map((item) => (
            <button key={item.label} type="button" onClick={() => handleNavTarget(item.target)}>
              {item.label}
            </button>
          ))}
        </nav>
        <nav className={mobileMenuOpen ? "menu mobile-menu open" : "menu mobile-menu"}>
          {navigationItems.map((item) => (
            <button key={item.label} type="button" onClick={() => handleNavTarget(item.target)}>
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="layout">
        {screen === "home" && (
          <>
            <section className="hero-grid">
              <article className="hero-card big">
                <img src={destaque.image} alt={destaque.title} />
                <div className="overlay" />
                <div className="content">
                  <span className="tag">{destaque.badge}</span>
                  <h1>{destaque.title}</h1>
                </div>
              </article>

              <aside className="side-column">
                {laterais.map((card) => (
                  <article key={card.id} className="hero-card small">
                    <img src={card.image} alt={card.title} />
                    <div className="overlay" />
                    <div className="content">
                      <span className="tag">{card.badge}</span>
                      <h2>{card.title}</h2>
                    </div>
                  </article>
                ))}
              </aside>
            </section>

            <footer className="footer panel">
              <div>
                <h3>Resident Evil Forum</h3>
                <p>Comunidade feita por fãs da franquia Resident Evil.</p>
              </div>
              <div className="footer-links">
                <span>Links rápidos:</span>
                <div className="footer-links-list">
                  {navigationItems.map((item, index) => (
                    <span key={item.label} className="footer-link-item">
                      <button type="button" onClick={() => handleNavTarget(item.target)}>
                        {item.label}
                      </button>
                      {index < navigationItems.length - 1 ? <span className="link-separator">|</span> : null}
                    </span>
                  ))}
                </div>
              </div>
              <div className="footer-meta">
                <span>Desenvolvido por Felipe Rosso</span>
                <span>Projeto acadêmico - ADS</span>
                <div className="footer-socials">
                  <a href="https://github.com" target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                  <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                </div>
                <span>© 2026 Resident Evil Forum</span>
              </div>
            </footer>
          </>
        )}

        {screen === "login" && renderAuthChrome("LOGIN", "Entre na comunidade", "login-form")}

        {screen === "cadastro" && renderAuthChrome("CADASTRO", "Crie sua conta de usuário", "cadastro-form")}

        {notice && <p className="feedback notice">{notice}</p>}
      </main>
    </div>
  );
}
