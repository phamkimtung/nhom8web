import type React from "react"

interface IconProps {
  className?: string
}

export const ShirtIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 4h1.5c.83 0 1.5.67 1.5 1.5S18.33 7 17.5 7H16v13H8V7H6.5C5.67 7 5 6.33 5 5.5S5.67 4 6.5 4H8V3c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v1zm-2 0V3h-4v1h4z" />
  </svg>
)

export const PantsIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 2h8v7l-2 11h-4l-2-11V2zm2 2v5h4V4h-4zm-1 7l1.5 9h3l1.5-9H9z" />
  </svg>
)

export const DressIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C10.9 2 10 2.9 10 4v1H8l-2 3v12h12V8l-2-3h-2V4c0-1.1-.9-2-2-2zm0 2c.55 0 1 .45 1 1v1h-2V4c0-.55.45-1 1-1zm-4 4h8l1 1.5V20H7V9.5L8 8z" />
  </svg>
)

export const SkirtIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C10.9 2 10 2.9 10 4v2H8l-1 14h10l-1-14h-2V4c0-1.1-.9-2-2-2zm0 2c.55 0 1 .45 1 1v2h-2V4c0-.55.45-1 1-1zm-3 4h6l.8 12H8.2L9 8z" />
  </svg>
)

export const ShoesIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M2 18h20v2H2v-2zm1.15-4.05L4 12l.85 1.95L6.7 16H2l1.15-2.05zM22 16h-4.7l1.85-2.05L20 12l.85 1.95L22 16zm-9-4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
  </svg>
)

export const AccessoryIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
  </svg>
)
