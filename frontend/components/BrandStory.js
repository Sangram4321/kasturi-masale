import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

const STORY = {
  en: {
    heading: "From Kolhapur, to Your Kitchen",
    body: [
      "Kasturi Masale is not a factory brand.",
      "It began in a Kolhapur household, where masala was first pounded on a sil-batta — slowly, thoughtfully, with understanding.",
      "Today, we use modern pounding machines, but the taste remains unchanged.",
      "Because the process matters more than the tool.",
      "For over 25 years, our father prepared masalas for local Kolhapur customers — never selling outside.",
      "Today, Sangram Madhukar Patil carries that same legacy forward through Kasturi Masale, under The Spice Emperor.",
      "Kasturi Kanda Lasun Masala is not just spicy — it stays with you."
    ]
  },

  hi: {
    heading: "कोल्हापुर से, आपके रसोई तक",
    body: [
      "कस्तूरी मसाले कोई फैक्ट्री ब्रांड नहीं है।",
      "इसकी शुरुआत कोल्हापुर के घर से हुई — जहाँ मसाला पहले सिलबट्टे पर कूटा जाता था, समझदारी से।",
      "आज हम मशीन से कूटते हैं, लेकिन स्वाद वही रखते हैं।",
      "क्योंकि तरीका औज़ार से ज़्यादा मायने रखता है।",
      "२५ सालों तक हमारे पिता कोल्हापुर में स्थानीय ग्राहकों के लिए मसाले बनाते रहे।",
      "आज वही परंपरा संग्राम मधुकर पाटिल कस्तूरी मसाले के ज़रिये आगे बढ़ा रहे हैं — The Spice Emperor के अंतर्गत।",
      "कस्तूरी कांदा लसूण मसाला सिर्फ तीखा नहीं — याद रह जाता है।"
    ]
  },

  mr: {
    heading: "कोल्हापूरातून, तुमच्या स्वयंपाकघरात",
    body: [
      "कस्तुरी मसाले हा कुठलाही फॅक्टरी ब्रँड नाही.",
      "याची सुरुवात कोल्हापूरच्या घरातून झाली — जिथे मसाला सिलबट्ट्यावर कुटला जायचा, समजून.",
      "आज आम्ही मशीन वापरतो, पण चव बदललेली नाही.",
      "कारण पद्धत ही साधनापेक्षा महत्त्वाची असते.",
      "२५ वर्षे आमचे वडील कोल्हापुरात स्थानिक ग्राहकांसाठी मसाले बनवत होते.",
      "आज तीच परंपरा संग्राम मधुकर पाटील कस्तुरी मसालेद्वारे पुढे नेत आहेत — The Spice Emperor अंतर्गत.",
      "कस्तुरी कांदा लसूण मसाला फक्त तिखट नाही — तो लक्षात राहतो."
    ]
  }
}

export default function BrandStory({ lang = "en" }) {
  const [activeLang, setActiveLang] = useState(lang)

  return (
    <section className="brandSection" style={styles.section}>
      <div style={styles.wrapper}>
        {/* ... content ... */}
      </div>
      <style jsx>{`
        .brandSection {
            padding: 40px 16px 80px; /* Mobile Safe Zone (16px) */
        }
        @media (min-width: 768px) {
            .brandSection {
                padding: 60px 32px 100px; /* Tablet Safe Zone (32px) */
            }
        }
      `}</style>
      <div style={styles.wrapper}>

        {/* LANGUAGE SWITCH */}
        <div style={styles.langSwitch}>
          {["en", "hi", "mr"].map(l => (
            <button
              key={l}
              onClick={() => setActiveLang(l)}
              style={{
                ...styles.langBtn,
                ...(activeLang === l ? styles.langActive : {})
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* GLASS CARD */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLang}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5, boxShadow: "0 40px 80px rgba(0,0,0,0.22)" }} // Lift effect
            style={styles.card}
          >
            <h2 style={styles.heading}>
              {STORY[activeLang].heading}
            </h2>

            <div style={styles.body}>
              {STORY[activeLang].body.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (i * 0.05), duration: 0.5 }}
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}

/* ================= STYLES ================= */

const styles = {
  section: {
    // padding handled by CSS .brandSection
    background: "#F7EFDB"
  },

  wrapper: {
    maxWidth: 820,
    margin: "0 auto"
  },

  langSwitch: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24
  },

  langBtn: {
    padding: "8px 18px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.4)",
    backdropFilter: "blur(8px)",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    opacity: 0.7
  },

  langActive: {
    background: "rgba(255,255,255,0.75)",
    opacity: 1,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
  },

  card: {
    padding: "40px 28px",
    borderRadius: 28,
    background: "rgba(255,255,255,0.55)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 30px 60px rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.6)"
  },

  heading: {
    fontSize: "clamp(22px, 4vw, 30px)",
    fontWeight: 700,
    marginBottom: 18,
    textAlign: "center",
    color: "#1f1f1f"
  },

  body: {
    fontSize: 15,
    lineHeight: 1.75,
    color: "#333",
    opacity: 0.9
  }
}
