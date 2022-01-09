//
// Record
//

import { Field } from "./Field";
import { RecordDefinition } from "./RecordDefinition";

export class Record {
  public fields: Field[] = [];

  constructor(public readonly definition: RecordDefinition) {}

  public get size(): number {
    return this.fields.reduce((sum, { size }) => sum + size, 0);
  }

  public getFieldByName(fieldName: string): Field | undefined {
    return this.fields.find((f) => f.definition.name === fieldName);
  }
}
