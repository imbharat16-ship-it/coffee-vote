// Data Collection and UTM Tracking Script
// This script handles UTM parameter capture and data storage

class UTMTracker {
    constructor() {
        this.utmData = null;
        this.init();
    }
    
    init() {
        this.captureUTMParameters();
        this.setupFormIntegration();
        this.setupDataExport();
    }
    
    captureUTMParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        this.utmData = {
            source: urlParams.get('utm_source') || '',
            medium: urlParams.get('utm_medium') || '',
            campaign: urlParams.get('utm_campaign') || '',
            content: urlParams.get('utm_content') || '',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            landingPage: window.location.href
        };
        
        // Store in localStorage for persistence
        localStorage.setItem('coffee_vote_utm', JSON.stringify(this.utmData));
        
        // Store in sessionStorage for current session
        sessionStorage.setItem('coffee_vote_utm', JSON.stringify(this.utmData));
        
        console.log('UTM Parameters captured:', this.utmData);
        
        return this.utmData;
    }
    
    getUTMData() {
        if (this.utmData) {
            return this.utmData;
        }
        
        const stored = localStorage.getItem('coffee_vote_utm');
        return stored ? JSON.parse(stored) : null;
    }
    
    setupFormIntegration() {
        // Listen for form submissions
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'notion-form-submit') {
                this.handleFormSubmission(event.data);
            }
        });
        
        // Alternative: Listen for form interactions
        document.addEventListener('click', (event) => {
            if (event.target.matches('iframe')) {
                this.trackFormInteraction();
            }
        });
    }
    
    handleFormSubmission(formData) {
        const utmData = this.getUTMData();
        const submissionData = {
            ...formData,
            utm: utmData,
            submissionTime: new Date().toISOString()
        };
        
        console.log('Form submission with UTM data:', submissionData);
        
        // Store submission data
        this.storeSubmissionData(submissionData);
        
        // Send to analytics (if needed)
        this.sendToAnalytics(submissionData);
    }
    
    storeSubmissionData(data) {
        const submissions = JSON.parse(localStorage.getItem('coffee_vote_submissions') || '[]');
        submissions.push(data);
        localStorage.setItem('coffee_vote_submissions', JSON.stringify(submissions));
    }
    
    sendToAnalytics(data) {
        // Placeholder for analytics integration
        // You can integrate with Google Analytics, Mixpanel, etc.
        console.log('Sending to analytics:', data);
    }
    
    setupDataExport() {
        // Add export functionality
        window.exportUTMData = () => {
            const utmData = this.getUTMData();
            const submissions = JSON.parse(localStorage.getItem('coffee_vote_submissions') || '[]');
            
            const exportData = {
                utm: utmData,
                submissions: submissions,
                exportTime: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `coffee_vote_data_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };
    }
    
    // Method to get all stored data
    getAllData() {
        return {
            utm: this.getUTMData(),
            submissions: JSON.parse(localStorage.getItem('coffee_vote_submissions') || '[]'),
            pageViews: JSON.parse(localStorage.getItem('coffee_vote_pageviews') || '[]')
        };
    }
    
    // Method to clear all data
    clearAllData() {
        localStorage.removeItem('coffee_vote_utm');
        localStorage.removeItem('coffee_vote_submissions');
        localStorage.removeItem('coffee_vote_pageviews');
        sessionStorage.removeItem('coffee_vote_utm');
    }
}

// Initialize UTM tracker when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.utmTracker = new UTMTracker();
    
    // Track page view
    const pageView = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent
    };
    
    const pageViews = JSON.parse(localStorage.getItem('coffee_vote_pageviews') || '[]');
    pageViews.push(pageView);
    localStorage.setItem('coffee_vote_pageviews', JSON.stringify(pageViews));
});

// Export functions for global access
window.getUTMData = () => window.utmTracker?.getUTMData();
window.getAllData = () => window.utmTracker?.getAllData();
window.clearAllData = () => window.utmTracker?.clearAllData();
