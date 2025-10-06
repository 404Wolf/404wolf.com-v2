{
  stdenv,
  nodejs,
  pnpm,
  git,
  system,
  myResume,
}:
stdenv.mkDerivation rec {
  pname = "404wolf.com";
  version = "0.1.0";
  src = ./.;

  buildInputs = [
    git
    nodejs
    pnpm.configHook
  ];

  pnpmDeps = pnpm.fetchDeps {
    inherit pname version src;
    hash = "sha256-5+wQt56XvrKF5WeU6nxdXYKzhg4pPWROzIDOb4k0NwU=";
  };

  buildPhase = ''
    mkdir $out
    pnpm build

    mkdir -p $out/dist/public
    cp -r dist $out
    cp ${myResume.packages.${system}.default} $out/dist/public/resume.pdf
  '';
}
