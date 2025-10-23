import React, { useState } from "react";
import { Button, InputNumber, Switch, message } from "antd";
import { userService } from "../services/userService";

export default function UserSettings({ userSettings, setUserSettings, loading, note }) {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        try {
            setSaving(true);
            await userService.updateSettings(userSettings);

            note.success({
                message: "Settings saved",
                description: "Your preferences were successfully updated.",
                placement: "topRight",
            });
        } catch (err) {
            console.error("Failed to save settings:", err);
            note.error({
                message: "Save failed",
                description: err.message || "Could not save your settings. Try again later.",
                placement: "topRight",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Loading settings...</p>;

    return (
        <div className="settings-panel">
            <p><b>Geo settings:</b></p>

            <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <Switch
                    checked={userSettings.useGeolocation}
                    onChange={(checked) =>
                        setUserSettings({ ...userSettings, useGeolocation: checked })
                    }
                />
                Use browser geolocation
            </label>

            {!userSettings.useGeolocation && (
                <div style={{ marginTop: 12 }}>
                    <label>Set your default location manually:</label>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <InputNumber
                            style={{ width: "50%" }}
                            placeholder="Latitude"
                            value={userSettings.lat}
                            onChange={(val) =>
                                setUserSettings({ ...userSettings, lat: val ?? null })
                            }
                            step={0.0001}
                        />
                        <InputNumber
                            style={{ width: "50%" }}
                            placeholder="Longitude"
                            value={userSettings.lon}
                            onChange={(val) =>
                                setUserSettings({ ...userSettings, lon: val ?? null })
                            }
                            step={0.0001}
                        />
                    </div>

                    <small style={{ color: "#888" }}>
                        Example: Kyiv — Lat 50.4501, Lon 30.5234
                    </small>
                </div>
            )}

            <div style={{ marginTop: 16 }}>
                <Button type="primary" onClick={handleSave}>
                    Save
                </Button>
            </div>
        </div>
    );
}
