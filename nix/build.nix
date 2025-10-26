{
  stdenv,
  nodejs,
  pnpm,
  mermaid-cli,
  system,
  myResume,
}:
stdenv.mkDerivation rec {
  pname = "404wolf.com";
  version = "0.1.0";
  src = ../.;

  buildInputs = [
    mermaid-cli
    nodejs
    pnpm.configHook
  ];

  pnpmDeps = pnpm.fetchDeps {
    inherit pname version src;
    hash = "sha256-Thl9eMaGx5C4N7fJoi5wO1XkSCNFQqiKWE1AZbFJG+o=";
  };

  SHOW_UPDATED = "false";
  FETCH_RESUME = "false";

  buildPhase = ''
    mkdir $out
    pnpm build

    mkdir -p $out/dist/public
    cp -r dist $out
    cp ${myResume.packages.${system}.default} $out/dist/public/resume.pdf
  '';
}
