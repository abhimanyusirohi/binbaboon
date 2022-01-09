//
// RepeatedRecordDefinition
// Prototype for a repeated record
//

import { RecordDefinition } from "./RecordDefinition";

export class RepeatedRecordDefinition extends RecordDefinition {
  public repeatCount: number | string = 0;
}
