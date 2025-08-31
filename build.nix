{
  stdenv,
  nodejs,
  pnpm,
}:
stdenv.mkDerivation rec {
  pname = "404wolf.com";
  version = "0.1.0";
  src = ./.;

  nativeBuildInputs = [
    nodejs
    pnpm.configHook
  ];

  pnpmDeps = pnpm.fetchDeps {
    inherit pname version src;
    hash = "sha256-rT+hHRO1Ds+TMA8XboRYty0wI28emjsWO+BMEK0wQZg=";
  };

  buildPhase = ''
    pnpm build
  '';
}
