import * as vscode from "vscode";

export enum CMakeType {
  Command = "command",
  Variable = "variable",
  Module = "module",
  Property = "property",
}

export const vscodeKindFromCMakeCodeClass = (
  kind: CMakeType
): vscode.CompletionItemKind => {
  switch (kind) {
    case CMakeType.Command:
      return vscode.CompletionItemKind.Function;
    case CMakeType.Variable:
      return vscode.CompletionItemKind.Variable;
    case CMakeType.Module:
      return vscode.CompletionItemKind.Module;
    default:
      return vscode.CompletionItemKind.Property;
  }
};

export const cmakeTypeFromvscodeKind = (
  kind?: vscode.CompletionItemKind
): CMakeType => {
  switch (kind) {
    case vscode.CompletionItemKind.Function:
      return CMakeType.Command;
    case vscode.CompletionItemKind.Variable:
      return CMakeType.Variable;
    case vscode.CompletionItemKind.Module:
      return CMakeType.Module;
    default:
      return CMakeType.Property;
  }
};

export const commandArgs2Array = (text: string): string[] => {
  const re = /^"[^"]*"$/; // Check if argument is surrounded with double-quotes
  const re2 = /^([^"]|[^"].*?[^"])$/; // Check if argument is NOT surrounded with double-quotes

  const arr: string[] = [];
  let argPart: string | null = null;

  text.split(" ").forEach((arg) => {
    if ((re.test(arg) || re2.test(arg)) && !argPart) {
      arr.push(arg);
    } else {
      argPart = argPart ? argPart + " " + arg : arg;

      // If part is complete (ends with a double quote), we can add it to the array
      if (argPart.endsWith('"')) {
        arr.push(argPart);
        argPart = null;
      }
    }
  });

  return arr;
};

export const suggestionsHelper = (
  list: string[],
  type: CMakeType,
  insertText: (value: string) => string
): vscode.CompletionItem[] =>
  list.map((command) => {
    const item = new vscode.CompletionItem(command);
    item.kind = vscodeKindFromCMakeCodeClass(type);
    item.insertText = new vscode.SnippetString(insertText(command));
    return item;
  });
