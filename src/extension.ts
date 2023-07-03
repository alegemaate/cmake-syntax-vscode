import * as vscode from "vscode";

import { CMakeWrapper } from "./cmake";
import { CMakeHoverProvider } from "./hover.provider";
import { CMakeCompletionItemProvider } from "./completion.provider";

export const activate = (context: vscode.ExtensionContext) => {
  const CMAKE_LANGUAGE = "cmake";

  const cmakeWrapper = new CMakeWrapper();
  const channel = vscode.window.createOutputChannel("cmake-syntax-vscode");

  channel.appendLine("cmake-tools is now active!");

  const hover = vscode.languages.registerHoverProvider(
    CMAKE_LANGUAGE,
    new CMakeHoverProvider(cmakeWrapper, channel)
  );

  const completionItem = vscode.languages.registerCompletionItemProvider(
    CMAKE_LANGUAGE,
    new CMakeCompletionItemProvider(cmakeWrapper, channel)
  );

  context.subscriptions.push(hover, completionItem);
};
