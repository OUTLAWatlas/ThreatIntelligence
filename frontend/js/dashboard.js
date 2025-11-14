// Dashboard JavaScript Module
class Dashboard {
    constructor() {
        this.apiBase = '/api';
        this.charts = {};
        this.init();
    }

    async init() {
        try {
            showLoading();
            await this.loadMetrics();
            await this.loadRecentData();
            this.initCharts();
            hideLoading();
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            showError('Failed to load dashboard data');
            hideLoading();
        }
    }

    async loadMetrics() {
        try {
            const [actorsResponse, indicatorsResponse, incidentsResponse, feedsResponse] = await Promise.all([
                fetch(`${this.apiBase}/actors?limit=1000`),
                fetch(`${this.apiBase}/indicators?limit=1000`),
                fetch(`${this.apiBase}/incidents?limit=1000`),
                fetch(`${this.apiBase}/sources?limit=1000`)
            ]);

            const [actors, indicators, incidents, feeds] = await Promise.all([
                actorsResponse.json(),
                indicatorsResponse.json(),
                incidentsResponse.json(),
                feedsResponse.json()
            ]);

            // Update metric counts
            document.getElementById('actors-count').textContent = actors.count || actors.data?.length || 0;
            document.getElementById('indicators-count').textContent = this.getTodayIndicators(indicators.data || []);
            document.getElementById('incidents-count').textContent = this.getActiveIncidents(incidents.data || []);
            document.getElementById('feeds-count').textContent = feeds.count || feeds.data?.length || 0;

            // Store data for charts
            this.data = { actors: actors.data || [], indicators: indicators.data || [], incidents: incidents.data || [], feeds: feeds.data || [] };
        } catch (error) {
            console.error('Error loading metrics:', error);
            throw error;
        }
    }

    getTodayIndicators(indicators) {
        const today = new Date().toISOString().split('T')[0];
        return indicators.filter(indicator => 
            indicator.firstSeen && indicator.firstSeen.startsWith(today)
        ).length;
    }

    getActiveIncidents(incidents) {
        return incidents.filter(incident => 
            incident.status && ['new', 'investigating', 'active'].includes(incident.status.toLowerCase())
        ).length;
    }

    async loadRecentData() {
        try {
            // Load recent incidents
            const recentIncidents = this.data.incidents
                .sort((a, b) => new Date(b.reportedDate || b.date_discovered || 0) - new Date(a.reportedDate || a.date_discovered || 0))
                .slice(0, 5);
            
            this.renderRecentIncidents(recentIncidents);

            // Load recent indicators
            const recentIndicators = this.data.indicators
                .sort((a, b) => new Date(b.firstSeen) - new Date(a.firstSeen))
                .slice(0, 5);
            
            this.renderRecentIndicators(recentIndicators);
        } catch (error) {
            console.error('Error loading recent data:', error);
            throw error;
        }
    }

    renderRecentIncidents(incidents) {
        const container = document.getElementById('recent-incidents');
        if (!container) return;

        if (incidents.length === 0) {
            container.innerHTML = '<p class=\"text-gray-400 text-sm\">No recent incidents</p>';
            return;
        }

        container.innerHTML = incidents.map(incident => `
            <div class="flex items-center justify-between p-3 bg-dark-border bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-colors">
                <div class="flex-1">
                    <h4 class="font-medium text-white truncate">${this.escapeHtml(incident.incidentTitle || incident.title || 'Untitled')}</h4>
                    <div class="flex items-center space-x-2 mt-1">
                        <span class="status-badge severity-${(incident.severity || 'medium').toLowerCase()}">${incident.severity || 'Unknown'}</span>
                        <span class="text-xs text-gray-400">${this.formatDate(incident.reportedDate || incident.date_discovered)}</span>
                    </div>
                </div>
                <div class="ml-3">
                    <a href="/incidents" class="text-cyber-blue hover:text-opacity-80 text-sm">View</a>
                </div>
            </div>
        `).join('');
    }

    renderRecentIndicators(indicators) {
        const container = document.getElementById('recent-indicators');
        if (!container) return;

        if (indicators.length === 0) {
            container.innerHTML = '<p class=\"text-gray-400 text-sm\">No recent indicators</p>';
            return;
        }

        container.innerHTML = indicators.map(indicator => `
            <div class="flex items-center justify-between p-3 bg-dark-border bg-opacity-30 rounded-lg hover:bg-opacity-50 transition-colors">
                <div class="flex-1">
                    <h4 class="font-medium text-white truncate">${this.escapeHtml(indicator.value || 'N/A')}</h4>
                    <div class="flex items-center space-x-2 mt-1">
                        <span class="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">${indicator.indicatorType || indicator.type || 'Unknown'}</span>
                        <span class="text-xs text-gray-400">Confidence: ${indicator.confidence || 0}%</span>
                    </div>
                </div>
                <div class="ml-3">
                    <a href="/indicators" class="text-cyber-blue hover:text-opacity-80 text-sm">View</a>
                </div>
            </div>
        `).join('');
    }

    initCharts() {
        this.initThreatLevelChart();
        this.initTimelineChart();
    }

    initThreatLevelChart() {
        const ctx = document.getElementById('threatLevelChart');
        if (!ctx) return;

        const severityCounts = this.data.incidents.reduce((acc, incident) => {
            const severity = incident.severity || 'Unknown';
            acc[severity] = (acc[severity] || 0) + 1;
            return acc;
        }, {});

        this.charts.threatLevel = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(severityCounts),
                datasets: [{
                    data: Object.values(severityCounts),
                    backgroundColor: [
                        '#ef4444', // Critical - red
                        '#f97316', // High - orange
                        '#eab308', // Medium - yellow
                        '#22c55e', // Low - green
                        '#6b7280'  // Unknown - gray
                    ],
                    borderColor: '#1a1b23',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    initTimelineChart() {
        const ctx = document.getElementById('timelineChart');
        if (!ctx) return;

        // Generate last 7 days of data
        const days = [];
        const incidentCounts = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            const count = this.data.incidents.filter(incident => {
                const incidentDate = incident.reportedDate || incident.date_discovered;
                if (!incidentDate) return false;
                const incidentDateStr = new Date(incidentDate).toISOString().split('T')[0];
                return incidentDateStr === dateStr;
            }).length;
            incidentCounts.push(count);
        }

        this.charts.timeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Incidents',
                    data: incidentCounts,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#9ca3af'
                        },
                        grid: {
                            color: 'rgba(156, 163, 175, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#9ca3af'
                        },
                        grid: {
                            color: 'rgba(156, 163, 175, 0.1)'
                        }
                    }
                }
            }
        });
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async checkSystemHealth() {
        try {
            const response = await fetch(`${this.apiBase}/health`);
            const health = await response.json();
            const statusElement = document.getElementById('system-status');
            
            if (statusElement) {
                if (response.ok && health.status === 'OK') {
                    statusElement.textContent = 'Online';
                    statusElement.className = 'ml-2 px-2 py-1 text-xs rounded-full bg-threat-low bg-opacity-20 text-threat-low';
                } else {
                    statusElement.textContent = 'Offline';
                    statusElement.className = 'ml-2 px-2 py-1 text-xs rounded-full bg-threat-critical bg-opacity-20 text-threat-critical';
                }
            }
        } catch (error) {
            console.error('Health check failed:', error);
            const statusElement = document.getElementById('system-status');
            if (statusElement) {
                statusElement.textContent = 'Error';
                statusElement.className = 'ml-2 px-2 py-1 text-xs rounded-full bg-threat-critical bg-opacity-20 text-threat-critical';
            }
        }
    }

    refresh() {
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
        
        // Reload data
        this.init();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new Dashboard();
    
    // Check system health every 30 seconds
    setInterval(() => {
        window.dashboard.checkSystemHealth();
    }, 30000);
    
    // Initial health check
    window.dashboard.checkSystemHealth();
});