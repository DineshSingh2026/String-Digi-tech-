export type Link = { label: string; href: string };

export const SIM_LABEL = "Simulated data for illustration";
export const SIM_LABEL_PERF =
  "Simulated data for illustration. Not an indication of past or future performance.";

export const DISCLAIMER =
  "STRING DIGI TECH PTE. LTD. provides technology, data analytics and software development services. Nothing on this website is an offer, solicitation or recommendation to buy or sell any financial product, or financial, investment or legal advice. Trading involves risk, including loss of capital. Visualisations use simulated data and do not represent actual or expected performance.";

export const company = {
  wordmark: "STRING DIGI TECH",
  legalName: "STRING DIGI TECH PTE. LTD.",
  uen: "202409799E",
  address: "2 Venture Drive, #11-16, Vision Exchange, Singapore 608526",
  addressParts: {
    streetAddress: "2 Venture Drive, #11-16, Vision Exchange",
    addressLocality: "Singapore",
    postalCode: "608526",
    addressCountry: "SG",
  },
  url: "https://stringdigitech.com",
  titleSuffix: "STRING DIGI TECH — AI Data Analytics & Algorithmic Trading Technology, Singapore",
};

export const nav = {
  solutionsLabel: "Solutions",
  solutions: [
    { label: "Algorithmic Trading", href: "/solutions/algorithmic-trading" },
    { label: "Data Analytics", href: "/solutions/data-analytics" },
    { label: "Infrastructure", href: "/solutions/infrastructure" },
    { label: "Software", href: "/solutions/software" },
  ] satisfies Link[],
  links: [
    { label: "Financial Technology", href: "/financial-technology" },
    { label: "Approach", href: "/approach" },
    { label: "About", href: "/about" },
  ] satisfies Link[],
  contact: { label: "Contact", href: "/contact" } satisfies Link,
  skip: "Skip to content",
  menuOpen: "Open menu",
  menuClose: "Close menu",
};

export const footer = {
  links: [
    { label: "Solutions", href: "/solutions/algorithmic-trading" },
    { label: "Financial Technology", href: "/financial-technology" },
    { label: "Approach", href: "/approach" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
    { label: "Disclaimer", href: "/legal/disclaimer" },
  ] satisfies Link[],
  uenLabel: "UEN",
};

export const home = {
  hero: {
    eyebrow: "AI-Powered Data Analytics & Algorithmic Trading · Singapore",
    h1: "Intelligence, held to account.",
    sub: "STRING DIGI TECH delivers intelligent financial technology and IT services that combine advanced data analytics, robust risk management and next-generation AI to help institutions trade smarter, operate efficiently and decide faster.",
    supporting:
      "From AI-driven algorithmic strategies to scalable infrastructure and custom software, we turn complex data into competitive advantage.",
    ctaPrimary: { label: "Explore AI Trading Solutions", href: "/solutions/algorithmic-trading" },
    ctaSecondary: { label: "Talk to Our Team", href: "/contact" },
  },
  dataStrip: {
    readouts: { ticks: "Ticks/s", latency: "Feed latency", heartbeat: "Model heartbeat" },
    label: SIM_LABEL,
  },
  services: {
    heading: "Four capabilities. One risk-first standard.",
    tiles: [
      {
        title: "AI-Powered Algorithm Development",
        body: "Trading and decision algorithms built with machine learning, quantitative research and rigorous backtesting, so strategies adapt to market conditions inside strict risk controls.",
        href: "/solutions/algorithmic-trading",
        kind: "equity",
      },
      {
        title: "Advanced Data Analytics",
        body: "Market, operational and alternative data turned into insight through pattern recognition, predictive analytics, real-time dashboards and automated reporting.",
        href: "/solutions/data-analytics",
        kind: "clusters",
      },
      {
        title: "Intelligent IT Infrastructure",
        body: "Secure, scalable, high-performance infrastructure for data-intensive and trading environments, with AI monitoring that predicts capacity, detects anomalies and protects uptime.",
        href: "/solutions/infrastructure",
        kind: "nodes",
      },
      {
        title: "AI-Integrated Software Development",
        body: "Custom software with automated workflows, predictive engines and intelligent interfaces, built for reliability in financial and enterprise settings.",
        href: "/solutions/software",
        kind: "assembly",
      },
    ] as const,
  },
  riskFirst: {
    heading: "Sophisticated strategies. Disciplined by design.",
    body: "We combine traditional quantitative methods with machine learning for signal generation, adaptive parameter optimisation and anomaly detection. Every strategy is built to be:",
    steps: [
      "Robust across market regimes",
      "Transparent in risk exposure",
      "Continuously monitored and refined",
      "Governed by clear drawdown controls and position sizing",
    ],
    closing: "Disciplined, data-driven approaches. Never black-box speculation.",
    regimes: ["Trend", "Mean-revert", "High vol", "Thin liquidity"],
  },
  pipeline: {
    heading: "From research to live, with a human at every gate.",
    stages: [
      "Research",
      "Signal modelling",
      "Backtesting",
      "Risk controls",
      "Execution",
      "Monitoring",
    ],
    loop: "refine",
    gateLabel: "review",
  },
  analytics: {
    heading: "From raw data to decisions.",
    inputs: ["Market data", "Operational data", "Alternative data"],
    outputs: ["Pattern recognition", "Predictive analytics", "Real-time dashboards", "Automated reporting"],
    inputsLabel: "Inputs",
    outputsLabel: "Outputs",
  },
  infrastructure: {
    heading: "Infrastructure that sees problems coming.",
    body: "Secure, scalable, high-performance environments for data-intensive and trading workloads. AI monitoring predicts capacity needs, detects anomalies and optimises uptime, backed by security hardening and cloud optimisation.",
  },
  software: {
    heading: "Software with intelligence built in.",
    body: "Custom applications with embedded AI, data pipelines and analytics platforms, trading system components and connectivity, and ongoing maintenance with intelligent monitoring.",
  },
  principles: {
    heading: "Where AI meets disciplined execution.",
    items: [
      "Data quality and integrity first",
      "Risk awareness in every algorithm and system",
      "Practical AI that solves real problems",
      "Transparency and clear performance measurement",
    ],
  },
  why: {
    heading: "Why String Digi Tech",
    items: [
      "Singapore-based, with a clear focus on data analytics and financial technology",
      "AI integrated thoughtfully into algorithms, analytics and software — not as marketing, but as working capability",
      "Strong emphasis on risk management in all trading-related work",
      "End-to-end capability, from algorithm research to infrastructure and custom development",
      "A practical, results-oriented approach suited to institutional and professional clients",
    ],
  },
  singapore: {
    heading: "Built in Singapore. Engineered for every session.",
    sessions: ["Tokyo", "Hong Kong", "Singapore", "London", "New York"],
    timezoneLabel: "SGT",
  },
  closing: {
    heading: "Ready to put disciplined AI to work?",
    body: "Explore AI-powered algorithmic strategies, advanced data analytics or custom IT solutions. Tell us what you need.",
    cta: { label: "Talk to Our Team", href: "/contact" },
  },
};

export const solutions = {
  "algorithmic-trading": {
    title: "Algorithmic Trading",
    scene: "RegimeMap",
    h1: "Sophisticated AI-enhanced algorithmic trading strategies.",
    sub: "We develop advanced algorithmic trading strategies that prioritise risk management above all else.",
    groups: [
      { heading: "Engagement", items: ["Research support", "Full strategy development", "Execution algorithm implementation"] },
      { heading: "AI layer", items: ["Machine learning for signal generation", "Adaptive parameter optimisation", "Anomaly detection"] },
      {
        heading: "Properties",
        items: [
          "Robust across market regimes",
          "Transparent in risk exposure",
          "Continuously monitored and refined",
          "Clear drawdown controls and position-sizing logic",
        ],
      },
    ],
    interactive: { heading: "Risk limit", sliderLabel: "Max drawdown limit", exposure: "Exposure", drawdown: "Drawdown", label: SIM_LABEL_PERF },
    oversight:
      "AI models assist research, pattern detection and adaptive execution, while human oversight and rigorous testing remain central to every strategy we deliver.",
  },
  "data-analytics": {
    title: "Data Analytics",
    scene: "NoiseToSignal",
    h1: "From raw data to competitive advantage.",
    sub: "We transform raw market, operational and alternative data into actionable insight using AI and statistical modelling.",
    groups: [
      {
        heading: "Capabilities",
        items: ["Pattern recognition", "Predictive analytics", "Real-time dashboards", "Automated reporting", "Data pipelines and analytics platforms"],
      },
    ],
    interactive: { heading: "Live dashboard", candles: "Price", volume: "Volume", forecast: "Forecast band", alerts: "Alert feed", label: SIM_LABEL },
  },
  infrastructure: {
    title: "Infrastructure",
    scene: "NodeMesh",
    h1: "Infrastructure built for data-intensive and trading environments.",
    sub: "Secure, scalable and high-performance — with AI monitoring that predicts capacity needs, detects anomalies and optimises uptime.",
    groups: [
      {
        heading: "Capabilities",
        items: ["Infrastructure setup", "Cloud optimisation", "Security hardening", "Secure processing and hosting", "Trading system connectivity"],
      },
    ],
    interactive: { heading: "Monitoring", cpu: "CPU", memory: "Memory", latency: "Latency", anomaly: "Anomaly", label: SIM_LABEL },
  },
  software: {
    title: "Software",
    scene: "Assembly",
    h1: "Software with intelligence built in.",
    sub: "Custom software that embeds intelligent features — from automated workflows and predictive engines to intelligent interfaces — built for reliability in financial and enterprise settings.",
    groups: [
      {
        heading: "Offerings",
        items: [
          "Custom application development with embedded AI",
          "Data pipelines and analytics platforms",
          "Trading system components and connectivity",
          "Infrastructure setup, cloud optimisation and security hardening",
          "Ongoing maintenance and intelligent monitoring",
        ],
      },
    ],
    standard: "Secure, compliance-ready and engineered for performance in high-stakes environments.",
  },
} as const;

export type SolutionSlug = keyof typeof solutions;

export const fintech = {
  title: "Financial Technology",
  h1: "Technology that underpins modern trading and investment operations.",
  sub: "We deliver IT solutions tailored to the needs of modern trading and investment operations.",
  supportsHeading: "Supports",
  supports: [
    "Technology infrastructure for trading operations",
    "Data analytics platforms for better market insight",
    "Algorithmic tools that enhance decision-making and execution",
    "Secure processing and hosting environments",
  ],
};

export const approach = {
  title: "Approach",
  h1: "Where AI meets disciplined execution.",
  intro:
    "We help clients modernise operations, improve data visibility and introduce intelligent automation without compromising control or risk standards.",
  paragraphs: [
    { heading: "Financial technology", body: "Comprehensive IT solutions enhanced by AI." },
    {
      heading: "Algorithmic trading",
      body: "AI assists research, pattern detection and adaptive execution; human oversight and rigorous testing remain central.",
    },
    {
      heading: "IT development",
      body: "AI integrated where it creates measurable value — faster insights, more reliable systems, reduced manual effort, better decision support.",
    },
  ],
  principlesHeading: "Principles",
  pipelineHeading: "From research to live, with a human at every gate.",
};

export const about = {
  title: "About",
  h1: "About STRING DIGI TECH",
  whoHeading: "Who we are",
  who: "STRING DIGI TECH PTE. LTD. is a Singapore-based financial technology and IT solutions company. Incorporated in March 2024 (UEN 202409799E) and formerly known as Digital Edge Technologies, we specialise in data analytics, processing and hosting.",
  position:
    "We sit at the intersection of finance and technology, building practical AI-enhanced systems that financial institutions, trading firms and businesses can rely on.",
  missionHeading: "Mission",
  mission:
    "To empower clients with intelligent, reliable and risk-aware technology solutions that leverage the power of data and artificial intelligence.",
  officeHeading: "Registered office",
  leadershipHeading: "Leadership",
  leadership: [] as { name: string; role: string; bio?: string }[],
};

export const contact = {
  title: "Contact",
  h1: "Get in touch",
  sub: "Ready to explore AI-powered algorithmic strategies, advanced data analytics or custom IT solutions? Contact us to discuss how we can support your requirements.",
  form: {
    name: "Name",
    company: "Company",
    email: "Work email",
    country: "Country",
    interest: "Area of interest",
    interestOptions: ["Algorithmic trading", "Data analytics", "Infrastructure", "Software", "Other"],
    message: "Message",
    consent:
      "I agree to STRING DIGI TECH using my details to respond to this enquiry, as described in the Privacy Policy.",
    submit: "Send enquiry",
    sending: "Sending…",
    success: "Thank you. Your enquiry has been sent and our team will be in touch.",
    error: "Something went wrong sending your enquiry. Please try again.",
    rateLimited: "Too many enquiries from this connection. Please try again later.",
    errors: {
      required: "This field is required",
      email: "Enter a valid email address",
      consent: "Please confirm consent to continue",
    },
  },
  side: { addressLabel: "Registered address", uenLabel: "UEN", emailLabel: "Email", phoneLabel: "Phone" },
};

export const consent = {
  text: "We use optional analytics cookies only with your consent.",
  accept: "Accept",
  decline: "Decline",
  policy: "Privacy Policy",
};

export const notFound = {
  eyebrow: "404",
  h1: "Signal not found.",
  body: "The page you requested does not exist.",
  cta: { label: "Back to home", href: "/" },
};

export const legal = {
  privacy: { title: "Privacy Policy" },
  terms: { title: "Terms of Use" },
  disclaimer: { title: "Disclaimer" },
} as const;

export type LegalSlug = keyof typeof legal;

export const misc = {
  pipelineReviewNote: "Caution gates hold work until a human review releases it.",
};

export const interactive = {
  dataStrip: { latencyUnit: "ms", tickerLabel: "Simulated instrument ticker" },
  sessionClock: {
    open: "Open",
    closed: "Closed",
    nowLabel: "Current time",
    hoursNote: "Approximate cash-equity session hours shown in Singapore time (SGT). Weekends and holidays not shown.",
    ariaLabel: "24-hour clock in Singapore time showing major market sessions",
  },
  riskSlider: { price: "Price", limit: "Limit", unit: "%" },
  analyticsAlerts: [
    "Volume spike detected vs 20-period average",
    "Price crossed upper forecast band",
    "Volatility regime shift flagged",
    "Correlation break between two tracked series",
    "Data feed gap filled from secondary source",
    "Price returned inside forecast band",
    "Order-book imbalance above threshold",
    "Scheduled report generated",
  ],
  monitoring: { nodes: "Nodes", isolated: "Isolated", healthy: "Healthy", percentUnit: "%", msUnit: "ms", anomalyNone: "None detected" },
  contactForm: { select: "Select an option", optional: "(optional)", honeypot: "Leave this field empty" },
  consentBanner: { ariaLabel: "Cookie consent" },
};

/** UI labels for homepage bands 3-5 (services bento, risk-first regime map, pipeline track). Simulated widgets only. */
export const homeBandsUi = {
  services: {
    index: "03 / 12",
    label: "Capabilities",
    explore: "Explore",
    headers: {
      equity: "Equity / drawdown",
      clusters: "Pattern recognition",
      nodes: "Node health",
      assembly: "Interface build",
    },
    canvas: {
      equity: "Equity",
      peak: "Peak",
      dd: "DD",
      limit: "Limit",
      fit: "Fit",
      cluster: "C",
      noise: "Noise",
      nodes: "Nodes",
      healthy: "Healthy",
      isolated: "Isolated",
      reroute: "Reroute",
      chart: "Chart",
      table: "Table",
      alert: "Alert",
      order: "Order",
      buy: "Submit",
      exposure: "Exposure",
      maxDd: "Max DD",
    },
  },
  risk: {
    index: "04 / 12",
    label: "Risk-first",
    panelTitle: "Regime map",
    price: "Price",
    exposure: "Exposure",
    drawdown: "Drawdown",
    limit: "Limit",
    regime: "Regime",
    unit: "%",
  },
  pipeline: {
    index: "05 / 12",
    label: "Pipeline",
    panelTitle: "Strategy lifecycle",
    queue: "Queue",
    released: "Released",
    inFlight: "In flight",
    review: "Review",
  },
};

/** UI labels for inner pages and simulated widgets (Agent D). Labels only — no claims. */
export const pagesUi = {
  breadcrumbAria: "Breadcrumb",
  specSheet: "Spec sheet",
  overview: "Overview",
  onThisPage: "On this page",
  simulation: "Simulation",
  live: "Live",
  sim: "Sim",
  risk: {
    maxDrawdown: "Max drawdown",
    avgExposure: "Avg exposure",
    reducedTime: "Time at reduced exposure",
    reducedNote: "Exposure below 50%",
    regime: "Regime",
    sliderHint: "Drag to set the drawdown limit",
    step: "Step",
  },
  analytics: {
    last: "Last",
    change: "Change",
    range: "Range",
    volatility: "Volatility",
    bandWidth: "Band width",
    severity: { info: "Info", warn: "Warn", alert: "Alert" },
    /** Severity for each entry of interactive.analyticsAlerts, same order. */
    alertSeverity: ["warn", "alert", "alert", "warn", "info", "info", "warn", "info"] as const,
  },
  monitoring: {
    heatmap: "Node heatmap",
    eventLog: "Event log",
    anomalyEvent: "Anomaly detected",
    isolatedEvent: "Node isolated",
    restoredEvent: "Node restored",
    awaiting: "Awaiting events",
    warn: "Warn",
    load: "Load",
    peak: "Peak",
  },
  about: { record: "Company record", legalName: "Legal name", office: "Office", country: "Singapore", grid: "SGT · UTC+8" },
  contact: { formTitle: "Enquiry", direct: "Direct", required: "Required" },
  legal: { index: "Legal" },
  notFound: { status: "Status", lost: "No signal" },
  pipeline: "Pipeline",
};

/** UI labels for the simulated widgets in homepage bands 06–11 (Analytics → Singapore). */
export const bandsUi = {
  index: {
    total: "12",
    analytics: "Data analytics",
    infrastructure: "Infrastructure",
    software: "Software",
    principles: "Principles",
    why: "Why us",
    singapore: "Singapore",
  },
  analytics: {
    stageTitle: "Signal extraction",
    steps: ["Raw noise", "Clusters", "Trend + confidence band"],
    panelTitle: "Model state",
    pointsClassified: "Points classified",
    clusters: "Clusters",
    noiseFiltered: "Noise filtered",
    confidenceBand: "Confidence band",
    stage: "Stage",
  },
  infrastructure: {
    panelTitle: "Cluster monitor",
    nodes: "Nodes",
    healthy: "Healthy",
    warn: "Warning",
    anomaly: "Anomaly",
    isolated: "Isolated",
    peakLatency: "Peak latency",
    eventLog: "Event log",
    events: {
      anomaly: "Anomaly detected",
      isolated: "Node isolated",
      reroute: "Traffic rerouted",
      restored: "Node restored",
    },
    legend: { heartbeat: "Heartbeat", anomaly: "Anomaly", reroute: "Reroute" },
    msUnit: "ms",
  },
  software: {
    stageTitle: "Interface assembly",
    assembling: "Assembling",
    locked: "Grid locked",
    modules: "Modules",
    moduleNames: {
      kpi: "KPI",
      chart: "Chart",
      table: "Table",
      alert: "Alert",
      ticket: "Order ticket",
      bars: "Distribution",
      spark: "Trend",
    },
    lockedSuffix: "locked",
  },
  principles: {
    upper: "Upper limit",
    lower: "Lower limit",
    within: "Within limits",
  },
  singapore: {
    panelTitle: "Market sessions",
    session: "Session",
    hours: "Hours (SGT)",
    status: "Status",
    openNow: "Open now",
  },
} as const;

/** UI labels for Agent A areas: hero terminal widgets, data strip, closing, nav + footer chrome. */
export const heroUi = {
  monitor: "Risk monitor",
  regime: "Regime",
  drawdown: "Drawdown",
  limit: "Limit",
  exposure: "Exposure",
  envelope: "Drawdown envelope",
  paths: "Paths",
  inEnvelope: "In envelope",
  breaches: "Breaches clipped",
  heartbeat: "Model heartbeat",
  tick: "Tick",
  live: "Live",
  scroll: "Scroll",
  marketTape: "Market tape",
  status: "Singapore",
  footerSolutions: "Solutions",
  footerCompany: "Company",
  footerLegal: "Legal",
  footerOffice: "Registered office",
  backToTop: "Back to top",
};

export const closingUi = {
  index: "12 / 12 — Next step",
  secondary: home.hero.ctaPrimary,
};

/** UI labels for the homepage band 08 "Workstation" product mock (all values simulated). */
export const softwareUi = {
  ariaLabel: "Simulated trading and analytics workstation: KPI cards, a price chart with a forecast band, an order ticket, alerts, a watchlist and a model status card.",
  appName: "Workstation",
  view: "Desk overview",
  search: "Search or run a command",
  kbd: "⌘K",
  live: "Live",
  tz: "SGT",
  nav: ["Overview", "Markets", "Orders", "Alerts", "Models", "Settings"],
  kpis: {
    exposure: "Net exposure",
    drawdown: "Drawdown",
    fill: "Fill rate",
    latency: "Signal latency",
    vs: "vs 1D",
    limit: "Limit",
  },
  chart: {
    index: "Index",
    timeframes: ["1H", "1D", "1W", "1M"],
    activeTimeframe: "1D",
    price: "Price",
    forecast: "Forecast band",
    now: "Now",
  },
  ticket: {
    title: "Order ticket",
    buy: "Buy",
    sell: "Sell",
    symbol: "Symbol",
    quantity: "Quantity",
    limit: "Limit price",
    type: "Order type",
    typeValue: "Limit · Day",
    notional: "Est. notional",
    risk: "Pre-trade risk",
    within: "Within limits",
    submit: "Review order",
  },
  alerts: {
    title: "Alerts",
    newLabel: "New",
    items: [
      { sev: "risk", title: "Anomaly detected", detail: "VOL-REG spread 3.1σ above baseline" },
      { sev: "caution", title: "Drawdown near limit", detail: "6.2% of 8.0% desk limit used" },
      { sev: "signal", title: "Regime shift", detail: "SDT-IDX moved to trend state" },
      { sev: "caution", title: "Liquidity thinning", detail: "LIQ-SCORE below 0.85 threshold" },
      { sev: "risk", title: "Order size blocked", detail: "ALPHA-1 above position cap" },
      { sev: "signal", title: "Model retrained", detail: "v4.2.1 promoted after validation" },
    ],
  },
  watch: {
    title: "Watchlist",
    symbol: "Symbol",
    last: "Last",
    change: "Chg",
    range: "Move",
  },
  model: {
    title: "Regime model",
    healthy: "Healthy",
    regime: "Regime",
    confidence: "Confidence",
    version: "v4.2.1",
    retrain: "Last retrain",
    retrainAt: "06:00",
    status: "Status",
    regimes: { trend: "Trend", meanRevert: "Mean reversion", highVol: "High volatility", thinLiquidity: "Thin liquidity" },
  },
  status: {
    feed: "Feed connected",
    ticks: "ticks/s",
    ms: "ms",
  },
} as const;

/** UI labels for the strategy-lifecycle diagram (homepage band 05, /approach). Short status words only; all values simulated. */
export const pipelineUi = {
  legend: { flow: "Flow", gate: "Review gate", refine: home.pipeline.loop },
  /** Status word per stage, same order as home.pipeline.stages. Gate stages switch between review states below. */
  status: ["Exploring", "Fitting", "In review", "In review", "Live", "Watching"],
  review: "In review",
  released: "Released",
  ready: "Ready",
  queue: "Queue",
  inFlight: "In flight",
  reviewer: "Human reviewer",
  diagram: "Strategy lifecycle diagram: work flows from Research to Monitoring, held at two human review gates, with a refine loop back to Research.",
} as const;
