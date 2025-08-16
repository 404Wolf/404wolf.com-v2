{
  stdenv,
  nodejs,
  pnpm,
  runtimeShell,
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

  installPhase = ''
      mkdir -p $out/share/${pname}

      cp -r dist/* $out/share/${pname}/

      mkdir -p $out/bin
      cat > $out/bin/${pname} << EOF
      #!${runtimeShell}
      exec ${nodejs}/bin/node ${placeholder "out"}/share/${pname}/server.js "\$@"
    EOF
      chmod +x $out/bin/${pname}
  '';
}
