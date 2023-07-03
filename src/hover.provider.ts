import * as vscode from "vscode";

import { CMakeWrapper } from "./cmake";
import {
  cmFunctionInsertText,
  cmModuleInsertText,
  cmPropetryInsertText,
  cmVariableInsertText,
} from "./completion.provider";
import { cmakeTypeFromvscodeKind, CMakeType, suggestionsHelper } from "./utils";

const rstToMd = (rst: string): string => {
  // Remove the first line
  let output = rst.split("\n").slice(1).join("\n");

  // Code blocks
  output = output.replace(/``(.*)``/g, (match) => `\`${match}\``);

  // Headers
  output = output.replace(/^(.*\n)[\^]+$/gm, (match) => `### ${match}`);

  return output;
};

// Show Tooltip on mouse over
export class CMakeHoverProvider implements vscode.HoverProvider {
  public constructor(
    private readonly cmake: CMakeWrapper,
    private readonly output: vscode.OutputChannel
  ) {
    this.output.appendLine("Hover provider created");
  }

  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): Promise<vscode.Hover> {
    const range = document.getWordRangeAtPosition(position);
    const value = document.getText(range);

    const results = await Promise.all([
      this.getCommandSuggestions(value),
      this.getVariableSuggestions(value),
      this.getModuleSuggestions(value),
      this.getPropertySuggestions(value),
    ]);

    const suggestions = results.flat();

    if (suggestions.length == 0) {
      throw new Error("No suggestions found for " + value);
    }

    const help = await this.cmake.getHelpForType(
      suggestions[0].label,
      cmakeTypeFromvscodeKind(suggestions[0].kind)
    );

    return new vscode.Hover(new vscode.MarkdownString(rstToMd(help)));
  }

  private async getCommandSuggestions(
    word: string
  ): Promise<vscode.CompletionItem[]> {
    const list = await this.cmake.getListOfType(CMakeType.Command);

    return suggestionsHelper(
      list.filter((item) => item === word),
      CMakeType.Command,
      cmFunctionInsertText
    );
  }

  private async getVariableSuggestions(
    word: string
  ): Promise<vscode.CompletionItem[]> {
    const list = await this.cmake.getListOfType(CMakeType.Variable);

    return suggestionsHelper(
      list.filter((item) => item === word),
      CMakeType.Variable,
      cmVariableInsertText
    );
  }

  private async getPropertySuggestions(
    word: string
  ): Promise<vscode.CompletionItem[]> {
    const list = await this.cmake.getListOfType(CMakeType.Property);

    return suggestionsHelper(
      list.filter((item) => item === word),
      CMakeType.Property,
      cmPropetryInsertText
    );
  }

  private async getModuleSuggestions(
    word: string
  ): Promise<vscode.CompletionItem[]> {
    const list = await this.cmake.getListOfType(CMakeType.Module);

    return suggestionsHelper(
      list.filter((item) => item === word),
      CMakeType.Module,
      cmModuleInsertText
    );
  }
}
