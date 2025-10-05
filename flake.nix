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
        packages.default = pkgs.callPackage ./build.nix { inherit (self.inputs) myResume; };
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            pnpm
            biome
            typescript
            nil
            nixd
            nixfmt
          ];
        };
        formatter = tree-fmt-cfg.config.build.wrapper;
        checks = {
          formatting = tree-fmt-cfg.config.build.check self;
        };
      }
    );
}
