import React from 'react'
import { Ban, Hammer, MapPin } from 'lucide-react'

export default function BenefitBadges() {
    return (
        <section className="benefits-strip">
            <div className="safe-container">

                {/* BADGE 1 */}
                <div className="badge-item">
                    <div className="icon-box">
                        <Ban size={24} strokeWidth={2.5} />
                    </div>
                    <span className="badge-text">No Artificial Color</span>
                </div>

                {/* BADGE 2 */}
                <div className="badge-item">
                    <div className="icon-box">
                        <Hammer size={24} strokeWidth={2.5} />
                    </div>
                    <span className="badge-text">Traditionally Pounded</span>
                </div>

                {/* BADGE 3 */}
                <div className="badge-item">
                    <div className="icon-box">
                        <MapPin size={24} strokeWidth={2.5} />
                    </div>
                    <span className="badge-text">Made in Kolhapur</span>
                </div>

            </div>

            <style jsx>{`
        .benefits-strip {
            width: 100%;
            background: #FFFBF7; /* Match Hero bg or slightly distinct */
            padding: 32px 24px;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .safe-container {
            max-width: 1000px;
            margin: 0 auto;
            display: flex;
            justify-content: center;
            gap: 48px;
            flex-wrap: wrap; /* Safety wrap */
        }

        .badge-item {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .icon-box {
            color: #DC2626; /* Brand Red Token */
            display: flex;
            align-items: center;
            justify-content: center;
            /* STATIC ICONS - NO HOVER */
        }

        .badge-text {
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 15px;
            color: #475569;
            white-space: nowrap;
        }

        @media (max-width: 768px) {
            .benefits-strip {
                padding: 16px 24px; /* Reduced vertical padding */
            }
            .safe-container {
                flex-direction: column;
                align-items: flex-start; /* Left align on mobile for readability */
                gap: 16px;
                max-width: 320px; /* Constrain width for centering if needed, or leave usually */
                margin: 0 auto; 
            }
            .badge-item {
                width: 100%;
            }
        }
      `}</style>
        </section>
    )
}
