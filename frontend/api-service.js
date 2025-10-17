// Wellness Arcade API Service
// Handles all communication with the FastAPI backend

class WellnessAPI {
    constructor() {
        // Auto-detect environment: use current domain for production, localhost for development
        const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        this.baseURL = isProduction ? '' : 'http://localhost:8000';
        this.sessionToken = localStorage.getItem('sessionToken') || null;
    }

    // Helper method to make API requests
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add session token if available
        if (this.sessionToken) {
            config.headers['Authorization'] = `Bearer ${this.sessionToken}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async register(username, email, password) {
        const response = await this.makeRequest('/api/register/', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        return response;
    }

    async login(username, password) {
        const response = await this.makeRequest('/api/login/', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (response.session_token) {
            this.sessionToken = response.session_token;
            localStorage.setItem('sessionToken', this.sessionToken);
        }
        
        return response;
    }

    async logout() {
        if (this.sessionToken) {
            await this.makeRequest('/api/logout/', {
                method: 'POST',
                body: JSON.stringify({ session_token: this.sessionToken })
            });
            this.sessionToken = null;
            localStorage.removeItem('sessionToken');
        }
    }

    async getUserProfile() {
        return await this.makeRequest('/api/user/');
    }

    async getDailyTip() {
        return await this.makeRequest('/api/tip/');
    }

    // Hydration game methods
    async logHydration(glasses = 1) {
        return await this.makeRequest('/api/hydration/log/', {
            method: 'POST',
            body: JSON.stringify({ glasses })
        });
    }

    async getHydrationStatus() {
        return await this.makeRequest('/api/hydration/status/');
    }

    async resetHydration() {
        return await this.makeRequest('/api/hydration/reset/', {
            method: 'POST'
        });
    }

    // Brushing game methods
    async logBrushing(sessionType) {
        return await this.makeRequest('/api/brushing/log/', {
            method: 'POST',
            body: JSON.stringify({ session_type: sessionType })
        });
    }

    async getBrushingStatus() {
        return await this.makeRequest('/api/brushing/status/');
    }

    async getBrushingDetailed() {
        return await this.makeRequest('/api/brushing/detailed/');
    }

    async resetBrushing() {
        return await this.makeRequest('/api/brushing/reset/', {
            method: 'POST'
        });
    }

    // Breathing exercise methods
    async logBreathing(durationSeconds = 30) {
        return await this.makeRequest('/api/breathing/log/', {
            method: 'POST',
            body: JSON.stringify({ duration_seconds: durationSeconds })
        });
    }

    async getBreathingStatus() {
        return await this.makeRequest('/api/breathing/status/');
    }

    // Brain puzzle methods
    async getPuzzles() {
        return await this.makeRequest('/api/puzzles/');
    }

    async submitPuzzleResponse(puzzleId, userSequence, correct) {
        return await this.makeRequest('/api/puzzles/submit/', {
            method: 'POST',
            body: JSON.stringify({
                puzzle_id: puzzleId,
                user_sequence: userSequence,
                correct: correct
            })
        });
    }

    async getPuzzleStatus() {
        return await this.makeRequest('/api/puzzles/status/');
    }

    // Mood Watch methods
    async getEmotionStatus() {
        return await this.makeRequest('/api/emotions/status/');
    }
    async getEmotionScenario() {
        return await this.makeRequest('/api/emotions/session/');
    }

    async logEmotion(scenarioId, selectedMood) {
        return await this.makeRequest('/api/emotions/log/', {
            method: 'POST',
            body: JSON.stringify({
                scenario_id: scenarioId,
                selected_mood: selectedMood
            })
        });
    }

    async getEmotionTip(mood) {
        return await this.makeRequest(`/api/emotions/tip/?mood=${mood}`);
    }

    // Affirmation Builder methods
    async getAffirmationStatus() {
        return await this.makeRequest('/api/affirmations/status/');
    }

    async getAffirmationWords() {
        return await this.makeRequest('/api/affirmations/words/');
    }

    async submitAffirmation(words, generatedAffirmation) {
        return await this.makeRequest('/api/affirmations/submit/', {
            method: 'POST',
            body: JSON.stringify({
                words: words,
                generated_affirmation: generatedAffirmation
            })
        });
    }

    async generateAffirmation(words) {
        const wordsString = words.join(',');
        return await this.makeRequest(`/api/affirmations/generate/?words=${wordsString}`);
    }

    async getAffirmationHistory() {
        return await this.makeRequest('/api/affirmations/history/');
    }

    // Utility methods
    isAuthenticated() {
        return this.sessionToken !== null;
    }

    async testConnection() {
        try {
            const response = await this.makeRequest('/api/ping/');
            return response.message === 'API is working';
        } catch (error) {
            return false;
        }
    }

    async resetAllStats() {
        try {
            const response = await this.makeRequest('/api/stats/reset/', {
                method: 'POST'
            });
            return response;
        } catch (error) {
            console.error('Failed to reset stats:', error);
            throw new Error('Failed to reset stats: ' + error.message);
        }
    }
}

// Create global API instance
const api = new WellnessAPI();
