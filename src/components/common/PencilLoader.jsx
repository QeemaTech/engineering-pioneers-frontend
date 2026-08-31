import React from "react";

/**
 * PencilLoader Component - Orange Engineering Pioneers Theme
 * 
 * @param {Object} props
 * @param {string|number} [props.size=120] - Size in pixels (e.g. 80, 120, 160)
 * @param {string} [props.text] - Optional loading message shown underneath
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.fullPage=false] - If true, renders centered in full viewport
 */
export default function PencilLoader({
  size = 120,
  text,
  className = "",
  fullPage = false,
}) {
  const dimension = typeof size === "number" ? `${size}px` : size;

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: dimension, height: dimension }}
        viewBox="0 0 200 200"
        className="pencil-loader"
      >
        <defs>
          <clipPath id="pencil-eraser-clip">
            <rect height="30" width="30" ry="5" rx="5" />
          </clipPath>
        </defs>

        {/* Drawn Circle Stroke (Track) */}
        <circle
          strokeLinecap="round"
          strokeDashoffset="439.82"
          strokeDasharray="439.82 439.82"
          strokeWidth="2.5"
          stroke="currentColor"
          className="pencil-loader__stroke text-[#EE7C11]/80 dark:text-[#EE7C11]"
          fill="none"
          r="70"
        />

        {/* Animated Pencil Body Group */}
        <g className="pencil-loader__rotate">
          {/* Main Pencil Body Striped Circles */}
          <g fill="none">
            {/* Center Orange Body */}
            <circle
              strokeDashoffset="402"
              strokeDasharray="402.12 402.12"
              strokeWidth="30"
              stroke="#EE7C11" /* Primary Brand Orange */
              r="64"
              className="pencil-loader__body1"
            />
            {/* Highlight Outer Orange Strip */}
            <circle
              strokeDashoffset="465"
              strokeDasharray="464.96 464.96"
              strokeWidth="10"
              stroke="#FFA043" /* Bright Highlight Orange */
              r="74"
              className="pencil-loader__body2"
            />
            {/* Darker Inner Orange Shadow Strip */}
            <circle
              strokeDashoffset="339"
              strokeDasharray="339.29 339.29"
              strokeWidth="10"
              stroke="#C45C06" /* Deep Shadow Orange */
              r="54"
              className="pencil-loader__body3"
            />
          </g>

          {/* Eraser & Metal Ferrule */}
          <g className="pencil-loader__eraser">
            <g className="pencil-loader__eraser-skew">
              {/* Rubber Eraser Top */}
              <rect height="30" width="30" ry="5" rx="5" fill="#FF8C52" />
              <rect clipPath="url(#pencil-eraser-clip)" height="30" width="5" fill="#F06424" />

              {/* Metal Ferrule Band */}
              <rect height="20" width="30" fill="#E2E8F0" />
              <rect height="20" width="15" fill="#CBD5E1" />
              <rect height="20" width="5" fill="#94A3B8" />

              {/* Metal Band Grooves */}
              <rect height="2" width="30" y="6" fill="rgba(15, 23, 42, 0.25)" />
              <rect height="2" width="30" y="13" fill="rgba(15, 23, 42, 0.25)" />
            </g>
          </g>

          {/* Pencil Point (Wood Cone & Lead Tip) */}
          <g className="pencil-loader__point">
            {/* Light Wood */}
            <polygon points="15 0, 30 30, 0 30" fill="#FDE68A" />
            {/* Darker Wood Shadow */}
            <polygon points="15 0, 6 30, 0 30" fill="#F59E0B" />
            {/* Graphite Lead Tip (Brand Orange Tint) */}
            <polygon points="15 0, 20 10, 10 10" fill="#883800" />
          </g>
        </g>
      </svg>

      {text ? (
        <span className="animate-pulse text-xs font-bold tracking-wide text-slate-600 dark:text-slate-300">
          {text}
        </span>
      ) : null}

      <style>{`
        .pencil-loader {
          display: block;
          overflow: visible;
        }

        .pencil-loader__body1,
        .pencil-loader__body2,
        .pencil-loader__body3,
        .pencil-loader__eraser,
        .pencil-loader__eraser-skew,
        .pencil-loader__point,
        .pencil-loader__rotate,
        .pencil-loader__stroke {
          animation-duration: 3s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .pencil-loader__body1,
        .pencil-loader__body2,
        .pencil-loader__body3 {
          transform: rotate(-90deg);
        }

        .pencil-loader__body1 {
          animation-name: pencilLoaderBody1;
        }

        .pencil-loader__body2 {
          animation-name: pencilLoaderBody2;
        }

        .pencil-loader__body3 {
          animation-name: pencilLoaderBody3;
        }

        .pencil-loader__eraser {
          animation-name: pencilLoaderEraser;
          transform: rotate(-90deg) translate(49px, 0);
          transform-origin: 51px 50px;
        }

        .pencil-loader__eraser-skew {
          animation-name: pencilLoaderEraserSkew;
          animation-timing-function: ease-in-out;
        }

        .pencil-loader__point {
          animation-name: pencilLoaderPoint;
          transform: rotate(-90deg) translate(49px, -30px);
          transform-origin: 51px 50px;
        }

        .pencil-loader__rotate {
          animation-name: pencilLoaderRotate;
          transform-origin: 100px 100px;
        }

        .pencil-loader__stroke {
          animation-name: pencilLoaderStroke;
          transform: translate(100px, 100px) rotate(-113deg);
        }

        /* Keyframes */
        @keyframes pencilLoaderBody1 {
          from,
          to {
            stroke-dashoffset: 351.86;
            transform: rotate(-90deg);
          }
          50% {
            stroke-dashoffset: 150.8;
            transform: rotate(-225deg);
          }
        }

        @keyframes pencilLoaderBody2 {
          from,
          to {
            stroke-dashoffset: 406.84;
            transform: rotate(-90deg);
          }
          50% {
            stroke-dashoffset: 174.36;
            transform: rotate(-225deg);
          }
        }

        @keyframes pencilLoaderBody3 {
          from,
          to {
            stroke-dashoffset: 296.88;
            transform: rotate(-90deg);
          }
          50% {
            stroke-dashoffset: 127.23;
            transform: rotate(-225deg);
          }
        }

        @keyframes pencilLoaderEraser {
          from,
          to {
            transform: rotate(-90deg) translate(49px, 0);
          }
          50% {
            transform: rotate(-225deg) translate(49px, 0);
          }
        }

        @keyframes pencilLoaderEraserSkew {
          from,
          32.5%,
          67.5%,
          to {
            transform: skewX(0);
          }
          35%,
          65% {
            transform: skewX(-4deg);
          }
          37.5%,
          62.5% {
            transform: skewX(8deg);
          }
          40%,
          45%,
          50%,
          55%,
          60% {
            transform: skewX(-15deg);
          }
          42.5%,
          47.5%,
          52.5%,
          57.5% {
            transform: skewX(15deg);
          }
        }

        @keyframes pencilLoaderPoint {
          from,
          to {
            transform: rotate(-90deg) translate(49px, -30px);
          }
          50% {
            transform: rotate(-225deg) translate(49px, -30px);
          }
        }

        @keyframes pencilLoaderRotate {
          from {
            transform: translate(100px, 100px) rotate(0);
          }
          to {
            transform: translate(100px, 100px) rotate(720deg);
          }
        }

        @keyframes pencilLoaderStroke {
          from {
            stroke-dashoffset: 439.82;
            transform: translate(100px, 100px) rotate(-113deg);
          }
          50% {
            stroke-dashoffset: 164.93;
            transform: translate(100px, 100px) rotate(-113deg);
          }
          75%,
          to {
            stroke-dashoffset: 439.82;
            transform: translate(100px, 100px) rotate(112deg);
          }
        }
      `}</style>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-950/80">
        {content}
      </div>
    );
  }

  return content;
}
