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
    hash = "sha256-nlaiCon8I3H3CL4urMzr+1WXIUv2tlcFUWc5mFPORuU=";
  };

  buildPhase = ''
    mkdir $out
    pnpm build
    cp -r dist $out
  '';
}
