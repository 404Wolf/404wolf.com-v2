{
  stdenv,
  nodejs,
  pnpm,
  mermaid-cli,
  fontconfig,
  writeShellScriptBin,
  ungoogled-chromium,
  system,
  myResume,
}:
stdenv.mkDerivation rec {
  pname = "404wolf.com";
  version = "0.1.0";
  src = ../.;

  buildInputs = [
    (writeShellScriptBin "mmdc" ''
      exec ${mermaid-cli}/bin/mmdc -p puppeteer-config.json "$@"
    '')
    nodejs
    pnpm.configHook
  ];

  pnpmDeps = pnpm.fetchDeps {
    inherit pname version src;
    hash = "sha256-h6Y17DY1dTjuS1Hx3M+9RDvJe/yBqUIu5NBmLORHHLA=";
  };

  SHOW_UPDATED = "false";
  FETCH_RESUME = "false";
  PUPPETEER_EXECUTABLE_PATH = "${ungoogled-chromium}/bin/chromium";

  buildPhase = ''
    export FONTCONFIG_PATH=${fontconfig.out}/etc/fonts
    export FONTCONFIG_FILE=${fontconfig.out}/etc/fonts/fonts.conf

    mkdir $out
    pnpm build

    mkdir -p $out/dist/public
    cp -r dist $out
    cp ${myResume.packages.${system}.default} $out/dist/public/resume.pdf
  '';
}
