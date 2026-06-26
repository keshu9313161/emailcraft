import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface EmailSettings {
    defaultTone: string;
    signOff: string;
    fullName: string;
    company: string;
    jobTitle: string;
    defaultPronouns: string;
}
export interface EmailEntry {
    id: bigint;
    subject: string;
    createdAt: bigint;
    tone: string;
    emailBody: string;
    recipientName: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearHistory(): Promise<void>;
    deleteEmail(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHistory(): Promise<Array<EmailEntry>>;
    getSettings(): Promise<EmailSettings | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasHistory(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveEmail(subject: string, recipientName: string, tone: string, emailBody: string): Promise<EmailEntry>;
    saveSettings(settings: EmailSettings): Promise<void>;
}
