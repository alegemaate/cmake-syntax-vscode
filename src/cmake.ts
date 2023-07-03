import * as childProcess from "child_process";
import * as vscode from "vscode";

import { CMakeType, commandArgs2Array } from "./utils";

const CMAKE_COMMANDS = {
  list: {
    [CMakeType.Command]: "--help-command-list",
    [CMakeType.Variable]: "--help-variable-list",
    [CMakeType.Property]: "--help-property-list",
    [CMakeType.Module]: "--help-module-list",
  },
  details: {
    [CMakeType.Command]: "--help-command",
    [CMakeType.Variable]: "--help-variable",
    [CMakeType.Property]: "--help-property",
    [CMakeType.Module]: "--help-module",
  },
};

export class CMakeWrapper {
  private cache: Record<CMakeType, string[]> = {
    [CMakeType.Command]: [],
    [CMakeType.Variable]: [],
    [CMakeType.Property]: [],
    [CMakeType.Module]: [],
  };

  public async getListOfType(type: CMakeType): Promise<string[]> {
    if (this.cache[type].length > 0) {
      return this.cache[type];
    }

    const result = await this.execute([CMAKE_COMMANDS.list[type]]);
    this.cache[type] = result.split("\n").filter((item) => item);
    return this.cache[type];
  }

  public async getHelpForType(name: string, type: CMakeType): Promise<string> {
    try {
      const result = await this.getListOfType(type);

      const contains = result.includes(name);

      if (!contains) {
        throw new Error("not found");
      }

      return this.execute([CMAKE_COMMANDS.details[type], name]);
    } catch (e) {
      console.error(e);
      return "";
    }
  }

  private async execute(args: string[]): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const cmakeConfig = vscode.workspace
        .getConfiguration("cmake")
        .get<string>("cmakePath", "cmake");

      const cmakeArgs = commandArgs2Array(cmakeConfig);

      const [cmakePath, ...cmakeArgsRest] = [
        ...cmakeArgs,
        ...args.map((arg) => arg.replace(/\r/gm, "")),
      ];

      const cmd = childProcess.spawn(cmakePath, cmakeArgsRest);

      let stdout = "";

      cmd.stdout.on("data", (data: string) => {
        const txt = data.toString();
        stdout += txt.replace(/\r/gm, "");
      });

      cmd.on("error", (error) => {
        if ((error as unknown as Error & { code: string }).code === "ENOENT") {
          void vscode.window.showInformationMessage(
            'The "cmake" command is not found in PATH.  Install it or use `cmake.cmakePath` in the workspace settings to define the CMake executable binary.'
          );
        }

        reject();
      });

      cmd.on("exit", () => {
        resolve(stdout);
      });
    });
  }
}
