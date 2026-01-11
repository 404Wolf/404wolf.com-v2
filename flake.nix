{
  description = "Wolf's Personal Website";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    myResume = {
      url = "github:404wolf/resume-v2";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      ...
    }@inputs:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        tree-fmt-cfg = inputs.treefmt-nix.lib.evalModule pkgs {
          projectRootFile = "flake.nix";
          programs.nixfmt.enable = true;
          programs.biome.enable = true;
          programs.yamlfmt.enable = true;
        };
      in
      {
        packages.default = pkgs.callPackage ./nix/build.nix { inherit (self.inputs) myResume; };
        devShells.default = pkgs.mkShell {
          CLOUDFLARE_ACCOUNT_ID = "02e54289e54c9bca7d99203f8df8c230";
          PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true";
          PUPPETEER_EXECUTABLE_PATH = "${pkgs.chromium}/bin/chromium";
          packages = with pkgs; [
            nodejs_24
            pnpm
            typescript
            nil
            nixd
            nixfmt-rfc-style
            (pkgs.writeShellScriptBin "mmdc" ''
              exec ${pkgs.mermaid-cli}/bin/mmdc -p puppeteer-config.json "$@"
            '')
            chromium
          ];
        };
        formatter = tree-fmt-cfg.config.build.wrapper;
        checks = {
          formatting = tree-fmt-cfg.config.build.check self;
        };
      }
    );
}
