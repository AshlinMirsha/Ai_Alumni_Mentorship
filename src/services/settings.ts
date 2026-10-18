import type { UserSettings } from "@/types";
import {
  loadUserSettings,
  saveUserSettings,
  resetUserSettings,
} from "@/lib/dashboard-storage";

export interface ISettingsService {
  getSettings(): Promise<UserSettings>;
  updateSettings(settings: UserSettings): Promise<void>;
  resetSettings(): Promise<UserSettings>;
}

export class MockSettingsService implements ISettingsService {
  async getSettings(): Promise<UserSettings> {
    return loadUserSettings();
  }

  async updateSettings(settings: UserSettings): Promise<void> {
    saveUserSettings(settings);
  }

  async resetSettings(): Promise<UserSettings> {
    return resetUserSettings();
  }
}

export const settingsService = new MockSettingsService();
