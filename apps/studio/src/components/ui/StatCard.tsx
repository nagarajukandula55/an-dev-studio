/**
 * ============================================================================
 * AN Dev Studio — StatCard
 * ============================================================================
 */

import React from "react";
import { Card } from "./Card";

interface StatCardProps {
    label:   string;
    value:   string | number;
    icon?:   React.ReactNode;
    trend?:  { value: string; positive: boolean };
    color?:  string;
}

export function StatCard({ label, value, icon, trend, color }: StatCardProps) {
    return (
        <Card>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                {icon && (
                    <div style={{
                        width:        "38px",
                        height:       "38px",
                        borderRadius: "10px",
                        background:   color
                            ? `color-mix(in srgb, ${color} 12%, transparent)`
                            : "var(--color-bg-subtle)",
                        display:      "flex",
                        alignItems:   "center",
                        justifyContent: "center",
                        color:        color ?? "var(--color-accent)",
                        flexShrink:   0,
                    }}>
                        {icon}
                    </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize:  "12px",
                        color:     "var(--color-text-muted)",
                        marginBottom: "4px",
                    }}>
                        {label}
                    </div>
                    <div style={{
                        fontSize:   "22px",
                        fontWeight: 700,
                        color:      "var(--color-text)",
                        lineHeight: 1.2,
                    }}>
                        {value}
                    </div>
                    {trend && (
                        <div style={{
                            fontSize:  "11.5px",
                            color:     trend.positive ? "#16a34a" : "#dc2626",
                            marginTop: "4px",
                            fontWeight: 500,
                        }}>
                            {trend.positive ? "↑" : "↓"} {trend.value}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
