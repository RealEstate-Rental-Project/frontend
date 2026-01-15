export interface TenantScore {
    trust_score: number; // 0-100
    risk_category: string; // "Safe", "Moderate", "Risky"
    recommendation: string; // "Approve", "Review Manually"
}
