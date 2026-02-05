import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

const TrustCoin = ({ width = 120, height = 120, staticMode = false }) => {
    // Refs for interaction
    const coinRef = useRef(null);
    const [style, setStyle] = useState({});
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Mobile Check
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleMouseMove = (e) => {
        if (staticMode || isMobile) return;

        const { left, top, width: rectWidth, height: rectHeight } = coinRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / rectWidth - 0.5;
        const y = (e.clientY - top) / rectHeight - 0.5;

        // Subtle rotation (max 6deg Y, 4deg X)
        setStyle({
            transform: `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 8}deg) scale(1.03)`,
            filter: `drop-shadow(${x * -10}px ${y * 10 + 10}px 12px rgba(0,0,0,0.3))`
        });
    };

    const handleMouseLeave = () => {
        if (staticMode || isMobile) return;
        setStyle({
            transform: 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)',
            filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))'
        });
    };

    // Default Static / Initial Style
    const defaultStyle = {
        transform: 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)',
        filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.4s ease',
        cursor: staticMode ? 'default' : 'default',
        willChange: 'transform, filter',
        display: 'inline-block',
        position: 'relative',
        zIndex: 10
    };

    return (
        <div
            ref={coinRef}
            className="trust-coin-container"
            width={width}
            height={height}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ ...defaultStyle, ...style, width, height }}
        >
            <Image
                src="/images/coin/kasturi-coin.png"
                alt="Kasturi Trust Coin"
                width={width}
                height={height}
                priority={false} // Lazy load usually, unless in critical path
                className="trust-coin-img"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none' // Let hover pass through to container
                }}
            />
        </div>
    );
};

export default TrustCoin;
