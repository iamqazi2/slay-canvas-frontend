const WifiIcon = ({
  width = 24,
  height = 24,
  className = "text-gray-400",
}: {
  width?: number;
  height?: number;
  className?: string;
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M1 8.5L12 2L23 8.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 15.5L12 9.5L18 15.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="20" r="1" fill="currentColor" />
  </svg>
);

export default WifiIcon;
