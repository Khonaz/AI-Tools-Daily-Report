// AI Updates data
const aiUpdatesData = {
  "updates": [
    {
      "rank": 1,
      "title": "Anysphere Raises $900M for Cursor AI Coding Assistant",
      "category": "Development Tools",
      "description": "San Francisco-based startup secures massive funding round, reaching $9.9B valuation for AI-powered coding assistant that actively participates in development workflows.",
      "source": "TechStartups",
      "date": "2025-06-09",
      "impact": "High",
      "type": "Funding",
      "details": "The 3-year-old startup is the creator of Cursor, an AI-powered coding assistant that has rapidly gained traction in the developer community. Unlike AI chatbots that simply generate code snippets, Cursor actively participates in the coding process, rewriting, debugging, and assisting developers as they work."
    },
    {
      "rank": 2,
      "title": "Mistral Releases Magistral Reasoning Models",
      "category": "AI Models",
      "description": "French AI lab launches first reasoning model family with Magistral Small (24B parameters) and Medium versions for step-by-step problem solving.",
      "source": "TechCrunch",
      "date": "2025-06-10",
      "impact": "High",
      "type": "Product Launch",
      "details": "Magistral works through problems step-by-step for improved consistency and reliability across topics such as math and physics. Magistral Small is available for download under Apache 2.0 license, while Medium is in preview on Le Chat and API."
    },
    {
      "rank": 3,
      "title": "OpenAI's Open Model Delayed Until Late Summer",
      "category": "AI Models",
      "description": "CEO Sam Altman announces delay of first open-source model in years due to 'unexpected and amazing' research breakthrough requiring more time.",
      "source": "TechCrunch",
      "date": "2025-06-10",
      "impact": "Medium",
      "type": "Product Update",
      "details": "OpenAI was targeting an early summer release for its open model, which is slated to have similar reasoning capabilities to OpenAI's o-series of models. The delay comes as the space becomes more competitive with Mistral's Magistral release."
    },
    {
      "rank": 4,
      "title": "Atua AI Introduces Adaptive Logic Tools for Cross-Network Scaling",
      "category": "Blockchain AI",
      "description": "Decentralized AI platform unveils adaptive logic tools for seamless AI automation across multiple blockchain networks including Ethereum and BNB Chain.",
      "source": "Newsfile",
      "date": "2025-06-11",
      "impact": "Medium",
      "type": "Product Launch",
      "details": "The tools allow AI modules to dynamically adjust behavior based on live chain activity, system performance, and contextual logic. Supports DAO management, compliance monitoring, financial automation, and on-chain analytics."
    },
    {
      "rank": 5,
      "title": "Microsoft AI Toolkit for VS Code June Update",
      "category": "Development Tools",
      "description": "Version 0.14.0 introduces integrated evaluation for AI agents, built-in evaluators, model conversion tools, and LoRA adapter training for Phi Silica.",
      "source": "Microsoft",
      "date": "2025-06-11",
      "impact": "Medium",
      "type": "Product Update",
      "details": "Major milestone release featuring streamlined testing suite for AI agents, predefined evaluators for Intent Resolution and Tool Call Accuracy, model conversion and optimization tools, and fine-tuning capabilities on Azure."
    },
    {
      "rank": 6,
      "title": "Aiera Secures $25M Series B for Financial AI Research",
      "category": "Fintech AI",
      "description": "Wall Street consortium funds AI platform for earnings call analysis and market research, with partnerships from 10 major investment banks.",
      "source": "TechStartups",
      "date": "2025-06-09",
      "impact": "Medium",
      "type": "Funding",
      "details": "Aiera provides generative AI tools that help investment professionals automate tasks like earnings call analysis, transcript summarization, and market research. Partnership with Microsoft for cloud infrastructure."
    },
    {
      "rank": 7,
      "title": "Thread AI Lands $20M Series A for Enterprise AI Workflows",
      "category": "Enterprise AI",
      "description": "Former Palantir executives' startup raises funding for 'Lemma' composable AI infrastructure to help large organizations build custom AI modules.",
      "source": "TechStartups",
      "date": "2025-06-09",
      "impact": "Medium",
      "type": "Funding",
      "details": "Founded by former Palantir AI Product and Engineering executives, Thread AI offers composable AI infrastructure that lets organizations design, integrate, and scale custom AI modules into their operations."
    },
    {
      "rank": 8,
      "title": "OpenAI Launches o3-pro for Pro Users",
      "category": "AI Models",
      "description": "Most powerful reasoning model now available in ChatGPT and API for Pro users, offering enhanced problem-solving capabilities for complex queries.",
      "source": "OpenAI",
      "date": "2025-06-10",
      "impact": "High",
      "type": "Product Launch",
      "details": "o3-pro represents OpenAI's most advanced reasoning model, pushing the frontier across coding, math, science, and visual perception. Sets new SOTA on benchmarks including Codeforces and SWE-bench."
    },
    {
      "rank": 9,
      "title": "Google AI Overviews Impact on Publisher Traffic",
      "category": "Search AI",
      "description": "AI-powered search features causing significant traffic decline for publishers, with NYT seeing desktop/mobile search traffic drop from 44% to 36.5%.",
      "source": "TechCrunch",
      "date": "2025-06-10",
      "impact": "High",
      "type": "Industry Impact",
      "details": "Google's AI Overviews and AI Mode are devastating traffic for news publishers as users can get answers from chatbots without clicking through to original sources. Publishers are exploring content-sharing deals with AI companies."
    },
    {
      "rank": 10,
      "title": "Hugging Face Releases ColQwen2 Model Preview",
      "category": "Open Source",
      "description": "New model added to transformers library with v4.52.4-ColQwen2-preview tag, expanding open-source AI model ecosystem.",
      "source": "Hugging Face",
      "date": "2025-06-02",
      "impact": "Low",
      "type": "Product Launch",
      "details": "ColQwen2 is available as a preview in the transformers library and can be installed via pip. The model will be included in the next minor release v4.53.0."
    }
  ]
};

// DOM Elements
const updatesGrid = document.getElementById('updatesGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const impactFilter = document.getElementById('impactFilter');
const typeFilter = document.getElementById('typeFilter');
const exportCsvBtn = document.getElementById('exportCsv');
const exportPdfBtn = document.getElementById('exportPdf');

// State
let filteredUpdates = [...aiUpdatesData.updates];

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    renderUpdates();
    setupEventListeners();
});

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
    });
}

// Create update card HTML
function createUpdateCard(update) {
    return `
        <div class="update-card" data-category="${update.category}" data-impact="${update.impact}" data-type="${update.type}">
            <div class="update-card__header">
                <div class="update-card__rank">${update.rank}</div>
                <div class="update-card__badges">
                    <span class="badge badge--category">${update.category}</span>
                    <span class="badge badge--impact-${update.impact.toLowerCase()}">${update.impact}</span>
                </div>
            </div>
            <h3 class="update-card__title">${update.title}</h3>
            <p class="update-card__description">${update.description}</p>
            <div class="update-card__footer">
                <span class="update-card__source">${update.source}</span>
                <span class="update-card__date">${formatDate(update.date)}</span>
            </div>
            <div class="update-card__details">
                <p>${update.details}</p>
            </div>
        </div>
    `;
}

// Render updates
function renderUpdates() {
    if (filteredUpdates.length === 0) {
        updatesGrid.innerHTML = `
            <div class="empty-state">
                <h3>No updates found</h3>
                <p>Try adjusting your filters or search criteria.</p>
            </div>
        `;
        return;
    }

    updatesGrid.innerHTML = filteredUpdates.map(update => createUpdateCard(update)).join('');
    
    // Add click event listeners to cards
    const updateCards = document.querySelectorAll('.update-card');
    updateCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });
}

// Filter updates based on current filters
function filterUpdates() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;
    const impactValue = impactFilter.value;
    const typeValue = typeFilter.value;

    filteredUpdates = aiUpdatesData.updates.filter(update => {
        const matchesSearch = !searchTerm || 
            update.title.toLowerCase().includes(searchTerm) ||
            update.description.toLowerCase().includes(searchTerm) ||
            update.details.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !categoryValue || update.category === categoryValue;
        const matchesImpact = !impactValue || update.impact === impactValue;
        const matchesType = !typeValue || update.type === typeValue;

        return matchesSearch && matchesCategory && matchesImpact && matchesType;
    });

    renderUpdates();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', filterUpdates);
    
    // Filter functionality
    categoryFilter.addEventListener('change', filterUpdates);
    impactFilter.addEventListener('change', filterUpdates);
    typeFilter.addEventListener('change', filterUpdates);
    
    // Export functionality
    exportCsvBtn.addEventListener('click', function() {
        showExportMessage('CSV export functionality coming soon!');
    });
    
    exportPdfBtn.addEventListener('click', function() {
        showExportMessage('PDF export functionality coming soon!');
    });
}

// Show export message
function showExportMessage(message) {
    // Create temporary message element
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-primary);
        color: var(--color-btn-primary-text);
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
    `;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, 3000);
}

// Mobile responsive handling
function handleMobileMenu() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Add mobile-specific behaviors
        const cards = document.querySelectorAll('.update-card');
        cards.forEach(card => {
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            card.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        });
    }
}

// Handle window resize
window.addEventListener('resize', handleMobileMenu);

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        searchInput.focus();
    }
    
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.blur();
    }
});

// Initialize mobile handling
handleMobileMenu();

// Update last updated time
function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('lastUpdated').textContent = timeString;
}

// Update time on page load
updateLastUpdatedTime();