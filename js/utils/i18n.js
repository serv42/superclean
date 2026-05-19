export let currentLang = localStorage.getItem('superclean_lang') || 'de';

export const translations = {
    de: {
        new_protocol: "Neues Protokoll",
        history: "Historie",
        settings: "Einstellungen",
        title: "Reinigungsprotokoll",
        subtitle: "Für Airbnb & Ferienwohnungen",
        property: "Objekt / Adresse",
        cleaner: "Reinigungskraft",
        date: "Datum",
        add: "Neu",
        issues: "Probleme / Schäden gefunden?",
        photos: "Fotos von Problemen (optional)",
        upload_photos: "Fotos hier klicken oder ziehen",
        signature: "Unterschrift der Reinigungskraft",
        clear: "Löschen",
        save_signature: "Unterschrift speichern",
        signature_saved: "Unterschrift gespeichert ✓",
        save: "Protokoll speichern",
        pdf: "PDF herunterladen",
        email: "Per E-Mail senden",
        last_cleaned: "Letzte Reinigung",
        history_title: "Protokoll-Historie",
        settings_title: "Einstellungen",
        settings_subtitle: "Admin-Bereich (PIN: 12351235)",
        saved_success: "Protokoll gespeichert!",
        saved_desc: "Das Protokoll wurde lokal gespeichert.",
        close: "Schließen",
        to_history: "Zur Historie",
        issues_placeholder: "z.B. Waschmaschine macht Geräusche..."
    },
    en: {
        new_protocol: "New Protocol",
        history: "History",
        settings: "Settings",
        title: "Cleaning Protocol",
        subtitle: "For Airbnb & Holiday Homes",
        property: "Property / Address",
        cleaner: "Cleaning Staff",
        date: "Date",
        add: "Add",
        issues: "Issues / Damages Found?",
        photos: "Photos of Issues (optional)",
        upload_photos: "Click or drag photos here",
        signature: "Cleaner Signature",
        clear: "Clear",
        save_signature: "Save Signature",
        signature_saved: "Signature saved ✓",
        save: "Save Protocol",
        pdf: "Download PDF",
        email: "Send by Email",
        last_cleaned: "Last cleaned",
        history_title: "Protocol History",
        settings_title: "Settings",
        settings_subtitle: "Admin Area (PIN: 12351235)",
        saved_success: "Protocol saved!",
        saved_desc: "Protocol saved locally.",
        close: "Close",
        to_history: "Go to History",
        issues_placeholder: "e.g. Washing machine making noise..."
    }
};

export function t(key) {
    return translations[currentLang]?.[key] || key;
}

export function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('superclean_lang', lang);
}