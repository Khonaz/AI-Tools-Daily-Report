document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION & STATE ---
    const REPORT_DATA_URL = 'ai_daily_report_june_11_2025.csv';
    const CHART_DATA_URL = 'ai_news_volume_june_2025.csv';
    // Updated placeholder for better context
    const PLACEHOLDER_IMG = 'https://placehold.co/600x400/0f172a/f1f5f9?text=Source+Logo&font=inter';
    // Map source names to domains for logo fetching
    const sourceToDomainMap = {
        'techcrunch': 'techcrunch.com',
        'techstartups': 'techstartups.com',
        'openai': 'openai.com',
        'microsoft': 'microsoft.com',
        'hugging face': 'huggingface.co',
        'newsfile': 'newsfilecorp.com',
        'reuters': 'reuters.com',
        'forbes': 'forbes.com'
    };
    
    let allUpdates = [];
    let currentFilteredUpdates = [];
    let newsChart = null;
    let forecastChart = null;

    // --- DOM ELEMENT REFERENCES ---
    const grid = document.getElementById('updates-grid');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sort-select');
    const categoryFilter = document.getElementById('filter-category');
    const themeToggle = document.getElementById('theme-toggle');
    const loadingMessage = document.getElementById('loading-message');
    const modal = document.getElementById('details-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const copyDetailsBtn = document.getElementById('copy-details-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const exportJsonBtn = document.getElementById('export-json-btn');
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    const impactAnalysisContent = document.getElementById('impact-analysis-content');
    const modalThumbnailImg = document.getElementById('modal-thumbnail-img');

    // --- INITIALIZATION ---
    function init() {
        setupEventListeners();
        updateLastUpdatedTime();
        loadAllData();
        checkInitialTheme();
        checkInitialView();
    }
    
    // --- EVENT LISTENERS SETUP ---
    function setupEventListeners() {
        searchInput.addEventListener('input', handleFilteringAndSorting);
        sortSelect.addEventListener('change', handleFilteringAndSorting);
        categoryFilter.addEventListener('change', handleFilteringAndSorting);
        
        themeToggle.addEventListener('click', toggleTheme);
        document.addEventListener('keydown', handleKeyboardShortcuts);

        modalCloseBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        exportCsvBtn.addEventListener('click', () => exportData('csv'));
        exportJsonBtn.addEventListener('click', () => exportData('json'));
        
        gridViewBtn.addEventListener('click', () => setView('grid'));
        listViewBtn.addEventListener('click', () => setView('list'));
    }

    // --- DATA FETCHING & PROCESSING ---
    async function loadAllData() {
        try {
            const [reportData, chartData] = await Promise.all([
                fetchAndParseCSV(REPORT_DATA_URL),
                fetchAndParseCSV(CHART_DATA_URL)
            ]);
            
            allUpdates = reportData.map((d, i) => {
                const domain = sourceToDomainMap[d.source.toLowerCase().trim()];
                // ***MODIFIED***: Switched to Google's more reliable favicon service.
                return {
                    ...d, 
                    id: d.rank,
                    thumbnail: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : PLACEHOLDER_IMG
                };
            });
            
            currentFilteredUpdates = [...allUpdates];
            populateCategoryFilter(allUpdates);
            renderDashboard(allUpdates, chartData);
        } catch (error) {
            console.error("Failed to load data:", error);
            grid.innerHTML = `<p class="error">Could not load AI updates.</p>`;
        } finally {
            loadingMessage.style.display = 'none';
        }
    }
    
    function fetchAndParseCSV(url) {
        return new Promise((resolve, reject) => {
            Papa.parse(url, {
                download: true, header: true, skipEmptyLines: true,
                complete: (results) => resolve(results.data),
                error: (error) => reject(error)
            });
        });
    }

    // --- DYNAMIC UI POPULATION ---
    function populateCategoryFilter(updates) {
        const categories = [...new Set(updates.map(u => u.category))];
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // --- RENDERING FUNCTIONS ---
    function renderDashboard(updates, chartData) {
        updateMetrics(updates);
        renderNewsChart(chartData);
        renderForecastChart(chartData);
        generateImpactAnalysis(chartData);
        handleFilteringAndSorting();
    }

    function renderCards(updates) {
        grid.innerHTML = '';
        if (updates.length === 0) {
            grid.innerHTML = '<p>No updates match your criteria.</p>';
            return;
        }
        updates.forEach(update => {
            grid.appendChild(createUpdateCard(update));
        });
    }
    
    function createUpdateCard(update) {
        const card = document.createElement('div');
        card.className = 'update-card';
        card.dataset.id = update.id;
        // Added onerror to fallback to a placeholder if the logo isn't found
        card.innerHTML = `
            <div class="card__thumbnail">
                <img src="${update.thumbnail}" alt="${update.title} thumbnail" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';">
            </div>
            <div class="card__content">
                <div class="card__header">
                    <h3 class="card__title">${update.title}</h3>
                    <span class="card__rank">#${update.rank}</span>
                </div>
                <div class="card__body">
                    <div class="card__meta">
                        <span class="card__tag card__tag--${update.impact}">${update.impact} Impact</span>
                        <span class="card__tag">${update.category}</span>
                    </div>
                    <p class="card__description">${update.description}</p>
                </div>
                <div class="card__footer">
                    <button class="btn read-more-btn" data-id="${update.id}">Read More</button>
                </div>
            </div>
        `;
        card.querySelector('.read-more-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(update.id);
        });
        return card;
    }
    
    function updateMetrics(updates) {
        document.getElementById('total-updates').textContent = updates.length;
        document.getElementById('high-impact-updates').textContent = updates.filter(u => u.impact === 'High').length;
        document.getElementById('funding-rounds').textContent = updates.filter(u => u.type === 'Funding').length;
        document.getElementById('product-launches').textContent = updates.filter(u => u.type === 'Product Launch').length;
    }
    
    function renderNewsChart(data) {
        const ctx = document.getElementById('aiNewsChart').getContext('2d');
        const labels = data.map(row => new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}));
        const volume = data.map(row => parseInt(row.news_volume, 10));
        newsChart = new Chart(ctx, getChartConfig(labels, volume, 'News Volume', 'primary'));
    }

    // --- AI FORECASTING & ANALYSIS ---

    function renderForecastChart(data) {
        const historicalData = data.map(row => parseInt(row.news_volume, 10));
        const forecastData = generateForecast(historicalData, 7);

        const historicalLabels = data.map(row => new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}));
        const lastDate = new Date(data[data.length-1].date);
        const forecastLabels = [...Array(7)].map((_, i) => {
            const nextDate = new Date(lastDate);
            nextDate.setDate(lastDate.getDate() + i + 1);
            return nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric'});
        });
        
        const ctx = document.getElementById('forecastChart').getContext('2d');
        const config = getChartConfig(
            [...historicalLabels, ...forecastLabels], 
            [...historicalData.map(d => ({y: d})), ...forecastData.map(d=>({y:d}))], 
            'News Volume', 'primary', true
        );
        
        config.data.datasets.push({
            label: 'Forecast',
            data: [...Array(historicalData.length).fill(null), ...forecastData],
            borderColor: getCssVariable('forecast'),
            backgroundColor: `${getCssVariable('forecast')}33`,
            borderWidth: 2, borderDash: [5, 5], fill: false, tension: 0.4,
        });

        forecastChart = new Chart(ctx, config);
    }
    
    function generateForecast(data, days) {
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += i; sumY += data[i]; sumXY += i * data[i]; sumXX += i * i;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const forecast = [];
        for (let i = 0; i < days; i++) {
            forecast.push(Math.round(Math.max(0, slope * (n + i) + intercept)));
        }
        return forecast;
    }

    function generateImpactAnalysis(data) {
        const lastThreeDays = data.slice(-3).map(d => parseInt(d.news_volume, 10));
        const trend = lastThreeDays[2] - lastThreeDays[0];
        let trendText = "stable";
        if (trend > 5) trendText = "a significant upward trend";
        else if (trend > 0) trendText = "a slight upward trend";
        else if (trend < -5) trendText = "a significant downward trend";
        else if (trend < 0) trendText = "a slight downward trend";

        const forecast = generateForecast(data.map(d => parseInt(d.news_volume, 10)), 7);
        const avgForecast = forecast.reduce((a, b) => a + b, 0) / forecast.length;

        impactAnalysisContent.innerHTML = `
            <p>Based on news volume from the past two weeks, the market shows <strong>${trendText}</strong>. Our predictive model forecasts an average daily news volume of approximately <strong>${avgForecast.toFixed(0)} articles</strong> over the next 7 days.</p>
            <p><strong>Key takeaway:</strong> We anticipate continued high activity in the AI space. Stakeholders should monitor developments in AI models and funding rounds closely.</p>
        `;
    }

    // --- FEATURES & INTERACTIONS ---
    
    function handleFilteringAndSorting() {
        let updates = [...allUpdates];
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            updates = updates.filter(update => Object.values(update).some(value => String(value).toLowerCase().includes(searchTerm)));
        }
        const selectedCategory = categoryFilter.value;
        if (selectedCategory !== 'all') {
            updates = updates.filter(update => update.category === selectedCategory);
        }
        const sortBy = sortSelect.value;
        updates.sort((a, b) => {
            if (sortBy === 'rank') return parseInt(a.rank) - parseInt(b.rank);
            if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
            if (sortBy === 'impact') {
                const impactOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
                return impactOrder[a.impact] - impactOrder[b.impact];
            }
            return 0;
        });
        currentFilteredUpdates = updates;
        renderCards(updates);
    }
    
    function openModal(id) {
        const update = allUpdates.find(u => u.id === id);
        if (!update) return;
        
        modalThumbnailImg.src = update.thumbnail;
        modalThumbnailImg.onerror = () => { modalThumbnailImg.src = PLACEHOLDER_IMG; };
        document.getElementById('modal-title').textContent = update.title;
        document.getElementById('modal-category').textContent = update.category;
        document.getElementById('modal-impact').textContent = `${update.impact} Impact`;
        document.getElementById('modal-impact').className = `card__tag card__tag--${update.impact}`;
        document.getElementById('modal-date').textContent = new Date(update.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('modal-description').textContent = update.details || update.description;
        document.getElementById('modal-source').textContent = update.source;

        copyDetailsBtn.onclick = () => copyModalDetails(update);
        
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('visible'), 10);
    }

    function closeModal() {
        modal.classList.remove('visible');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    function copyModalDetails(update) {
        const textToCopy = `Title: ${update.title}\nCategory: ${update.category}\nImpact: ${update.impact}\nDate: ${update.date}\nSource: ${update.source}\nDescription: ${update.details || update.description}`.trim();
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Details copied to clipboard!');
    }

    function exportData(format) {
        const data = currentFilteredUpdates;
        const filename = `ai_report_${new Date().toISOString().split('T')[0]}`;
        if (format === 'csv') {
            downloadBlob(Papa.unparse(data), `${filename}.csv`, 'text/csv;charset=utf-8;');
        } else if (format === 'json') {
            downloadBlob(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
        }
        showToast(`Exported as ${format.toUpperCase()}`);
    }

    function downloadBlob(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function toggleTheme() {
        const newScheme = document.documentElement.getAttribute('data-color-scheme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-color-scheme', newScheme);
        localStorage.setItem('theme', newScheme);
        themeToggle.textContent = newScheme === 'dark' ? '🌙' : '☀️';

        setTimeout(() => {
            [newsChart, forecastChart].forEach(chart => {
                if (chart) updateChartColors(chart);
            });
        }, 50);
    }
    
    function setView(view) {
        grid.classList.toggle('list-view', view === 'list');
        gridViewBtn.classList.toggle('active', view === 'grid');
        listViewBtn.classList.toggle('active', view === 'list');
        localStorage.setItem('view', view);
    }

    // --- UTILITIES ---

    function getCssVariable(variable) {
        return getComputedStyle(document.documentElement).getPropertyValue(`--color-${variable}`).trim();
    }
    
    function getChartConfig(labels, data, label, colorKey) {
        const primaryColor = getCssVariable(colorKey);
        const textColor = getCssVariable('text-secondary');
        return {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label, data: data,
                    borderColor: primaryColor, backgroundColor: `${primaryColor}33`,
                    borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: primaryColor,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: `${textColor}40` } },
                    x: { ticks: { color: textColor }, grid: { display: false } }
                },
                plugins: {
                    legend: { labels: { color: textColor }, onClick: (e, item, legend) => Chart.defaults.plugins.legend.onClick(e, item, legend) }
                }
            }
        };
    }
    
    function updateChartColors(chart) {
        const textColor = getCssVariable('text-secondary');
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.x.ticks.color = textColor;
        chart.options.plugins.legend.labels.color = textColor;
        
        chart.data.datasets.forEach((dataset, index) => {
            const colorKey = dataset.label === 'Forecast' ? 'forecast' : 'primary';
            const newColor = getCssVariable(colorKey);
            dataset.borderColor = newColor;
            dataset.backgroundColor = `${newColor}33`;
            dataset.pointBackgroundColor = newColor;
        });
        chart.update();
    }

    function checkInitialView() {
        const savedView = localStorage.getItem('view') || 'grid';
        setView(savedView);
    }

    function checkInitialTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-color-scheme', savedTheme);
        themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
    }

    function updateLastUpdatedTime() {
        const timeString = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        document.getElementById('lastUpdated').textContent = timeString;
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    function handleKeyboardShortcuts(e) {
        if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
            e.preventDefault();
            searchInput.focus();
        }
        if (e.key === 'Escape' && modal.classList.contains('visible')) {
            closeModal();
        }
    }

    init();
});
