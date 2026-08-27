import { useState, useRef, useEffect } from "react";
import "./App.css";

// Initial Default Data
const initialContracts = [
  { name: "Cloud Services Agreement", type: "Service Agreement", risk: "Medium", score: 82, obligations: 12, status: "Analyzed", updated: "2 hours ago" },
  { name: "Vendor Supply Contract", type: "Supply Agreement", risk: "High", score: 61, obligations: 8, status: "Needs Review", updated: "Yesterday" }
];

const initialObligations = [
  { title: "Annual Service Renewal", contract: "Cloud Services Agreement", date: "15 Sep", days: 12, type: "Renewal", priority: "High" }
];

const initialAlerts = [
  { title: "System Ready", description: "AI Engine is online and connected to NoSQL Database.", type: "info", icon: "✓" }
];

function App() {
  // ---------------- LOADER & MOUSE STATE ----------------
  const [isLoading, setIsLoading] = useState(true);
  const [fadeLoader, setFadeLoader] = useState(false);

  useEffect(() => {
    // 1. Bootloader Timers
    const fadeTimer = setTimeout(() => setFadeLoader(true), 3500);
    const removeTimer = setTimeout(() => setIsLoading(false), 4000);

    // 2. Cursor Glow Tracker (Powers the Spotlight in CSS)
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => { 
      clearTimeout(fadeTimer); 
      clearTimeout(removeTimer); 
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // ---------------- DASHBOARD STATE ----------------
  const [activePage, setActivePage] = useState("dashboard");
  const [showUpload, setShowUpload] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [contracts, setContracts] = useState(initialContracts);
  const [obligations, setObligations] = useState(initialObligations);
  const [alerts, setAlerts] = useState(initialAlerts);

  const navigate = (page) => setActivePage(page);

  // ---------------- PROFILE DROPDOWN ACTIONS ----------------
  const handleProfileAction = (actionType) => {
    setShowProfileMenu(false);
    
    if (actionType === "settings") {
      const newAlert = {
        title: "Account Settings Accessed",
        description: "Workspace administrator profile active for AVS Bharat Chowdary (Cambridge Institute of Technology).",
        type: "info",
        icon: "⚙️"
      };
      setAlerts(prev => [newAlert, ...prev]);
      setActivePage("alerts"); 
    } 
    else if (actionType === "billing") {
      const newAlert = {
        title: "API Billing & Quota",
        description: "Gemini API active. Current tier: Unlimited Hackathon Developer Access.",
        type: "info",
        icon: "📄"
      };
      setAlerts(prev => [newAlert, ...prev]);
      setActivePage("alerts"); 
    } 
    else if (actionType === "logout") {
      // Re-trigger the stunning boot screen for a demo reset effect!
      setIsLoading(true);
      setFadeLoader(false);
      setTimeout(() => setFadeLoader(true), 3500);
      setTimeout(() => setIsLoading(false), 4000);
    }
  };

  const handleAIAnalysisComplete = (data) => {
    try {
      const filename = data.filename || "Contract.pdf";
      const analysis = data.analysis || {};
      const digital_signature = data.digital_signature || "000000000000";
      
      const risk_score = typeof analysis.risk_score === 'number' ? analysis.risk_score : 5;
      const summary = analysis.summary || "No summary provided.";
      const aiObligations = Array.isArray(analysis.obligations) ? analysis.obligations : ["Review document terms"];
      const aiDeadlines = Array.isArray(analysis.deadlines) ? analysis.deadlines : [];

      let riskLevel = "Low";
      if (risk_score >= 7) riskLevel = "High";
      else if (risk_score >= 4) riskLevel = "Medium";

      const healthScore = 100 - (risk_score * 10);

      const newContract = {
        name: filename,
        type: "AI Analyzed Document",
        risk: riskLevel,
        score: healthScore,
        obligations: aiObligations.length,
        status: "Analyzed",
        updated: "Just now",
        summary: summary
      };

      const newUIObligations = aiObligations.map((ob, index) => {
        const deadline = aiDeadlines[index] || "TBD";
        const obText = typeof ob === 'string' ? ob : "Review obligation";
        return {
          title: obText.substring(0, 50) + (obText.length > 50 ? "..." : ""),
          contract: filename,
          date: typeof deadline === 'string' ? deadline.substring(0, 15) : "TBD", 
          days: 30, 
          type: "AI Extracted",
          priority: riskLevel
        };
      });

      const sigSnippet = typeof digital_signature === 'string' ? digital_signature.substring(0, 12) : "abcdef123456";
      const newAlert = {
        title: `${filename} Analyzed`,
        description: `Risk Score: ${risk_score}/10. Version Signature: ${sigSnippet}... Logged to NoSQL.`,
        type: riskLevel === "High" ? "danger" : riskLevel === "Medium" ? "warning" : "info",
        icon: riskLevel === "High" ? "!" : "i"
      };

      setContracts(prev => [newContract, ...prev]);
      setObligations(prev => [...newUIObligations, ...prev]);
      setAlerts(prev => [newAlert, ...prev]);
    } catch (err) {
      console.error("Frontend parsing error:", err);
    }
  };

  const totalContracts = contracts.length;
  const highRiskCount = contracts.filter(c => c.risk === "High").length;
  const avgScore = Math.round(contracts.reduce((acc, curr) => acc + curr.score, 0) / (totalContracts || 1));

  // ---------------- RENDER LOADER SCREEN ----------------
  if (isLoading) {
    return (
      <div className={`initial-loader ${fadeLoader ? 'fade-out' : ''}`}>
        <div className="loader-core">
          <div className="loader-ring"></div>
          <div className="loader-ring loader-ring-inner"></div>
          <svg viewBox="0 0 24 24" className="loader-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </div>
        <h2>Booting ContractIQ...</h2>
        <div className="loading-bar"><div className="loading-progress"></div></div>
      </div>
    );
  }

  // ---------------- RENDER MAIN DASHBOARD ----------------
  return (
    <div className="app fade-in-app">
      
      {/* SIDEBAR */}
      <aside className="sidebar glass-panel">
        <div className="brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div>
            <h2>ContractIQ</h2>
            <p>AI Contract Intelligence</p>
          </div>
        </div>
        <div className="workspace">
          <div className="avatar">BC</div>
          <div className="workspace-info">
            <strong>Team Workspace</strong>
            <small>Administrator</small>
          </div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="navigation">
          <NavButton icon="▦" text="Dashboard" active={activePage === "dashboard"} onClick={() => navigate("dashboard")} />
          <NavButton icon="▤" text="Contracts" active={activePage === "contracts"} onClick={() => navigate("contracts")} />
          <NavButton icon="△" text="Risk Analysis" active={activePage === "risk"} onClick={() => navigate("risk")} />
          <NavButton icon="✓" text="Obligations" active={activePage === "obligations"} onClick={() => navigate("obligations")} />
          <NavButton icon="◇" text="Alerts" active={activePage === "alerts"} count={alerts.length} onClick={() => navigate("alerts")} />
        </nav>
        <div className="sidebar-bottom">
          <div className="ai-status">
            <div className="ai-pulse"></div>
            <div>
              <strong>AI Engine Online</strong>
              <small>Ready to analyze</small>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        <header className="topbar glass-panel">
          <div>
            <span className="breadcrumb">Workspace <b>/</b> {getPageTitle(activePage)}</span>
            <h1>{getPageTitle(activePage)}</h1>
          </div>
          <div className="top-actions">
            <button className="primary-button" onClick={() => setShowUpload(true)}>+ Upload Contract</button>
            <button className="notification-button">◇<span className="badge-dot"></span></button>
            
            <div className="profile" style={{ position: 'relative' }}>
              <div className="mini-avatar" onClick={() => setShowProfileMenu(!showProfileMenu)}>BC</div>
              
              {showProfileMenu && (
                <div className="profile-dropdown glass-card">
                  <div className="profile-header">
                    <strong>AVS Bharat Chowdary</strong>
                    <small>Cambridge Institute of Technology</small>
                  </div>
                  <button onClick={() => handleProfileAction("settings")}>⚙️ Account Settings</button>
                  <button onClick={() => handleProfileAction("billing")}>📄 API Billing</button>
                  <div className="dropdown-divider"></div>
                  <button onClick={() => handleProfileAction("logout")} className="logout-btn">🚪 Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-container">
          {activePage === "dashboard" && (
            <Dashboard navigate={navigate} contracts={contracts} obligations={obligations} stats={{totalContracts, highRiskCount, avgScore}} />
          )}
          {activePage === "contracts" && <Contracts contracts={contracts} />}
          {activePage === "risk" && <RiskAnalysis contracts={contracts} avgScore={avgScore} />}
          {activePage === "obligations" && <Obligations obligations={obligations} />}
          {activePage === "alerts" && <Alerts alerts={alerts} />}
        </div>
      </main>

      {/* DYNAMIC UPLOAD MODAL */}
      {showUpload && (
        <UploadModal close={() => setShowUpload(false)} onSuccess={handleAIAnalysisComplete} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   COMPONENTS
------------------------------------------------------------------ */

function NavButton({ icon, text, active, count, onClick }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      <span className="nav-icon">{icon}</span><span>{text}</span>
      {count > 0 && <b className="alert-count">{count}</b>}
    </button>
  );
}

function getPageTitle(page) {
  const titles = { dashboard: "Dashboard", contracts: "Contracts", risk: "Risk Analysis", obligations: "Obligations", alerts: "Alerts" };
  return titles[page];
}

function Dashboard({ navigate, contracts, obligations, stats }) {
  return (
    <div className="page">
      <section className="stats-grid">
        <StatCard icon="▤" title="Total Contracts" value={stats.totalContracts} change="Active" />
        <StatCard icon="!" title="High Risk" value={stats.highRiskCount} danger change="Requires Review" />
        <StatCard icon="✓" title="Obligations" value={obligations.length} success change="Being tracked" />
      </section>

      <section className="dashboard-grid">
        <div className="card glass-card">
          <div className="card-header">
            <div><h3>Recent Contracts</h3><p>AI-analyzed agreements</p></div>
            <button className="text-button" onClick={() => navigate("contracts")}>View All →</button>
          </div>
          <div className="contract-list">
            {contracts.slice(0, 4).map((contract, index) => <ContractRow key={index} contract={contract} />)}
          </div>
        </div>

        <div className="card glass-card">
          <div className="card-header">
            <div><h3>Risk Overview</h3><p>Portfolio health score</p></div>
            <button className="text-button" onClick={() => navigate("risk")}>Details →</button>
          </div>
          <div className="risk-content">
            <div className="donut">
              <div className="donut-inner glass-panel">
                <strong>{stats.avgScore}</strong><span>Avg Score</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card glass-card">
        <div className="card-header">
          <div><h3>Upcoming Obligations</h3><p>Important actions detected by AI</p></div>
          <button className="text-button" onClick={() => navigate("obligations")}>View All →</button>
        </div>
        <div className="obligation-grid">
          {obligations.slice(0, 3).map((item, index) => <ObligationCard key={index} item={item} />)}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, title, value, change, danger, success }) {
  let iconClass = "stat-icon";
  if (danger) iconClass += " danger-icon";
  if (success) iconClass += " success-icon";
  return (
    <div className="stat-card glass-card">
      <div className="stat-header"><div className={iconClass}>{icon}</div><span className="stat-title">{title}</span></div>
      <div className="stat-number">{value}</div>
      <div className={`stat-change ${danger ? "danger-text" : "muted-text"}`}>{change}</div>
    </div>
  );
}

function ContractRow({ contract }) {
  return (
    <div className="contract-row">
      <div className="document-icon">▤</div>
      <div className="contract-main">
        <strong>{contract.name}</strong><span>{contract.updated}</span>
      </div>
      <div className="contract-score">
        <span className={`risk-pill ${contract.risk.toLowerCase()}`}>{contract.risk}</span>
        <div className="score-number"><strong>{contract.score}</strong><small>/100</small></div>
      </div>
    </div>
  );
}

function ObligationCard({ item }) {
  return (
    <div className="obligation-card glass-panel">
      <div className="obligation-date"><strong>{item.date}</strong></div>
      <div className="obligation-info">
        <div className="obligation-title">{item.title}</div>
        <span className="obligation-subtitle">{item.contract}</span>
        <div className="obligation-meta">
          <span className={`priority ${item.priority.toLowerCase()}`}>{item.priority}</span>
        </div>
      </div>
    </div>
  );
}

function Contracts({ contracts }) {
  return (
    <div className="page">
      <div className="page-intro"><h2>Contract Library</h2><p>Manage and review all your AI-analyzed contracts.</p></div>
      <div className="card table-card glass-card">
        <table>
          <thead>
            <tr><th>Contract Name</th><th>Risk Level</th><th>AI Score</th><th>Obligations</th><th>Status</th></tr>
          </thead>
          <tbody>
            {contracts.map((contract, index) => (
              <tr key={index}>
                <td>
                  <div className="table-contract">
                    <div className="document-icon small">▤</div>
                    <div><strong>{contract.name}</strong><small>{contract.updated}</small></div>
                  </div>
                </td>
                <td><span className={`risk-pill ${contract.risk.toLowerCase()}`}>{contract.risk}</span></td>
                <td><strong>{contract.score}</strong></td>
                <td>{contract.obligations}</td>
                <td><span className="status-indicator"><span className="status-dot"></span> {contract.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RiskAnalysis({ contracts, avgScore }) {
  return (
    <div className="page">
      <div className="page-intro">
        <div><h2>Risk Analysis</h2></div>
        <div className="overall-score-card glass-panel"><span>Portfolio Score</span><div><strong>{avgScore}</strong><small>/100</small></div></div>
      </div>
      <div className="card glass-card">
        <div className="card-header"><div><h3>Identified Risks</h3></div></div>
        <div className="contract-list">
          {contracts.filter(c => c.risk === "High" || c.risk === "Medium").map((contract, i) => <ContractRow key={i} contract={contract} />)}
        </div>
      </div>
    </div>
  );
}

function Obligations({ obligations }) {
  return (
    <div className="page">
      <div className="page-intro"><h2>Obligations</h2><p>Track every important action and deadline.</p></div>
      <div className="obligation-page-grid">
        {obligations.map((item, index) => (
          <div className="card large-obligation glass-card" key={index}>
            <div className="large-date"><strong>{item.date}</strong></div>
            <div className="large-obligation-content">
              <h3>{item.title}</h3>
              <p className="muted-text">{item.contract}</p>
              <div className="large-obligation-bottom">
                <span className={`priority ${item.priority.toLowerCase()}`}>{item.priority} Priority</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Alerts({ alerts }) {
  return (
    <div className="page">
      <div className="page-intro"><h2>Alerts</h2></div>
      <div className="alert-page-list">
        {alerts.map((alert, index) => (
          <div className={`card alert-banner ${alert.type} glass-card`} key={index}>
            <div className="alert-icon-large">{alert.icon}</div>
            <div className="alert-content">
              <div className="alert-heading"><h3>{alert.title}</h3></div>
              <p>{alert.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   API CONNECTED UPLOAD MODAL
------------------------------------------------------------------ */
function UploadModal({ close, onSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze-contract/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.analysis) {
        onSuccess(data); 
        close();         
      } else {
        setError(data.error || "Failed to analyze contract.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Ensure your FastAPI Python backend is running.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <button className="close-modal" onClick={close} disabled={isUploading}>×</button>
        
        <div className="modal-header">
          <div className="modal-icon">{isUploading ? "⚙️" : "↑"}</div>
          <h2>{isUploading ? "AI is Analyzing..." : "Upload Contract"}</h2>
          <p>{isUploading ? "Extracting risks, deadlines, and tracking versions." : "Let AI identify risks, obligations, and deadlines instantly."}</p>
        </div>

        {error && <div style={{color: "var(--risk-high)", background: "var(--risk-high-bg)", padding: "10px", borderRadius: "8px", marginBottom: "16px", textAlign: "center", fontSize:"0.9rem"}}>{error}</div>}

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" style={{ display: "none" }} />

        <div 
          className="drop-zone" 
          onClick={() => !isUploading && fileInputRef.current.click()}
          style={{ opacity: isUploading ? 0.7 : 1, cursor: isUploading ? "wait" : "pointer" }}
        >
          <div className="upload-cloud">📄</div>
          <h3>{isUploading ? "Processing..." : "Click to select a PDF"}</h3>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={close} disabled={isUploading}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default App;