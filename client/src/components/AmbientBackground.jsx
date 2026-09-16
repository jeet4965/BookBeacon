import React from 'react';

const AmbientBackground = () => {
    return (
        <div
            aria-hidden="true"
            className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-obsidian-950"
        >
            {/* Top-Right Neon Violet Orb */}
            <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-neon-violet/15 blur-[128px]" />

            {/* Bottom-Left Neon Cyan Orb */}
            <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-neon-cyan/10 blur-[128px]" />

            {/* Center Subtle Accent Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-neon-pink/5 blur-[140px]" />

            {/* Subtle Tech Matrix Grid Overlay */}
            <div 
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />
        </div>
    );
};

export default AmbientBackground;