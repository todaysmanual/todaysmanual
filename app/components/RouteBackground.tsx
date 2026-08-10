export function RouteBackground() {
  return (
    <div className="route-scene" aria-hidden="true">
      <div className="route-parallax route-parallax--back">
        <svg className="route-map" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
          <g className="route-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <line key={`v-${index}`} x1={160 + index * 180} y1="70" x2={160 + index * 180} y2="930" />
            ))}
            {Array.from({ length: 5 }).map((_, index) => (
              <line key={`h-${index}`} x1="70" y1={140 + index * 180} x2="1530" y2={140 + index * 180} />
            ))}
          </g>

          <g className="routes">
            <path
              className="route route--solid"
              d="M-80 165 C 250 150, 255 425, 570 425 S 920 250, 1280 420"
            />
            <path
              className="route route--dashed"
              d="M-110 830 C 235 820, 270 600, 590 615 S 895 690, 1280 420"
            />
            <path
              className="route route--fine"
              d="M230 -80 C 265 170, 515 150, 610 325 S 845 555, 1280 420"
            />
            <path
              className="route route--short"
              d="M1590 750 C 1475 715, 1415 560, 1280 420"
            />
          </g>

          <g className="waypoints">
            <circle cx="570" cy="425" r="5" />
            <circle cx="590" cy="615" r="5" />
            <circle cx="610" cy="325" r="5" />
            <circle cx="925" cy="540" r="4" />
          </g>

          <g className="destination" transform="translate(1280 420)">
            <circle
              className="destination__pulse"
              r="26"
            />
            <circle className="destination__ring" r="12" />
            <circle className="destination__core" r="4" />
            <path className="destination__arrow" d="M20 -2 L31 -2 L25 -8 M31 -2 L25 4" />
          </g>

          <g className="travellers">
            <circle r="3">
              <animateMotion dur="12s" repeatCount="indefinite" path="M-80 165 C 250 150, 255 425, 570 425 S 920 250, 1280 420" />
            </circle>
            <circle r="2.5">
              <animateMotion dur="15s" begin="-6s" repeatCount="indefinite" path="M-110 830 C 235 820, 270 600, 590 615 S 895 690, 1280 420" />
            </circle>
          </g>
        </svg>
      </div>

      <div className="route-ring route-ring--one" />
      <div className="route-ring route-ring--two" />
      <div className="coordinate coordinate--top">05°33&apos;N / 00°12&apos;W</div>
      <div className="coordinate coordinate--side">FORWARD / 001</div>
    </div>
  );
}
