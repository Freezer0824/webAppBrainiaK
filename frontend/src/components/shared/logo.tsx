type LogoProps = {
  size?: number;
  withGlow?: boolean;
};

export function Logo({ size = 36, withGlow = false }: LogoProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl ${
        withGlow ? "shadow-glow-md" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <img
        src="/src/assets/logo-brainiak.png"
        alt="Brainiak"
        className="h-full w-full object-contain opacity-90 hover:opacity-100 transition"
      />
    </div>
  );
}