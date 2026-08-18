{
  description = "LOTUSim UI frontend";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        dist = pkgs.buildNpmPackage {
          pname = "lotusim-ui-frontend-dist";
          version = "0.0.1";
          src = ./.;
          nodejs = pkgs.nodejs_22;

          npmDepsHash = "sha256-ZJkUArjMaL/tO4tpPedrXIgbnexbLGw4RS/IK09fEa8=";

          # .gitignore lists /dist, so npmInstallHook's default "npm pack" copy
          # would drop the build output — install it explicitly instead.
          installPhase = ''
            mkdir -p $out
            cp -r dist/. $out/
          '';
        };

        # Deep links are client-side routes (BrowserRouter) with no file behind
        # them, so the server needs the SPA fallback nginx.conf expresses as
        # try_files $uri $uri/ /index.html.
        frontend = pkgs.writeShellApplication {
          name = "lotusim-ui-frontend";
          runtimeInputs = [ pkgs.static-web-server ];
          text = ''
            exec static-web-server \
              --root "${dist}" \
              --page-fallback "${dist}/index.html" \
              --port "''${PORT:-8080}" \
              "$@"
          '';
        };
      in
      {
        packages = {
          inherit dist;
          default = frontend;
        };

        apps.default = {
          type = "app";
          program = "${frontend}/bin/lotusim-ui-frontend";
        };

        devShells.default = pkgs.mkShell {
          packages = [ pkgs.nodejs_22 ];
        };
      });
}
