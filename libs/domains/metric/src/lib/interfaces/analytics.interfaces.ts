/** Structure pour le décompte de métrique par pays. */
export interface CountryMetric {
  country: string;
  count: number;
  percentage?: number;
}

/** Structure pour les meilleurs contenus regardés en termes de temps. */
export interface TopWatchedContent {
  videoId: string;
  minutesWatched: number;
  platformSharePercentage: number;
}

/** Structure pour le rapport de performance des publicités. */
export interface AdPerformance {
  totalViews: number;
  topCountries: CountryMetric[];
}

/** Structure des métriques pour un contenu en location. */
export interface MovieRentalMetrics {
  totalRentals: number;
  totalRevenue: number;
  topCountries: CountryMetric[];
}

/** Structure des métriques pour un contenu en abonnement (streaming). */
export interface MovieSubscriptionMetrics {
  subscriberViewPercentage: number;
  totalViews: number;
  totalMinutesWatched: number;
  uniqueViewers: number;
}

/** Structure simplifiée retournée par groupBy pour le revenu */
export interface RevenuePerMovie {
  movieId: string;
  totalRevenue: number;
}

/** Structure simplifiée retournée par groupBy pour les vues */
export interface ViewCountPerVideo {
  videoId: string;
  viewCount: number;
}

/** Structure du revenu global avec progression. (Simplifiée ici) */
export interface MonthlyFinancialSummary {
  currentMonthRevenue: number;
  progressPercentage: number;
}

/** Structure pour le revenu par type et par période. (Simplifiée ici) */
export interface MonthlyRevenueBreakdown {
  location: number;
  abonnement: number;
}
