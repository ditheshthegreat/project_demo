/**
 * @file feedSettings.vo.ts
 * @module Community/Domain/ValueObjects
 * @layer Domain
 * @description Feed Settings Value Object
 * 
 * Represents user-specific feed preferences (separate from onboarding).
 */

export interface FeedSettingsProps {
  /** Interests to filter feed content */
  interests: string[];
  
  /** Accessibility needs for feed content */
  accessibilityNeeds: string[];
  
  /** Maximum distance for location-based content (in km) */
  distanceKm: number;
  
  /** Visibility filters for feed */
  visibilityFilters: {
    showPublicPosts: boolean;
    showFriendsPosts: boolean;
    showNearbyPosts: boolean;
  };
}

/**
 * Feed Settings Value Object
 * 
 * Immutable value object representing feed preferences.
 */
export class FeedSettings {
  private constructor(private readonly props: FeedSettingsProps) {}

  /**
   * Create FeedSettings from properties
   */
  public static create(props: Partial<FeedSettingsProps>): FeedSettings {
    return new FeedSettings({
      interests: props.interests || [],
      accessibilityNeeds: props.accessibilityNeeds || [],
      distanceKm: props.distanceKm || 50, // Default 50km
      visibilityFilters: props.visibilityFilters || {
        showPublicPosts: true,
        showFriendsPosts: true,
        showNearbyPosts: true,
      },
    });
  }

  /**
   * Create default feed settings
   */
  public static createDefault(): FeedSettings {
    return FeedSettings.create({});
  }

  public get interests(): string[] {
    return [...this.props.interests];
  }

  public get accessibilityNeeds(): string[] {
    return [...this.props.accessibilityNeeds];
  }

  public get distanceKm(): number {
    return this.props.distanceKm;
  }

  public get visibilityFilters(): FeedSettingsProps['visibilityFilters'] {
    return { ...this.props.visibilityFilters };
  }

  /**
   * Convert to JSON-serializable object
   */
  public toJSON(): FeedSettingsProps {
    return {
      interests: this.interests,
      accessibilityNeeds: this.accessibilityNeeds,
      distanceKm: this.distanceKm,
      visibilityFilters: this.visibilityFilters,
    };
  }

  /**
   * Create from JSON
   */
  public static fromJSON(json: any): FeedSettings {
    return FeedSettings.create({
      interests: json.interests || [],
      accessibilityNeeds: json.accessibilityNeeds || [],
      distanceKm: json.distanceKm || 50,
      visibilityFilters: json.visibilityFilters || {
        showPublicPosts: true,
        showFriendsPosts: true,
        showNearbyPosts: true,
      },
    });
  }
}
