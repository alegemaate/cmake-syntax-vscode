import * as vscode from "vscode";

import { CMakeWrapper } from "./cmake";
import { cmakeTypeFromvscodeKind, CMakeType, suggestionsHelper } from "./utils";

export const cmModuleInsertText = (module: string) => {
  if (module.startsWith("Find")) {
    return "find_package(" + module.replace("Find", "") + "${1: REQUIRED})";
  }

  return "include(" + module + ")";
};

export const cmFunctionInsertText = (func: string) => {
  const scopedFunctions = ["if", "function", "while", "macro", "foreach"];
  const isScoped = scopedFunctions.some((name) => func === name);

  if (isScoped) {
    return func + "(${1})\n\t\nend" + func + "(${1})\n";
  }

  return func + "(${1})";
};

export const cmVariableInsertText = (variable: string) =>
  variable.replace(/<(.*)>/g, "${1:<$1>}");

export const cmPropetryInsertText = (variable: string) =>
  variable.replace(/<(.*)>/g, "${1:<$1>}");

export class CMakeCompletionItemProvider
  implements vscode.CompletionItemProvider
{
  public constructor(
    private readonly cmake: CMakeWrapper,
    private readonly output: vscode.OutputChannel
  ) {
    this.output.appendLine("Completion provider created");
  }

  public async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): Promise<vscode.CompletionItem[]> {
    const wordAtPosition = document.getWordRangeAtPosition(position);
    let currentWord = "";

    if (wordAtPosition && wordAtPosition.start.character < position.character) {
      const word = document.getText(wordAtPosition);
      const end = position.character - wordAtPosition.start.character;
      currentWord = word.substring(0, end);
    }

    const results = await Promise.all([
      this.getCommandSuggestions(currentWord),
      this.getVariableSuggestions(currentWord),
      this.getPropertySuggestions(currentWord),
      this.getModuleSuggestions(currentWord),
    ]);

    return results.flat();
  }

  public async resolveCompletionItem(
    item: vscode.CompletionItem,
    _token: vscode.CancellationToken
  ): Promise<vscode.CompletionItem> {
    const type = cmakeTypeFromvscodeKind(item.kind);
    const result = await this.cmake.getHelpForType(item.label, type);
    item.documentation = result.split("\n")[3];
    return item;
  }

  private async getCommandSuggestions(
    word: string
  ): Promise<vscode.CompletionItem[]> {
    const list = await this.cmake.getListOfType(CMakeType.Command);

    return suggestionsHelper(
      list.filter((item) => item.includes(word)),
      CMakeType.Command,
      cmFunctionInsertText
    );
  }

  private async getVariableSuggestions(
    word: string
  ): Promise<vscode.CompletionItem[]> {
    const list = await this.cmake.getListOfType(CMakeType.Variable);

    return suggestionsHelper(
      list.filter((item) => item.includes(word)),
      CMakeType.Variable,
      cmVariableInsertText
    );
  }

  private async getPropertySuggestions(
    word: string
  ): Promise<vscode.CompletionItem[]> {
    const list = await this.cmake.getListOfType(CMakeType.Property);

    return suggestionsHelper(
      list.filter((item) => item.includes(word)),
      CMakeType.Property,
      cmPropetryInsertText
    );
  }

  private async getModuleSuggestions(
    word: string
  ): Promise<vscode.CompletionItem[]> {
    const list = await this.cmake.getListOfType(CMakeType.Module);

    return suggestionsHelper(
      list.filter((item) => item.includes(word)),
      CMakeType.Module,
      cmModuleInsertText
    );
  }
}
