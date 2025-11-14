// Threat Feeds JavaScript Module
class FeedsManager {
    constructor() {
        this.apiBase = '/api/sources';
        this.currentPage = 0;
        this.pageSize = 9; // 3x3 grid
        this.filters = {};
        this.editingId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFeeds();
    }

    setupEventListeners() {
        // Filter inputs
        document.getElementById('search-input').addEventListener('input', this.debounce(() => {
            this.filters.search = document.getElementById('search-input').value;
            this.currentPage = 0;
            this.loadFeeds();
        }, 300));

        document.getElementById('type-filter').addEventListener('change', () => {
            this.filters.type = document.getElementById('type-filter').value;
            this.currentPage = 0;
            this.loadFeeds();
        });

        document.getElementById('status-filter').addEventListener('change', () => {
            this.filters.status = document.getElementById('status-filter').value;
            this.currentPage = 0;
            this.loadFeeds();
        });

        document.getElementById('reliability-filter').addEventListener('change', () => {
            this.filters.reliability = document.getElementById('reliability-filter').value;
            this.currentPage = 0;
            this.loadFeeds();
        });

        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadFeeds();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            this.currentPage++;
            this.loadFeeds();
        });

        // Modal controls
        document.getElementById('add-feed-btn').addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('feed-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveFeed();
        });

        // Close modal on outside click
        document.getElementById('feed-modal').addEventListener('click', (e) => {
            if (e.target.id === 'feed-modal') {
                this.closeModal();
            }
        });
    }

    async loadFeeds() {
        try {
            showLoading();
            const params = new URLSearchParams({
                limit: this.pageSize,
                offset: this.currentPage * this.pageSize,
                ...this.filters
            });

            const response = await fetch(`${this.apiBase}?${params}`);
            if (!response.ok) throw new Error('Failed to load feeds');
            
            const data = await response.json();
            this.renderFeeds(data.data || []);
            this.updatePagination(data.meta || {});
            hideLoading();
        } catch (error) {
            console.error('Error loading feeds:', error);
            showError('Failed to load threat feeds');
            hideLoading();
        }
    }

    renderFeeds(feeds) {
        const container = document.getElementById('feeds-container');
        if (!container) return;

        if (feeds.length === 0) {
            container.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="text-lg">No threat feeds found</p>
                    <p class="text-sm">Try adjusting your filters or add a new feed</p>
                </div>
            `;
            return;
        }

        container.innerHTML = feeds.map(feed => `
            <div class="card p-6 hover:border-cyber-blue transition-all duration-300">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-2">
                        <span class="w-3 h-3 rounded-full ${this.getStatusDot(feed.isActive !== false ? 'active' : 'inactive')}"></span>
                        <h3 class="font-semibold text-white truncate">${this.escapeHtml(feed.sourceName || feed.name || 'Unknown')}</h3>
                    </div>
                    <span class="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">${this.escapeHtml(feed.sourceType || feed.type || 'Unknown')}</span>
                </div>
                
                <p class="text-gray-400 text-sm mb-4 line-clamp-2">${this.escapeHtml(feed.description || 'No description available')}</p>
                
                <div class="space-y-2 mb-4">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Reliability:</span>
                        <span class="text-white font-medium">${feed.reliabilityScore || 0}/10</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">URL:</span>
                        <span class="text-cyber-green font-medium text-xs truncate max-w-[150px]">${feed.url ? feed.url.substring(0, 30) + '...' : 'N/A'}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Updated:</span>
                        <span class="text-gray-300">${this.formatDate(feed.lastChecked || feed.last_updated)}</span>
                    </div>
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-dark-border">
                    <span class="status-badge ${this.getStatusClass(feed.isActive !== false ? 'active' : 'inactive')}">
                        ${feed.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                    <div class="flex space-x-2">
                        <button onclick="feedsManager.editFeed('${feed._id}')" class="text-cyber-blue hover:text-opacity-80 text-sm">
                            Edit
                        </button>
                        <button onclick="feedsManager.deleteFeed('${feed._id}')" class="text-threat-critical hover:text-opacity-80 text-sm">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getStatusDot(status) {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-threat-low';
            case 'maintenance': return 'bg-threat-medium';
            case 'error': return 'bg-threat-critical';
            default: return 'bg-gray-500';
        }
    }

    getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'active': return 'status-active';
            case 'maintenance': return 'severity-medium';
            case 'error': return 'severity-critical';
            default: return 'status-inactive';
        }
    }

    getReliabilityColor(reliability) {
        switch (reliability?.toLowerCase()) {
            case 'very high': return 'text-threat-low';
            case 'high': return 'text-cyber-green';
            case 'medium': return 'text-threat-medium';
            case 'low': return 'text-threat-high';
            default: return 'text-gray-400';
        }
    }

    updatePagination(meta) {
        const showingStart = document.getElementById('showing-start');
        const showingEnd = document.getElementById('showing-end');
        const totalCount = document.getElementById('total-count');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        const start = meta.offset + 1;
        const end = Math.min(meta.offset + meta.limit, meta.total);

        if (showingStart) showingStart.textContent = meta.total > 0 ? start : 0;
        if (showingEnd) showingEnd.textContent = end;
        if (totalCount) totalCount.textContent = meta.total || 0;

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 0;
            prevBtn.classList.toggle('opacity-50', this.currentPage === 0);
        }

        if (nextBtn) {
            nextBtn.disabled = !meta.hasMore;
            nextBtn.classList.toggle('opacity-50', !meta.hasMore);
        }
    }

    openModal(feed = null) {
        const modal = document.getElementById('feed-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('feed-form');
        
        if (feed) {
            this.editingId = feed.id;
            title.textContent = 'Edit Threat Feed';
            this.populateForm(feed);
        } else {
            this.editingId = null;
            title.textContent = 'Add Threat Feed';
            form.reset();
        }
        
        modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('feed-modal');
        modal.classList.add('hidden');
        this.editingId = null;
    }

    populateForm(feed) {
        document.getElementById('feed-name').value = feed.name || '';
        document.getElementById('feed-type').value = feed.type || 'MISP';
        document.getElementById('feed-url').value = feed.url || '';
        document.getElementById('feed-frequency').value = feed.update_frequency || '';
        document.getElementById('feed-reliability').value = feed.reliability || 'Medium';
        document.getElementById('feed-organization').value = feed.source_organization || '';
        document.getElementById('feed-format').value = feed.format || '';
        document.getElementById('feed-description').value = feed.description || '';
    }

    async saveFeed() {
        try {
            const formData = {
                name: document.getElementById('feed-name').value,
                type: document.getElementById('feed-type').value,
                url: document.getElementById('feed-url').value,
                update_frequency: document.getElementById('feed-frequency').value,
                reliability: document.getElementById('feed-reliability').value,
                source_organization: document.getElementById('feed-organization').value,
                format: document.getElementById('feed-format').value,
                description: document.getElementById('feed-description').value
            };

            const url = this.editingId ? `${this.apiBase}/${this.editingId}` : this.apiBase;
            const method = this.editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save feed');
            }

            this.closeModal();
            this.loadFeeds();
            showSuccess(this.editingId ? 'Feed updated successfully' : 'Feed created successfully');
        } catch (error) {
            console.error('Error saving feed:', error);
            showError(error.message);
        }
    }

    async editFeed(id) {
        try {
            const response = await fetch(`${this.apiBase}/${id}`);
            if (!response.ok) throw new Error('Failed to load feed');
            
            const feed = await response.json();
            this.openModal(feed);
        } catch (error) {
            console.error('Error loading feed:', error);
            showError('Failed to load feed details');
        }
    }

    async deleteFeed(id) {
        if (!confirm('Are you sure you want to delete this threat feed?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete feed');
            }

            this.loadFeeds();
            showSuccess('Feed deleted successfully');
        } catch (error) {
            console.error('Error deleting feed:', error);
            showError(error.message);
        }
    }

    clearFilters() {
        this.filters = {};
        this.currentPage = 0;
        document.getElementById('search-input').value = '';
        document.getElementById('type-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('reliability-filter').value = '';
        this.loadFeeds();
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Utility functions
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function showError(message) {
    console.error(message);
    alert(`Error: ${message}`);
}

function showSuccess(message) {
    console.log(message);
    // Could implement a toast notification here
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.feedsManager = new FeedsManager();
});