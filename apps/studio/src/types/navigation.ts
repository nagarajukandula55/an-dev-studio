/**
 * ============================================================================
 * AN Dev Studio — Navigation Types
 * ============================================================================
 */

export interface NavItem {
    id:       string;
    label:    string;
    href:     string;
    icon:     string; // icon name
    badge?:   string | number;
    external?: boolean;
}

export interface NavSection {
    id:    string;
    label?: string;
    items: NavItem[];
}

export type ThemeMode = "light" | "dark" | "system";
