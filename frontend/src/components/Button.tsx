import React from "react"

export const Button = ({ onClick , children}: {onClick: () => void, children: React.ReactNode }) => {
        return (
            <button
                onClick={onClick}
                className="relative group px-8 py-4 text-lg md:text-xl text-white font-semibold rounded-xl
                bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600
                shadow-[0_10px_30px_rgba(99,102,241,0.45)]
                hover:shadow-[0_20px_40px_rgba(99,102,241,0.65)]
                transition-all duration-300 ease-out overflow-hidden"
            >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(255,255,255,0.25),transparent_40%)]" />
                <span className="absolute -inset-1 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600" />
                <span className="relative z-10 tracking-wide drop-shadow">{children}</span>
            </button>
        );
}