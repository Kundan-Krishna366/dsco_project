# Digital Logic Visualizer & Converter

A high-fidelity, real-time interactive tool built with Next.js and Tailwind CSS to visualize numeric conversions and combinational logic circuits. This tool specifically focuses on the transformation between Binary, Gray Code, and BCD (Binary Coded Decimal).

## Features

*   **Multi-Format Input:** Supports Decimal, Binary (0b), and Hexadecimal (0x) inputs up to 16-bit depth.
*   **Live Circuit Visualization:** An SVG-based dynamic logic diagram that maps Binary to Gray Code using orthogonal routing and real-time signal highlighting.
*   **Real-time Conversion:**
    *   **Binary (Base-2):** Standard MSB to LSB representation.
    *   **Gray Code:** Reflected binary code visualization.
    *   **BCD:** 8-4-2-1 digit-by-digit breakdown.
*   **Interactive UI:** Toggle between 4, 8, and 16-bit widths with immediate layout adjustment.
*   **Hardware Metrics:** Simulated propagation delay and gate count calculations based on the current bit-width.

## Technical Stack

*   **Framework:** Next.js (App Router)
*   **Styling:** Tailwind CSS with custom glassmorphism and glow effects.
*   **Icons:** Lucide React
*   **State Management:** React Hooks (useState, useMemo)
*   **Graphics:** Dynamic SVG for the circuit logic path.

## Logic Overview

### Binary to Gray Conversion
The visualizer implements the standard XOR chain logic:
*   $G_n = B_n$ (The most significant bit remains the same)
*   $G_i = B_{i+1} \oplus B_i$ (Each subsequent Gray bit is the XOR of the current and previous binary bits)



### BCD (Binary Coded Decimal)
Converts each decimal digit into its own 4-bit binary nibble (8-4-2-1 weighted).

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <project-folder>
    ```

2.  **Install dependencies:**
    
```bash
    npm install lucide-react
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in browser:**
    Navigate to http://localhost:3000.

## UI Styles
The project uses a custom "Cyber-Grid" theme defined in the global styles:
*   **Glassmorphism:** backdrop-filter: blur(14px) with subtle borders.
*   **Signal Glow:** Green glow for HIGH (1) signals and Indigo for LOW (0) logic paths.
*   **Grid Background:** Procedural CSS background for a technical blueprint feel.

## License
This project is open-source and free to use for educational and development purposes.
```