import { useState } from "react";
import { useRouter } from "next/router";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export default function TrackingInput() {
    const [input, setInput] = useState("");
    const router = useRouter();

    const handleTrack = (e) => {
        e.preventDefault();
        if (input.trim().length > 3) {
            // GA4 Track
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'search', {
                    search_term: input.trim()
                });
            }
            router.push(`/order/${input.trim()}`);
        }
    };

    return (
        <section className="track-section">
            <div className="container">
                <h2 className="title">Track Your Order</h2>
                <p className="subtitle">Enter your Order ID (ORD-...) or Tracking Number (AWB)</p>

                <form onSubmit={handleTrack} className="track-form">
                    <div className="input-wrapper">
                        <Search size={20} color="#9CA3AF" />
                        <input
                            type="text"
                            placeholder="e.g. ORD-1715 or 123456789"
                            className="track-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="track-button"
                    >
                        Track
                    </button>
                </form>
            </div>

            <style jsx>{`
                .track-section {
                    background: #fff;
                    padding: 60px 20px;
                    border-top: 1px solid #f3f4f6;
                    border-bottom: 1px solid #f3f4f6;
                }
                
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    text-align: center;
                }

                .title {
                    font-size: 28px;
                    font-weight: 800;
                    color: #111827;
                    margin-bottom: 8px;
                    font-family: var(--font-heading);
                }

                .subtitle {
                    color: #6B7280;
                    margin-bottom: 32px;
                    font-size: 15px;
                }

                .track-form {
                    display: flex;
                    gap: 12px;
                    max-width: 480px;
                    margin: 0 auto;
                    flex-wrap: wrap;
                }

                .input-wrapper {
                    flex: 1;
                    background: #F9FAFB;
                    border: 1px solid #E5E7EB;
                    border-radius: 12px;
                    padding: 0 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 240px;
                    transition: all 0.2s ease;
                }

                .input-wrapper:focus-within {
                    border-color: #B1121B;
                    box-shadow: 0 0 0 4px rgba(177, 18, 27, 0.1);
                    background: #fff;
                }

                .track-input {
                    border: none;
                    background: transparent;
                    flex: 1;
                    padding: 16px 0;
                    font-size: 15px;
                    outline: none;
                    color: #1F2937;
                    width: 100%;
                }

                .track-button {
                    position: relative;
                    background: #000;
                    color: #fff;
                    border: none;
                    padding: 0 40px;
                    height: 52px;
                    border-radius: 6em; /* Pill shape */
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: all 0.2s;
                    overflow: hidden;
                    font-family: inherit;
                    display: inline-block;
                }

                .track-button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                }

                .track-button:active {
                    transform: translateY(-1px);
                    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
                }

                .track-button::after {
                    content: "";
                    display: inline-block;
                    height: 100%;
                    width: 100%;
                    border-radius: 100px;
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 0; /* Behind text but visible */
                    transition: all 0.4s;
                    background-color: rgba(255, 255, 255, 0.2);
                    pointer-events: none;
                }

                .track-button:hover::after {
                    transform: scaleX(1.4) scaleY(1.6);
                    opacity: 0;
                }

            `}</style>
        </section>
    );
}
