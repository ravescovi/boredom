"use server";

import { selectProvider } from "@bordon-ai/ai";
import { runGenerateAction, type ActionState } from "./runGenerateAction";

const provider = selectProvider(process.env);

export async function generateGameAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runGenerateAction(formData, { provider });
}
